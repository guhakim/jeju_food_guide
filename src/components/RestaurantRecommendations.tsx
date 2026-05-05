import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, Wallet, ExternalLink, Loader2, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSafeBite } from "@/context/SafeBiteContext";
import { useT } from "@/lib/i18n";
import { pickFallbackRestaurants } from "@/lib/jejuRestaurants";

interface Restaurant {
  name: string;
  region: string;
  signatureMenu: string;
  reason: string;
  address: string;
  phone?: string;
  hours: string;
  priceRange: string;
  mapsUrl: string;
  image?: string;
}

interface Props {
  foodName?: string;
}

export const RestaurantRecommendations = ({ foodName }: Props) => {
  const { prefs } = useSafeBite();
  const t = useT(prefs.language);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const fallback = pickFallbackRestaurants(prefs.diet, prefs.allergies);
      try {
        const res = await supabase.functions.invoke("recommend-restaurants", {
          body: {
            diet: prefs.diet,
            allergies: prefs.allergies,
            language: prefs.language,
            foodName,
          },
        }).catch((e) => ({ data: null, error: e }));
        if (cancelled) return;
        const data = (res as { data: { restaurants?: Restaurant[] } | null })?.data;
        if (data?.restaurants?.length) {
          setRestaurants(data.restaurants);
        } else {
          setRestaurants(fallback);
        }
      } catch {
        if (!cancelled) setRestaurants(fallback);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.diet, prefs.allergies.join(","), prefs.language, foodName]);

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Utensils className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold tracking-tight">{t("rec.title")}</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{t("rec.subtitle")}</p>

      {loading && (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("rec.loading")}
        </div>
      )}

      {!loading && restaurants.length > 0 && (
        <div className="space-y-3">
          {restaurants.map((r, i) => (
            <article
              key={`${r.name}-${i}`}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-smooth hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-muted-foreground">/ {String(i + 1).padStart(2, "0")}</span>
                    <h3 className="truncate text-base font-bold">{r.name}</h3>
                  </div>
                  <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-primary">{r.region}</p>
                </div>
                <a
                  href={r.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft transition-smooth hover:opacity-90"
                >
                  {t("rec.map")} <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {r.image && (
                <img
                  src={r.image}
                  alt={r.name}
                  loading="lazy"
                  className="mt-3 h-40 w-full rounded-xl object-cover"
                />
              )}

              {r.signatureMenu && (
                <div className="mt-3 rounded-xl bg-secondary/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("rec.menu")}</p>
                  <p className="mt-0.5 text-sm font-semibold">{r.signatureMenu}</p>
                </div>
              )}

              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{r.reason}</p>

              <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                {r.address && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span className="leading-snug">{r.address}</span>
                  </div>
                )}
                {r.hours && (
                  <div className="flex items-start gap-1.5">
                    <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span className="leading-snug">{r.hours}</span>
                  </div>
                )}
                {r.priceRange && (
                  <div className="flex items-start gap-1.5">
                    <Wallet className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span className="leading-snug">{r.priceRange}</span>
                  </div>
                )}
                {r.phone && (
                  <a href={`tel:${r.phone}`} className="flex items-start gap-1.5 hover:text-primary">
                    <Phone className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span className="leading-snug">{r.phone}</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
