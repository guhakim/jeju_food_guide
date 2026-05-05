const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const GROQ_MODELS = ["meta-llama/llama-4-scout-17b-16e-instruct"];
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

const fetchWithTimeout = async (url: string, init: RequestInit, ms = 12000) => {
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
  apiKey: string; model: string; systemPrompt: string; userText: string; imageBase64?: string;
}) => {
  // Groq: 이미지 없으면 content를 문자열로, 있으면 배열로
  let userContent: string | any[];
  if (imageBase64) {
    const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    userContent = [
      { type: "text", text: userText },
      { type: "image_url", image_url: { url: dataUrl } },
    ];
  } else {
    userContent = userText;
  }

  const response = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: 900,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  }, 15000);

  const text = await response.text();
  if (!response.ok) {
    console.warn("Groq analyze failed", model, response.status, text.slice(0, 200));
    return { ok: false, status: response.status, content: text };
  }
  const data = JSON.parse(text);
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return { ok: true, status: response.status, content };
};

const callOpenRouter = async ({
  apiKey, model, systemPrompt, userText, imageBase64,
}: {
  apiKey: string; model: string; systemPrompt: string; userText: string; imageBase64?: string;
}) => {
  const userContent: any[] = [{ type: "text", text: userText }];
  if (imageBase64) {
    const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    userContent.push({ type: "image_url", image_url: { url: dataUrl } });
  }

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
      temperature: 0.25,
      max_tokens: 900,
      messages: [{ role: "user", content: [{ type: "text", text: systemPrompt }, ...userContent] }],
    }),
  }, 12000);

  const text = await response.text();
  if (!response.ok) {
    console.warn("OpenRouter analyze failed", model, response.status, text.slice(0, 200));
    return { ok: false, status: response.status, content: text };
  }
  const data = JSON.parse(text);
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return { ok: true, status: response.status, content };
};

const callGemini = async ({
  apiKey, model, systemPrompt, userText, imageBase64,
}: {
  apiKey: string; model: string; systemPrompt: string; userText: string; imageBase64?: string;
}) => {
  const parts: any[] = [{ text: userText }];
  if (imageBase64) {
    const image = parseImage(imageBase64);
    parts.push({ inline_data: { mime_type: image.mimeType, data: image.data } });
  }

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.25, response_mime_type: "application/json" },
      }),
    },
    12000,
  );

  const text = await response.text();
  if (!response.ok) {
    console.warn("Gemini analyze failed", model, response.status, text.slice(0, 200));
    return { ok: false, status: response.status, content: text };
  }
  const data = JSON.parse(text);
  const content = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("\n") ?? "";
  return { ok: true, status: response.status, content };
};

const callLovableAI = async ({
  apiKey, model, systemPrompt, userText, imageBase64,
}: {
  apiKey: string; model: string; systemPrompt: string; userText: string; imageBase64?: string;
}) => {
  const userContent: any[] = [{ type: "text", text: userText }];
  if (imageBase64) {
    const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    userContent.push({ type: "image_url", image_url: { url: dataUrl } });
  }

  const response = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  }, 12000);

  const text = await response.text();
  if (!response.ok) {
    console.warn("Lovable AI analyze failed", response.status, text.slice(0, 200));
    return { ok: false, status: response.status, content: text };
  }
  const data = JSON.parse(text);
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return { ok: true, status: response.status, content };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { foodName, imageBase64, diet = "none", allergies = [], language = "EN" } = await req.json();
    if (!foodName && !imageBase64) return json({ error: "foodName or imageBase64 required" }, 400);

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

    const userText = `Analyze this Korean / Jeju food for a foreign tourist.

Food: ${foodName || "(see image)"}
Diet restriction: ${diet === "none" ? "none" : diet}
Allergies: ${allergies.length ? allergies.join(", ") : "none"}

Safety rules:
- "safe": no diet violation AND no allergen present
- "caution": possible hidden ingredient (e.g. fish broth)
- "danger": clearly contains allergen or violates diet

Respond ONLY with a JSON object (no markdown, no explanation). All text values must be in ${langName}. Example structure:
{"foodName":"(name in ${langName})","safety":"safe","reason":"(why safe/caution/danger)","ingredients":["ingredient1","ingredient2"],"riskTags":["shellfish"],"confidence":85,"alternatives":[{"name":"(alt)","note":"(note)"}],"nutrition":{"servingSize":"(e.g. 1 bowl)","calories":450,"sodium":900,"protein":18,"potassium":350,"phosphorus":180}}`;

    const systemPrompt =
      "You are a Korean food safety expert helping foreign tourists in Jeju. Be decisive — return 'safe' when the dish truly matches the user's needs. Always respond with ONLY a valid JSON object, no extra text.";

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
      console.error("analyze all providers failed", lastStatus);
      if (lastStatus === 429) return json({ error: "Rate limit exceeded.", code: "RATE_LIMITED" });
      return json({ error: "AI is temporarily unavailable", code: "AI_UNAVAILABLE" });
    }

    const parsed: any = extractJson(content);
    if (!parsed || !parsed.safety) {
      console.error("Could not parse analyze-food JSON", content.slice(0, 500));
      return json({ error: "No analysis returned", code: "AI_UNAVAILABLE" });
    }

    const normalizedName = String(parsed.foodName ?? foodName ?? "").trim();
    const normalizedConfidence = Number(parsed.confidence ?? 70);
    if (!normalizedName || normalizedConfidence < 35 || /unknown|unidentified|not sure|미확인|알 수 없음/i.test(normalizedName)) {
      return json({ error: "No confident analysis", code: "AI_UNAVAILABLE" });
    }
    parsed.foodName = normalizedName;
    parsed.reason = String(parsed.reason ?? "");
    parsed.ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    parsed.riskTags = Array.isArray(parsed.riskTags) ? parsed.riskTags : [];
    parsed.confidence = Math.min(100, Math.max(35, normalizedConfidence));
    parsed.alternatives = Array.isArray(parsed.alternatives) ? parsed.alternatives : [];
    parsed.nutrition = parsed.nutrition ?? {
      servingSize: "1 serving",
      calories: 0, sodium: 0, protein: 0, potassium: 0, phosphorus: 0,
    };

    return json(parsed);
  } catch (e) {
    console.error("analyze-food error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown", code: "AI_UNAVAILABLE" });
  }
});
