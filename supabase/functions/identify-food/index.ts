const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const GROQ_MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct", // 빠르고 정확한 비전 모델
];
const OPENROUTER_MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
];
const GEMINI_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
const LOVABLE_MODEL = "google/gemini-3-flash-preview";
const LOVABLE_FALLBACK_MODEL = "google/gemini-2.5-flash";

const parseImage = (imageBase64: string) => {
  const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  return {
    mimeType: match?.[1] || "image/jpeg",
    data: match?.[2] || imageBase64,
  };
};

const extractJson = (content: string) => {
  try {
    return JSON.parse(content);
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
};

const fetchWithTimeout = async (url: string, init: RequestInit, ms = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    console.warn("AI provider request failed", error instanceof Error ? error.message : error);
    return new Response("AI provider request failed", { status: 504 });
  } finally {
    clearTimeout(id);
  }
};

const callGroq = async ({
  apiKey, model, systemPrompt, userText, imageBase64,
}: {
  apiKey: string; model: string; systemPrompt: string; userText: string; imageBase64: string;
}) => {
  const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
  const response = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  }, 12000);

  const text = await response.text();
  if (!response.ok) {
    console.warn("Groq identify failed", model, response.status, text.slice(0, 200));
    return { ok: false, status: response.status, content: text };
  }
  const data = JSON.parse(text);
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return { ok: true, status: response.status, content };
};

const callOpenRouter = async ({
  apiKey, model, systemPrompt, userText, imageBase64,
}: {
  apiKey: string; model: string; systemPrompt: string; userText: string; imageBase64: string;
}) => {
  const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
  const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://jeju-food-guide.vercel.app",
      "X-Title": "Jeju Food Guide",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `${systemPrompt}\n\n${userText}` },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  }, 12000);

  const text = await response.text();
  if (!response.ok) {
    console.warn("OpenRouter identify failed", model, response.status, text.slice(0, 200));
    return { ok: false, status: response.status, content: text };
  }
  const data = JSON.parse(text);
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return { ok: true, status: response.status, content };
};

const callGemini = async ({
  apiKey, model, systemPrompt, userText, imageBase64,
}: {
  apiKey: string; model: string; systemPrompt: string; userText: string; imageBase64: string;
}) => {
  const image = parseImage(imageBase64);
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userText }, { inline_data: { mime_type: image.mimeType, data: image.data } }] }],
        generationConfig: { temperature: 0.2, response_mime_type: "application/json" },
      }),
    },
    12000,
  );

  const text = await response.text();
  if (!response.ok) {
    console.warn("Gemini identify failed", model, response.status, text.slice(0, 200));
    return { ok: false, status: response.status, content: text };
  }
  const data = JSON.parse(text);
  const content = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("\n") ?? "";
  return { ok: true, status: response.status, content };
};

const callLovableAI = async ({
  apiKey, model, systemPrompt, userText, imageBase64,
}: {
  apiKey: string; model: string; systemPrompt: string; userText: string; imageBase64: string;
}) => {
  const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
  const response = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: [{ type: "text", text: userText }, { type: "image_url", image_url: { url: dataUrl } }] },
      ],
    }),
  }, 12000);

  const text = await response.text();
  if (!response.ok) {
    console.warn("Lovable AI identify failed", response.status, text.slice(0, 200));
    return { ok: false, status: response.status, content: text };
  }
  const data = JSON.parse(text);
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return { ok: true, status: response.status, content };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, language = "EN" } = await req.json();
    if (!imageBase64) return json({ error: "imageBase64 required" }, 400);

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GROQ_API_KEY && !OPENROUTER_API_KEY && !GEMINI_API_KEY && !LOVABLE_API_KEY) {
      return json({ error: "AI is not configured", code: "AI_UNAVAILABLE" });
    }

    const langMap: Record<string, string> = {
      EN: "English",
      KO: "Korean (한국어)",
      CN: "Simplified Chinese (简体中文)",
      JP: "Japanese (日本語)",
    };
    const langName = langMap[language] ?? "English";

    const systemPrompt =
      "You are an expert in Korean and Jeju cuisine identification. Carefully examine the dish in the image — note ingredients, garnish, sauce color, side dishes, and presentation style. Be especially careful to distinguish similar-looking dishes (e.g. 갈치조림 vs 고등어조림, 비빔밥 vs 돌솥비빔밥, 흑돼지 vs 일반 삼겹살). If unsure, lower the confidence. ALWAYS respond with ONLY a valid JSON object (no markdown, no code fences, no extra text) matching: {\"foodName\": string, \"englishName\": string, \"confidence\": number}. confidence is 0-100.";

    const userText = `Identify this food precisely. Look at colors, textures, ingredients, and serving style. Provide foodName in ${langName}, englishName in English (for matching), and a realistic confidence 0-100. Return ONLY JSON.`;

    let content = "";
    let lastStatus = 0;

    // 1순위: Groq (빠름, 일일 한도 없음)
    if (GROQ_API_KEY) {
      for (const model of GROQ_MODELS) {
        const result = await callGroq({ apiKey: GROQ_API_KEY, model, systemPrompt, userText, imageBase64 });
        lastStatus = result.status;
        if (result.ok) { content = result.content; break; }
        if (result.status === 429) break;
      }
    }
    // 2순위: Gemini
    if (!content && GEMINI_API_KEY) {
      for (const model of GEMINI_MODELS) {
        const result = await callGemini({ apiKey: GEMINI_API_KEY, model, systemPrompt, userText, imageBase64 });
        lastStatus = result.status;
        if (result.ok) { content = result.content; break; }
        if (result.status === 429) break;
      }
    }
    // 3순위: OpenRouter
    if (!content && OPENROUTER_API_KEY) {
      for (const model of OPENROUTER_MODELS) {
        const result = await callOpenRouter({ apiKey: OPENROUTER_API_KEY, model, systemPrompt, userText, imageBase64 });
        lastStatus = result.status;
        if (result.ok) { content = result.content; break; }
      }
    }
    // 4순위: Lovable AI
    if (!content && LOVABLE_API_KEY) {
      for (const model of [LOVABLE_MODEL, LOVABLE_FALLBACK_MODEL]) {
        const result = await callLovableAI({ apiKey: LOVABLE_API_KEY, model, systemPrompt, userText, imageBase64 });
        lastStatus = result.status;
        if (result.ok) { content = result.content; break; }
        if (result.status === 402 || result.status === 429) break;
      }
    }

    if (!content) {
      console.error("identify all providers failed", lastStatus);
      if (lastStatus === 429) return json({ error: "Rate limit exceeded. Please try again shortly.", code: "RATE_LIMITED" });
      return json({ error: "AI is temporarily unavailable", code: "AI_UNAVAILABLE" });
    }

    const parsed: any = extractJson(content);
    if (!parsed || !parsed.foodName) {
      console.error("Could not parse identify-food JSON", content.slice(0, 500));
      return json({ error: "No identification", code: "AI_UNAVAILABLE" });
    }

    const foodName = String(parsed.foodName ?? "").trim();
    const englishName = String(parsed.englishName ?? foodName).trim();
    const confidence = Number(parsed.confidence ?? 70);
    if (!foodName || confidence < 35 || /unknown|unidentified|not sure|미확인|알 수 없음/i.test(`${foodName} ${englishName}`)) {
      return json({ error: "No confident identification", code: "LOW_CONFIDENCE" });
    }

    return json({ foodName, englishName, confidence: Math.min(100, Math.max(35, confidence)) });
  } catch (e) {
    console.error("identify-food error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown", code: "AI_UNAVAILABLE" });
  }
});
