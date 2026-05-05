import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Image as ImageIcon, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/AppHeader";
import { useSafeBite } from "@/context/SafeBiteContext";
import { Allergy, DietType } from "@/types/safebite";
import { analyzeFood } from "@/lib/mockAnalyzer";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { DIET_ICONS, DietIconKey } from "@/components/DietIcons";

// Each diet defines which food groups it ALLOWS (active = colored icon)
const DIETS: { value: DietType; key: string; allows: DietIconKey[] }[] = [
  { value: "none", key: "diet.none", allows: ["broccoli", "milk", "egg", "fish", "chicken", "ham"] },
  { value: "vegan", key: "diet.vegan", allows: ["broccoli"] },
  { value: "lacto", key: "diet.lacto", allows: ["broccoli", "milk"] },
  { value: "ovo", key: "diet.ovo", allows: ["broccoli", "egg"] },
  { value: "lacto-ovo", key: "diet.lacto-ovo", allows: ["broccoli", "milk", "egg"] },
  { value: "pescatarian", key: "diet.pescatarian", allows: ["broccoli", "milk", "egg", "fish"] },
  { value: "pollo", key: "diet.pollo", allows: ["broccoli", "milk", "egg", "fish", "chicken"] },
  { value: "flexitarian", key: "diet.flexitarian", allows: ["broccoli", "milk", "egg", "fish", "chicken", "ham"] },
];

const ICON_ORDER: DietIconKey[] = ["broccoli", "milk", "egg", "fish", "chicken", "ham"];

import { ALLERGY_ICONS } from "@/components/AllergyIcons";

const ALLERGIES: { value: Allergy; key: string; iconKey: string }[] = [
  { value: "milk", key: "allergy.milk", iconKey: "milk" },
  { value: "wheat", key: "allergy.wheat", iconKey: "wheat" },
  { value: "peanuts", key: "allergy.peanuts", iconKey: "peanuts" },
  { value: "poultry-eggs", key: "allergy.poultry-eggs", iconKey: "poultry-eggs" },
  { value: "buckwheat", key: "allergy.buckwheat", iconKey: "buckwheat" },
  { value: "crab", key: "allergy.crab", iconKey: "crab" },
  { value: "soybean", key: "allergy.soybean", iconKey: "soybean" },
  { value: "shrimp", key: "allergy.shrimp", iconKey: "shrimp" },
  { value: "peach", key: "allergy.peach", iconKey: "peach" },
  { value: "pork", key: "allergy.pork", iconKey: "pork" },
  { value: "beef", key: "allergy.beef", iconKey: "beef" },
  { value: "tomato", key: "allergy.tomato", iconKey: "tomato" },
  { value: "mackerel", key: "allergy.mackerel", iconKey: "mackerel" },
  { value: "chicken", key: "allergy.chicken", iconKey: "chicken" },
  { value: "squid", key: "allergy.squid", iconKey: "squid" },
  { value: "shellfish", key: "allergy.shellfish", iconKey: "shellfish" },
  { value: "walnut-pinenut", key: "allergy.walnut-pinenut", iconKey: "walnut-pinenut" },
  { value: "sulfites", key: "allergy.sulfites", iconKey: "sulfites" },
];

const EXAMPLES = ["Black pork BBQ", "Abalone porridge", "Bibimbap", "Haemul pajeon", "Kimchi stew"];

const compressImageForAnalysis = async (dataUrl: string, maxSize = 1024, quality = 0.78): Promise<string> => {
  if (!dataUrl.startsWith("data:image")) return dataUrl;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });
    const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
    const width = Math.round(img.width * ratio);
    const height = Math.round(img.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return dataUrl;
  }
};

