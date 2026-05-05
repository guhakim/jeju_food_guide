import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Nutrition } from "@/types/safebite";
import { useT } from "@/lib/i18n";
import { UserPreferences } from "@/types/safebite";

// Reference daily values (adult, general)
const DV = {
  calories: 2000, // kcal
  sodium: 2300, // mg
  protein: 50, // g
  potassium: 3500, // mg
  phosphorus: 700, // mg
};

interface Props {
  nutrition: Nutrition;
  lang: UserPreferences["language"];
  isRealData?: boolean;
}

export const NutritionChart = ({ nutrition, lang, isRealData }: Props) => {
  const t = useT(lang);

  const items = [
    { key: "calories", value: nutrition.calories, dv: DV.calories, unit: "kcal" },
    { key: "sodium", value: nutrition.sodium, dv: DV.sodium, unit: "mg" },
    { key: "protein", value: nutrition.protein, dv: DV.protein, unit: "g" },
    { key: "potassium", value: nutrition.potassium, dv: DV.potassium, unit: "mg" },
    { key: "phosphorus", value: nutrition.phosphorus, dv: DV.phosphorus, unit: "mg" },
  ];

  const data = items.map((it) => {
    const pct = Math.min(200, Math.round((it.value / it.dv) * 100));
    return {
      name: t(`nutrition.${it.key}`),
      pct,
      value: it.value,
      unit: it.unit,
    };
  });

  const colorFor = (pct: number) => {
    if (pct >= 60) return "hsl(var(--danger))";
    if (pct >= 30) return "hsl(var(--caution))";
    return "hsl(var(--primary))";
  };

  return (
    <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-soft">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("nutrition.title")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("nutrition.subtitle")}</p>
          {isRealData && (
            <span className="mt-1.5 inline-block rounded-full bg-safe-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-safe">
              식품안전처 공식 데이터
            </span>
          )}
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
          {t("nutrition.serving")}: {nutrition.servingSize}
        </span>
      </div>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--secondary))" }}
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(_v: number, _n: string, p: { payload: { value: number; unit: string; pct: number; name: string } }) => [
                `${p.payload.value} ${p.payload.unit} (${p.payload.pct}% DV)`,
                p.payload.name,
              ]}
            />
            <Bar dataKey="pct" radius={[0, 8, 8, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={colorFor(d.pct)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
            <span className="font-medium text-muted-foreground">{d.name}</span>
            <span className="font-semibold">
              {d.value}
              <span className="ml-0.5 text-muted-foreground">{d.unit}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
