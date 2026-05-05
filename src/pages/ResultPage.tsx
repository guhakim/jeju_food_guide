import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { SafetyBadge } from "@/components/SafetyBadge";
import { NutritionChart } from "@/components/NutritionChart";
import { RestaurantRecommendations } from "@/components/RestaurantRecommendations";
import { useSafeBite } from "@/context/SafeBiteContext";
import { useT } from "@/lib/i18n";
import { saveFood, isSaved } from "@/lib/savedFoods";
import { supabase } from "@/integrations/supabase/client";
import { Nutrition } from "@/types/safebite";
import { toast } from "sonner";

const ResultPage = () => {
  const { result, prefs } = useSafeBite();
  const t = useT(prefs.language);
  const nav = useNavigate();
  const [saved, setSaved] = useState(false);
  const [realNutrition, setRealNutrition] = useState<Nutrition | null>(null);

  // Fetch real nutrition data from 식품의약품안전처 식품영양성분 DB
  useEffect(() => {
    if (!result?.foodName) return;
    let cancelled = false;
    supabase.functions
      .invoke("food-nutrition", { body: { foodName: result.foodName } })
      .then(({ data }) => {
        if (cancelled || !data || data.code) return;
        setRealNutrition({
          servingSize: data.servingSize ?? "100g",
          calories: data.calories ?? 0,
          sodium: data.sodium ?? 0,
          protein: data.protein ?? 0,
          potassium: data.potassium ?? 0,
          phosphorus: data.phosphorus ?? 0,
        });
      })
      .catch(() => { /* silently fall back to AI nutrition */ });
    return () => { cancelled = true; };
  }, [result?.foodName]);

  const displayNutrition = realNutrition ?? result?.nutrition;

  useEffect(() => {
    if (result) setSaved(isSaved(result.foodName));
  }, [result]);

  const onSave = async () => {
    if (!result) return;
    try {
      await saveFood(result);
      setSaved(true);
      toast.success(t("saved.added"));
      setTimeout(() => nav("/saved"), 400);
    } catch (e) {
      console.error("save failed", e);
      toast.error("Storage full — delete some saved items first.");
    }
  };

  useEffect(() => {
    if (!result) nav("/input", { replace: true });
  }, [result, nav]);

  if (!result) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader back titleKey="result.title" />
      <main className="container max-w-2xl py-6">
        {result.imageUrl && (
          <div className="mb-6 overflow-hidden rounded-3xl shadow-card">
            <img src={result.imageUrl} alt={result.foodName} className="h-56 w-full object-cover" />
          </div>
        )}

        <div className="flex justify-center">
          <SafetyBadge level={result.safety} />
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-gradient-card p-6 shadow-soft animate-fade-up">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{t("result.detected")}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{result.foodName}</h1>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("result.confidence")}</span>
              <span className="font-semibold">{result.confidence}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-gradient-safe transition-all" style={{ width: `${result.confidence}%` }} />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("result.why")}</p>
            <p className="mt-1 text-base leading-relaxed">{result.reason}</p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("result.ingredients")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.ingredients.map((i) => (
                <span key={i} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">{i}</span>
              ))}
            </div>
          </div>

          {result.riskTags.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("result.allergens")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.riskTags.map((r) => (
                  <span key={r} className="rounded-full bg-caution-soft px-3 py-1.5 text-sm font-semibold text-caution-foreground">{t(`allergy.${r}`)}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {displayNutrition && (
          <div className="mt-6 animate-fade-up">
            <NutritionChart nutrition={displayNutrition} lang={prefs.language} isRealData={!!realNutrition} />
          </div>
        )}

        <RestaurantRecommendations foodName={result.foodName} />

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" size="lg" className="h-14 rounded-2xl">
            <Link to="/input"><RotateCcw className="mr-2 h-4 w-4" /> {t("result.checkAnother")}</Link>
          </Button>
          <Button asChild size="lg" className="h-14 rounded-2xl shadow-glow">
            <Link to="/detail">{t("result.alternatives")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <Button
          onClick={onSave}
          disabled={saved}
          variant={saved ? "secondary" : "default"}
          size="lg"
          className="mt-3 h-14 w-full rounded-2xl"
        >
          {saved ? (
            <><BookmarkCheck className="mr-2 h-4 w-4" /> {t("result.savedAlready")}</>
          ) : (
            <><Bookmark className="mr-2 h-4 w-4" /> {t("result.save")}</>
          )}
        </Button>
      </main>
    </div>
  );
};

export default ResultPage;
