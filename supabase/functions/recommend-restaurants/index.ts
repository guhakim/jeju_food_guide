const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const LANG_INSTRUCTION: Record<string, string> = {
  EN: "Respond in English.",
  KO: "모든 텍스트(이름, 지역, 메뉴, 설명, 영업시간, 가격대)는 한국어로 작성해 주세요.",
  CN: "请用简体中文回答所有字段。",
  JP: "すべてのフィールドを日本語で回答してください。",
};

// ---------- TourAPI (한국관광공사) ----------
interface TourItem {
  contentid: string;
  title: string;
  addr1?: string;
  addr2?: string;
  tel?: string;
  firstimage?: string;
  firstimage2?: string;
  mapx?: string;
  mapy?: string;
}

const isLikelyServiceKey = (k: string) => {
  // serviceKey는 보통 공백/줄바꿈/명령어 문자가 없고 100~200자 내외
  if (!k) return false;
  if (k.length < 40 || k.length > 400) return false;
  if (/\s|curl|http|--/i.test(k)) return false;
  return true;
};

interface DetailIntro {
  firstmenu?: string;
  treatmenu?: string;
  opentimefood?: string;
  restdatefood?: string;
  infocenterfood?: string;
  parkingfood?: string;
}

const BASE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; JejuBiteSafe/1.0)",
  Accept: "application/json",
};

const fetchTourList = async (key: string): Promise<TourItem[]> => {
  const keyParam = key.includes("%") ? key : encodeURIComponent(key);
  const url = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${keyParam}&MobileOS=ETC&MobileApp=JejuBiteSafe&_type=json&arrange=A&numOfRows=100&pageNo=1&areaCode=39&contentTypeId=39`;

  const r = await fetch(url, { headers: BASE_HEADERS });
  const text = await r.text();
  if (!r.ok) { console.error("TourAPI HTTP error", r.status, text.slice(0, 300)); return []; }
  let data: any;
  try { data = JSON.parse(text); } catch { console.error("TourAPI non-JSON:", text.slice(0, 200)); return []; }
  const items = data?.response?.body?.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
};

const fetchDetailIntro = async (key: string, contentId: string): Promise<DetailIntro> => {
  const keyParam = key.includes("%") ? key : encodeURIComponent(key);
  const url = `https://apis.data.go.kr/B551011/KorService2/detailIntro2?serviceKey=${keyParam}&MobileOS=ETC&MobileApp=JejuBiteSafe&_type=json&contentTypeId=39&contentId=${contentId}`;
  try {
    const r = await fetch(url, { headers: BASE_HEADERS });
    if (!r.ok) return {};
    const data = await r.json();
    const item = data?.response?.body?.items?.item;
    return (Array.isArray(item) ? item[0] : item) ?? {};
  } catch { return {}; }
};

const cleanHtml = (s?: string) => (s ?? "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").trim();

const tourItemsToRestaurants = async (key: string, items: TourItem[]) => {
  items.sort((a, b) => (b.firstimage ? 1 : 0) - (a.firstimage ? 1 : 0));
  const top = items.slice(0, 5);
  const details = await Promise.all(top.map((it) => fetchDetailIntro(key, it.contentid)));

  return top.map((it, i) => {
    const d = details[i];
    const menu = cleanHtml(d.firstmenu || d.treatmenu?.split("/")?.[0]);
    const hours = cleanHtml(d.opentimefood);
    const closed = cleanHtml(d.restdatefood);
    return {
      name: it.title,
      region: (it.addr1 || "").split(" ").slice(0, 2).join(" ") || "제주",
      signatureMenu: menu,
      reason: "한국관광공사 등록 제주 음식점" + (closed ? ` (휴무: ${closed})` : ""),
      address: [it.addr1, it.addr2].filter(Boolean).join(" ").trim(),
      phone: d.infocenterfood || it.tel || "",
      hours,
      priceRange: "",
      mapsUrl: it.mapx && it.mapy
        ? `https://map.kakao.com/link/map/${encodeURIComponent(it.title)},${it.mapy},${it.mapx}`
        : `https://www.google.com/maps/search/${encodeURIComponent(it.title + " 제주")}`,
      image: it.firstimage || it.firstimage2 || "",
    };
  });
};

