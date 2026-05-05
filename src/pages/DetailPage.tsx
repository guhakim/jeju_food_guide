import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { useSafeBite } from "@/context/SafeBiteContext";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

const DetailPage = () => {
  const { result, prefs } = useSafeBite();
  const t = useT(prefs.language);
  const nav = useNavigate();

  useEffect(() => {
    if (!result) nav("/input", { replace: true });
  }, [result, nav]);

  if (!result) return null;

  const share = async () => {
    const safetyLabel = t(`safety.${result.safety}`);
    const emoji = result.safety === "safe" ? "✅" : result.safety === "caution" ? "⚠️" : "🚫";
    const lines = [
      `${emoji} ${t("share.title")}`,
      "",
      `🍽️ ${result.foodName}`,
      `${emoji} ${safetyLabel}`,
      result.reason ? `📝 ${result.reason}` : "",
      result.nutrition
        ? `🔥 ${result.nutrition.calories}kcal · 🧂 ${result.nutrition.sodium}mg · 🥩 ${result.nutrition.protein}g`
        : "",
      "",
      `— SafeBite Jeju`,
    ].filter(Boolean);
    const text = lines.join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "SafeBite Jeju", text });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("detail.copied"));
    } catch {
      toast.error("Share failed");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <AppHeader back titleKey="detail.title" />
      <main className="container max-w-2xl py-6">
        <div className="rounded-3xl bg-hero p-6 text-white shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> {t("detail.smart")}
          </div>
          <h1 className="mt-3 text-2xl font-bold">{t("detail.heading", { food: result.foodName })}</h1>
          <p className="mt-1 text-white/80">{t("detail.sub")}</p>
        </div>

        <div className="mt-6 space-y-3">
          {result.alternatives.map((a, i) => (
            <div
              key={a.name}
              className="flex items-start gap-4 rounded-3xl border border-border bg-gradient-card p-5 shadow-soft transition-smooth hover:shadow-card animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-safe-soft text-safe text-2xl font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{a.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.note}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button onClick={() => toast.success(t("detail.saved"))} variant="outline" size="lg" className="h-14 rounded-2xl">
            <Bookmark className="mr-2 h-4 w-4" /> {t("detail.save")}
          </Button>
          <Button onClick={share} size="lg" className="h-14 rounded-2xl shadow-glow">
            <Share2 className="mr-2 h-4 w-4" /> {t("detail.share")}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Button asChild variant="ghost">
            <Link to="/input">{t("detail.another")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DetailPage;
