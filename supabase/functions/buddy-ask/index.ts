// supabase/functions/buddy-ask/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.ts";

const DEFAULT_CHAPTER_ID = 4;
const MATCH_COUNT = 4;
const SIMILARITY_THRESHOLD = 0.72;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Chunk = {
  id: string;
  page_number: number;
  content: string;
  similarity: number;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const start = Date.now();

  try {
    const body = await req.json();
    const chapterId: number = body.chapter_id ?? DEFAULT_CHAPTER_ID;

    // Determine input type and resolve question
    let question: string;
    let inputType: "text" | "voice";

    if (body.audio_base64 && body.audio_mime) {
      inputType = "voice";

      // Decode base64 audio and send to Whisper
      const binaryStr = atob(body.audio_base64 as string);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Determine file extension from MIME type
      const mimeToExt: Record<string, string> = {
        "audio/webm": "webm",
        "audio/mp4": "mp4",
        "audio/mpeg": "mp3",
        "audio/ogg": "ogg",
        "audio/wav": "wav",
        "audio/x-m4a": "m4a",
      };
      const ext = mimeToExt[body.audio_mime as string] ?? "webm";
      const filename = `audio.${ext}`;

      const formData = new FormData();
      formData.append(
        "file",
        new Blob([bytes], { type: body.audio_mime as string }),
        filename,
      );
      formData.append("model", "whisper-1");
      formData.append("language", "bs");

      const whisperRes = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          },
          body: formData,
        },
      );

      const whisperData = await whisperRes.json();
      if (!whisperRes.ok || !whisperData.text) {
        console.error("Whisper failed:", JSON.stringify(whisperData));
        return Response.json(
          { error: "Nisam mogao razumjeti snimak. Pokušaj ponovo." },
          { status: 422, headers: CORS_HEADERS },
        );
      }

      question = whisperData.text as string;
    } else if (body.question && typeof body.question === "string") {
      inputType = "text";
      question = body.question.trim();
    } else {
      return Response.json(
        { error: "question or audio_base64+audio_mime required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    if (!question || question.length === 0) {
      return Response.json(
        { error: "question required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Embed the question
    const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
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

    // 2. Retrieve chunks from pgvector
    const { data: rawChunks, error: searchError } = await supabase.rpc(
      "match_chunks",
      {
        query_embedding: embedding,
        chapter_filter: chapterId,
        match_count: MATCH_COUNT,
      },
    );
    if (searchError) throw searchError;

    const chunks: Chunk[] = (rawChunks ?? []).filter(
      (c: Chunk) => c.similarity > SIMILARITY_THRESHOLD,
    );

    const chunkIds = chunks.map((c) => c.id);

    // 3. Build prompt and call Claude
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 80,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(question, chunks) }],
      }),
    });
    const claudeData = await claudeRes.json();
    if (!claudeRes.ok || !claudeData.content) {
      throw new Error(`Claude failed: ${JSON.stringify(claudeData)}`);
    }
    if (
      !Array.isArray(claudeData.content) ||
      claudeData.content.length === 0
    ) {
      throw new Error(
        `Claude returned empty content: ${JSON.stringify(claudeData)}`,
      );
    }

    const answer: string = claudeData.content[0].text;

    // 4. Extract source page from answer (first cited page)
    const pageMatch = answer.match(/str\.\s*(\d+)/i);
    const sourcePage = pageMatch ? parseInt(pageMatch[1]) : null;

    const refused =
      answer.includes("To ne znam") ||
      answer.includes("nije u tvojoj knjizi") ||
      answer.includes("nije u poglavlju");

    const latencyMs = Date.now() - start;

    // 5. Log to buddy_ask_logs
    await supabase.from("buddy_ask_logs").insert({
      input_type: inputType,
      raw_question: question,
      retrieved_chunk_ids: chunkIds,
      answer,
      source_page: sourcePage,
      refused,
      latency_ms: latencyMs,
      model: "claude-sonnet-4-6",
    });

    return Response.json(
      { answer, ...(sourcePage !== null ? { source_page: sourcePage } : {}) },
      { headers: CORS_HEADERS },
    );
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "internal error" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