// ---------- AI 추천 (fallback) ----------
const extractToolCall = (data: any) => {
  const tc = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (tc?.function?.arguments) {
    try { return JSON.parse(tc.function.arguments); } catch { return null; }
  }
  return null;
};

const fetchAiRestaurants = async (apiKey: string, diet: string, allergies: string[], language: string, foodName?: string) => {
  const lang = language || "KO";
  const allergyList = allergies.length ? allergies.join(", ") : "none";
  const systemPrompt = `You are a Jeju Island (제주도) local food expert. Recommend 5 real, well-known restaurants on Jeju Island that fit the user's dietary preference and avoid their allergies. ${LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.EN}`;
  const userPrompt = `Diet: ${diet || "none"}\nAllergies to avoid: ${allergyList}\n${foodName ? `User just looked up: ${foodName}\n` : ""}Recommend 5 real Jeju restaurants. For each include name, region, signature menu, short reason, address, phone (if known), opening hours, price range, and a Google Maps URL.`;

  const tools = [{
    type: "function",
    function: {
      name: "recommend_restaurants",
      description: "Return 5 Jeju restaurant recommendations.",
      parameters: {
        type: "object",
        properties: {
          restaurants: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" }, region: { type: "string" },
                signatureMenu: { type: "string" }, reason: { type: "string" },
                address: { type: "string" }, phone: { type: "string" },
                hours: { type: "string" }, priceRange: { type: "string" },
                mapsUrl: { type: "string" },
              },
              required: ["name", "region", "signatureMenu", "reason", "address", "hours", "priceRange", "mapsUrl"],
              additionalProperties: false,
            },
          },
        },
        required: ["restaurants"],
        additionalProperties: false,
      },
    },
  }];

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "recommend_restaurants" } },
    }),
  });

  if (!resp.ok) {
    console.error("AI gateway error", resp.status, await resp.text().catch(() => ""));
    return null;
  }
  const data = await resp.json();
  const parsed = extractToolCall(data);
  if (!parsed?.restaurants) return null;
  return parsed.restaurants.map((r: any) => ({
    ...r,
    mapsUrl: r.mapsUrl?.startsWith("http")
      ? r.mapsUrl
      : `https://www.google.com/maps/search/${encodeURIComponent((r.name || "") + " 제주")}`,
  }));
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { diet, allergies, language, foodName } = await req.json().catch(() => ({}));
    const allergyArr: string[] = Array.isArray(allergies) ? allergies : [];

    // 1) TourAPI 시도 (키가 정상 형식일 때만)
    const TOUR_API_KEY = Deno.env.get("TOUR_API_KEY");
    if (TOUR_API_KEY && isLikelyServiceKey(TOUR_API_KEY)) {
      try {
        const items = await fetchTourList(TOUR_API_KEY);
        if (items.length) {
          const restaurants = await tourItemsToRestaurants(TOUR_API_KEY, items);
          if (restaurants.length) return json({ restaurants, source: "tour-api" });
        }
      } catch (e) {
        console.error("TourAPI failed, falling back to AI:", e);
      }
    } else if (TOUR_API_KEY) {
      console.warn("TOUR_API_KEY format invalid (length:", TOUR_API_KEY.length, "), skipping TourAPI");
    }

    // 2) AI 추천 fallback
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      const ai = await fetchAiRestaurants(LOVABLE_API_KEY, diet, allergyArr, language, foodName);
      if (ai?.length) return json({ restaurants: ai, source: "ai" });
    }

    // 3) 둘 다 실패 → 클라이언트 fallback 사용
    return json({ restaurants: [], fallback: true, code: "NO_SOURCE" });
  } catch (e) {
    console.error("recommend-restaurants error", e);
    return json({ restaurants: [], fallback: true, code: "SERVER_ERROR" });
  }
});
