// supabase/functions/buddy-ask/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { SYSTEM_PROMPT, buildPrompt } from "./prompt.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string" || question.trim().length === 0 || question.length > 500) {
      return Response.json(
        { error: "question required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY secret is not set");

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 128,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildPrompt(question) }],
      }),
    });

    const claudeData = await claudeRes.json();
    if (!claudeRes.ok || !claudeData.content) {
      throw new Error(`Claude failed: ${JSON.stringify(claudeData)}`);
    }
    if (!Array.isArray(claudeData.content) || claudeData.content.length === 0) {
      throw new Error(`Claude returned empty content: ${JSON.stringify(claudeData)}`);
    }

    const answer: string = claudeData.content[0].text;
    return Response.json({ answer }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "internal error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
