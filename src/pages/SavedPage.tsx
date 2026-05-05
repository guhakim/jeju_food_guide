import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowRight, Bookmark, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { SafetyBadge } from "@/components/SafetyBadge";
import { useSafeBite } from "@/context/SafeBiteContext";
import { useT } from "@/lib/i18n";
import { getSavedFoods, deleteSavedFood, SavedFood } from "@/lib/savedFoods";
import { toast } from "sonner";

const SavedPage = () => {
  const { prefs, setResult } = useSafeBite();
  const t = useT(prefs.language);
  const nav = useNavigate();
  const [items, setItems] = useState<SavedFood[]>([]);

  useEffect(() => {
    setItems(getSavedFoods());
  }, []);

  const open = (item: SavedFood) => {
    setResult(item);
    nav("/result");
  };

  const remove = (id: string) => {
    deleteSavedFood(id);
    setItems(getSavedFoods());
    toast.success(t("saved.removed"));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader back titleKey="saved.title" />
      <main className="container max-w-2xl py-6">
        <div className="mb-4 flex justify-end">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/" className="flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
        </div>
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-gradient-card p-10 text-center shadow-soft">
            <Bookmark className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">{t("saved.empty")}</p>
            <Button asChild className="mt-6 rounded-2xl">
              <Link to="/input">{t("hero.cta.photo")}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it, i) => (
              <div
                key={it.id}
                className="flex items-center gap-4 rounded-3xl border border-border bg-gradient-card p-4 shadow-soft transition-smooth hover:shadow-card animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt={it.foodName} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-2xl">🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-lg font-semibold">{it.foodName}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <SafetyBadge level={it.safety} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(it.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => remove(it.id)} aria-label={t("saved.delete")}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button size="icon" onClick={() => open(it)} aria-label={t("saved.open")} className="rounded-xl">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedPage;
