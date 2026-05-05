const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface NutritionItem {
  foodNm?: string;
  nutConSrtrQua?: string; // 영양성분함량기준량 (serving size)
  enerc?: number;         // 에너지 kcal
  prot?: number;          // 단백질 g
  fatce?: number;         // 지방 g
  chocdf?: number;        // 탄수화물 g
  na?: number;            // 나트륨 mg
  k?: number;             // 칼륨 mg
  p?: number;             // 인(phosphorus) mg
  ca?: number;            // 칼슘 mg
  fibtg?: number;         // 식이섬유 g
  sugar?: number;         // 당류 g
  cho?: number;           // 콜레스테롤 mg
}

const parseNum = (v: unknown): number => {
  const n = Number(v);
  return isNaN(n) ? 0 : Math.round(n * 10) / 10;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { foodName } = await req.json();
    if (!foodName) return json({ error: "foodName required" }, 400);

    const MFDS_API_KEY = Deno.env.get("MFDS_API_KEY");
    if (!MFDS_API_KEY) return json({ error: "MFDS_API_KEY not configured", code: "NO_KEY" }, 503);

    const encoded = encodeURIComponent(foodName);
    const url =
      `https://apis.data.go.kr/1471000/FoodNtrIrdntInfoService1/getFoodNtrItdntList1` +
      `?serviceKey=${MFDS_API_KEY}&pageNo=1&numOfRows=5&type=json&foodNm=${encoded}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      console.warn("MFDS API error", res.status);
      return json({ error: "MFDS API unavailable", code: "API_ERROR" }, 502);
    }

    const raw = await res.json();

    // Support both array and object item formats
    const body = raw?.response?.body;
    const items: NutritionItem[] = Array.isArray(body?.items)
      ? body.items
      : Array.isArray(body?.items?.item)
      ? body.items.item
      : [];

    if (!items.length) return json({ error: "No data found", code: "NOT_FOUND" }, 404);

    // Pick the best match (first result is usually most relevant)
    const item = items[0];

    return json({
      foodName: item.foodNm ?? foodName,
      servingSize: item.nutConSrtrQua ? `${item.nutConSrtrQua}g` : "100g",
      calories: parseNum(item.enerc),
      protein: parseNum(item.prot),
      fat: parseNum(item.fatce),
      carbs: parseNum(item.chocdf),
      sodium: parseNum(item.na),
      potassium: parseNum(item.k),
      phosphorus: parseNum(item.p),
      calcium: parseNum(item.ca),
      fiber: parseNum(item.fibtg),
      sugar: parseNum(item.sugar),
      cholesterol: parseNum(item.cho),
    });
  } catch (e) {
    console.error("food-nutrition error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