const withTimeout = async <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const InputPage = () => {
  const nav = useNavigate();
  const { prefs, setPrefs, setResult } = useSafeBite();
  const t = useT(prefs.language);
  const [foodName, setFoodName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const getErrorKey = async (e: unknown): Promise<string> => {
    const err = e as { context?: { status?: number; json?: () => Promise<{ error?: string }> }; status?: number; code?: string; message?: string };
    const ctx = err?.context;
    const status = ctx?.status ?? err?.status;
    let bodyMsg = "";
    try {
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        bodyMsg = (body?.error || "").toString().toLowerCase();
      }
    } catch {
      // ignore body parse failure
    }
    const msg = (bodyMsg + " " + (err?.message || "")).toLowerCase();
    if (err?.code === "AI_CREDITS_EXHAUSTED") return "input.errCredits";
    if (err?.code === "RATE_LIMITED") return "input.errRate";
    if (status === 402 || msg.includes("credit") || msg.includes("payment") || msg.includes("402")) return "input.errCredits";
    if (status === 429 || msg.includes("rate") || msg.includes("429")) return "input.errRate";
    return "";
  };

  interface FunctionResponse { error?: string; code?: string }
  const showFunctionError = (data: FunctionResponse | null, fallbackKey: string) => {
    if (!data?.error) return false;
    if (data.code === "AI_CREDITS_EXHAUSTED") {
      toast.error(t("input.errCredits"));
      return true;
    }
    if (data.code === "RATE_LIMITED") {
      toast.error(t("input.errRate"));
      return true;
    }
    if (data.code === "AI_UNAVAILABLE") {
      toast.error(t("input.errAiUnavailable"));
      return true;
    }
    toast.error(t(fallbackKey));
    return true;
  };

  const runFallbackAnalysis = () => {
    const fallback = analyzeFood(foodName.trim(), prefs, imageUrl);
    setResult(fallback);
    toast.info(t("input.fallbackAnalysis"));
    nav("/result");
  };

  const identifyFood = async (dataUrl: string) => {
    setIdentifying(true);
    try {
      const { data, error } = await withTimeout(supabase.functions.invoke("identify-food", {
        body: { imageBase64: dataUrl, language: prefs.language },
      }), 30000, "identify timeout");
      if (error) throw error;
      if (data?.code === "RATE_LIMITED" || data?.code === "AI_UNAVAILABLE") {
        toast.info(t("input.identifyFailed"));
        return;
      }
      if (showFunctionError(data, "input.identifyFailed")) return;
      const name = data?.englishName || data?.foodName;
      if (name) {
        setFoodName(name);
        toast.success(t("input.identified", { food: data.foodName }));
      } else {
        toast.info(t("input.identifyFailed"));
      }
    } catch (e: unknown) {
      console.warn("identify failed", e);
      toast.info(t("input.identifyFailed"));
    } finally {
      setIdentifying(false);
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error(t("input.errImage"));
    const reader = new FileReader();
    reader.onload = async () => {
      const url = await compressImageForAnalysis(reader.result as string);
      setImageUrl(url);
      e.target.value = "";
      identifyFood(url);
    };
    reader.readAsDataURL(f);
  };

  const toggleAllergy = (a: Allergy) => {
    setPrefs({
      ...prefs,
      allergies: prefs.allergies.includes(a) ? prefs.allergies.filter((x) => x !== a) : [...prefs.allergies, a],
    });
  };

  const submit = async () => {
    if (!foodName.trim() && !imageUrl) {
      toast.error(t("input.errEmpty"));
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await withTimeout(supabase.functions.invoke("analyze-food", {
        body: {
          foodName: foodName.trim(),
          imageBase64: imageUrl,
          diet: prefs.diet,
          allergies: prefs.allergies,
          language: prefs.language,
        },
      }), 30000, "analysis timeout");
      if (error) throw error;
      if (data?.error) {
        if (data.code === "AI_UNAVAILABLE" || data.code === "RATE_LIMITED" || data.code === "AI_CREDITS_EXHAUSTED") {
          runFallbackAnalysis();
          return;
        }
        if (showFunctionError(data, "input.errAnalyze")) return;
      }
      setResult({
        foodName: data.foodName,
        imageUrl,
        safety: data.safety,
        reason: data.reason,
        ingredients: data.ingredients ?? [],
        riskTags: data.riskTags ?? [],
        confidence: data.confidence ?? 80,
        alternatives: data.alternatives ?? [],
        nutrition: data.nutrition,
      });
      nav("/result");
    } catch (e: unknown) {
      console.warn("analyze failed", e);
      const key = await getErrorKey(e);
      if (key === "input.errCredits" || key === "input.errRate") runFallbackAnalysis();
      else toast.error(t("input.errAnalyze"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader back titleKey="input.title" />
      <main className="container max-w-2xl py-8">
        {/* Image area */}
        <section className="space-y-3">
          <Label className="text-base font-semibold">{t("input.photo")}</Label>
          {imageUrl ? (
            <div className="relative overflow-hidden rounded-3xl shadow-card">
              <img src={imageUrl} alt="Selected food" className="h-72 w-full object-cover" />
              <button
                onClick={() => { setImageUrl(undefined); setFoodName(""); }}
                className="absolute right-3 top-3 rounded-full bg-background/90 p-2 shadow-soft transition-smooth hover:bg-background"
                aria-label={t("input.removePhoto")}
              >
                <X className="h-4 w-4" />
              </button>
              {identifying && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    {t("input.identifying")}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => camRef.current?.click()}
                className="group flex h-40 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-gradient-card text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
              >
                <Camera className="h-8 w-8" />
                <span className="text-sm font-semibold">{t("input.takePhoto")}</span>
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="group flex h-40 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-gradient-card text-muted-foreground transition-smooth hover:border-primary hover:text-primary"
              >
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm font-semibold">{t("input.upload")}</span>
              </button>
            </div>
          )}
          <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </section>

        {/* Food name */}
        <section className="mt-8 space-y-3">
          <Label htmlFor="food" className="text-base font-semibold">{t("input.foodName")}</Label>
          <Input
            id="food"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder={t("input.foodPlaceholder")}
            className="h-14 rounded-2xl text-base"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => setFoodName(e)}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-smooth hover:bg-primary hover:text-primary-foreground"
              >
                {e}
              </button>
            ))}
          </div>
        </section>

        {/* Diet */}
        <section className="mt-8 space-y-3">
          <Label className="text-base font-semibold">{t("input.diet")}</Label>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {DIETS.map((d, idx) => {
              const selected = prefs.diet === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => setPrefs({ ...prefs, diet: d.value })}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-3 text-left transition-smooth sm:gap-4 sm:px-4",
                    idx !== 0 && "border-t border-border",
                    selected ? "bg-primary/10" : "hover:bg-muted/50"
                  )}
                >
                  <div className="min-w-[7rem] flex-shrink-0 sm:min-w-[9rem]">
                    <div className={cn("text-sm font-bold sm:text-base", selected ? "text-primary" : "text-foreground")}>
                      {t(d.key)}
                    </div>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-1 sm:gap-2">
                    {ICON_ORDER.map((iconKey) => {
                      const Icon = DIET_ICONS[iconKey];
                      const active = d.allows.includes(iconKey);
                      return (
                        <Icon
                          key={iconKey}
                          active={active}
                          className="h-7 w-7 flex-shrink-0 sm:h-9 sm:w-9"
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Allergies */}
        <section className="mt-8 space-y-3">
          <Label className="text-base font-semibold">{t("input.allergies")}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ALLERGIES.map((a) => {
              const active = prefs.allergies.includes(a.value);
              const Icon = ALLERGY_ICONS[a.iconKey];
              return (
                <button
                  key={a.value}
                  onClick={() => toggleAllergy(a.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left text-sm font-semibold transition-smooth",
                    active
                      ? "border-danger bg-danger/10 text-danger"
                      : "border-border bg-card text-foreground hover:border-danger/50"
                  )}
                >
                  {Icon && <Icon className="h-9 w-9 flex-shrink-0" />}
                  <span className="leading-tight">{t(a.key)}</span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-4 backdrop-blur-md">
        <div className="container max-w-2xl">
          <Button onClick={submit} disabled={loading || identifying} size="lg" className="h-14 w-full rounded-2xl text-base font-semibold shadow-glow">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("input.analyzing")}</> : identifying ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("input.identifying")}</> : t("input.analyze")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputPage;
