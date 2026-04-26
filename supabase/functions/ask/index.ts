import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.ts";

const CHAPTER_ID = 4;
const TOP_K = 5;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-session-token",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const start = Date.now();

  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return Response.json({ error: "question required" }, { status: 400, headers: CORS_HEADERS });
    }

    const sessionToken = req.headers.get("x-session-token");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Rate limiting (skip if no session token — shouldn't happen in production)
    if (sessionToken) {
      const { data: rateRow } = await supabase
        .from("rate_limits")
        .select("count, window_start")
        .eq("session_token", sessionToken)
        .single();

      const now = Date.now();

      if (rateRow) {
        const windowAge = now - new Date(rateRow.window_start).getTime();
        if (windowAge < RATE_WINDOW_MS && rateRow.count >= RATE_LIMIT) {
          return Response.json(
            { error: "Postavio si puno pitanja danas. Odmori malo i vrati se sutra." },
            { status: 429, headers: CORS_HEADERS },
          );
        }

        const newCount = windowAge >= RATE_WINDOW_MS ? 1 : rateRow.count + 1;
        const newWindowStart = windowAge >= RATE_WINDOW_MS ? new Date().toISOString() : rateRow.window_start;

        await supabase
          .from("rate_limits")
          .update({ count: newCount, window_start: newWindowStart })
          .eq("session_token", sessionToken);
      } else {
        await supabase
          .from("rate_limits")
          .insert({ session_token: sessionToken, count: 1, window_start: new Date().toISOString() });
      }
    }

    // 2. Embed the question
    const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-large",
        input: question,
      }),
    });
    const embedData = await embedRes.json();
    if (!embedRes.ok || !embedData.data) {
      throw new Error(`OpenAI embed failed: ${JSON.stringify(embedData)}`);
    }
    const embedding = embedData.data[0].embedding;

    // 3. Retrieve top-k chunks from pgvector restricted to chapter 4
    const { data: chunks, error: searchError } = await supabase.rpc(
      "match_chunks",
      {
        query_embedding: embedding,
        chapter_filter: CHAPTER_ID,
        match_count: TOP_K,
      },
    );

    if (searchError) throw searchError;

    const chunkIds = chunks.map((c: { id: string }) => c.id);
    const chunkPages = chunks.map((c: { page_number: number }) => c.page_number);
    const chunkData = chunks.map((c: { content: string; page_number: number }) => ({
      content: c.content,
      page_number: c.page_number,
    }));

    // 4. Call Claude
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: buildUserPrompt(question, chunkData) },
        ],
      }),
    });
    const claudeData = await claudeRes.json();
    if (!claudeRes.ok || !claudeData.content) {
      throw new Error(`Claude failed: ${JSON.stringify(claudeData)}`);
    }
    const answer: string = claudeData.content[0].text;

    // 5. Citation verifier: extract page reference from answer, confirm it
    // matches a retrieved chunk page number
    const pageMatch = answer.match(/str\.\s*(\d+)/i);
    const citedPage = pageMatch ? parseInt(pageMatch[1]) : null;
    const citationValid = citedPage !== null && chunkPages.includes(citedPage);

    const refused = answer.includes("nije u tvojoj knjizi") ||
      answer.includes("nije u poglavlju");

    const latencyMs = Date.now() - start;

    // Build citations array: the chunk(s) whose page matches the cited page.
    const citations = citationValid
      ? chunkData
          .filter((c) => c.page_number === citedPage)
          .map((c) => ({ page: c.page_number, excerpt: c.content }))
      : [];

    // 6. Log the trace
    await supabase.from("ask_logs").insert({
      question,
      retrieved_chunk_ids: chunkIds,
      answer,
      citation_page: citationValid ? citedPage : null,
      refused,
      latency_ms: latencyMs,
      model: "claude-sonnet-4-6",
    });

    return Response.json(
      {
        answer,
        citations,
        confidence: citationValid ? "high" : refused ? "refused" : "low",
      },
      { headers: CORS_HEADERS },
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "internal error" }, { status: 500, headers: CORS_HEADERS });
  }
});
