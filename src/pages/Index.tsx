import { Link } from "react-router-dom";
import { Camera, ShieldCheck, Sparkles, Leaf, Bookmark, ArrowRight, Globe, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSafeBite } from "@/context/SafeBiteContext";
import { LANGS, useT } from "@/lib/i18n";
import heroImg from "@/assets/jeju-hero.jpg";

const Index = () => {
  const { prefs, setPrefs } = useSafeBite();
  const t = useT(prefs.language);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top bar — language always visible for tourists */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-primary/85 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary-foreground">
            <div className="rounded-md bg-accent p-1.5">
              <Leaf className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight">SafeBite Jeju</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-primary-foreground/70">
              <Globe className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-md bg-white/10 p-0.5">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setPrefs({ ...prefs, language: l })}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                    prefs.language === l
                      ? "bg-accent text-accent-foreground"
                      : "text-primary-foreground/80 hover:text-primary-foreground"
                  }`}
                  aria-label={`Switch to ${l}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
              <Link to="/saved" className="flex items-center gap-1.5">
                <Bookmark className="h-4 w-4" />
                <span>{t("saved.link")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Cinematic Hero */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Jeju Korean food spread"
          className="absolute inset-0 h-full w-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-hero" />
        <div className="absolute inset-0 bg-primary/20" />

        {/* Coordinates / loader chip — Go RVing style */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-primary-foreground/70">
          <span className="block h-2.5 w-2.5 rounded-sm bg-accent animate-pulse-soft" />
          33.4996° N, 126.5312° E
        </div>

        {/* Bottom-anchored typography */}
        <div className="absolute inset-x-0 bottom-0 z-10 pb-16 sm:pb-20">
          <div className="container">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> {t("hero.badge")}
            </div>

            <h1 className="font-bold uppercase tracking-tight text-primary-foreground leading-[1.15] text-[clamp(2.75rem,11vw,9rem)]">
              <span className="block">{t("hero.title.1")}</span>
              <span className="block">
                {t("hero.title.confidence")}
                <span className="ml-3 inline-block h-3 w-3 sm:h-4 sm:w-4 translate-y-[-0.15em] rounded-sm bg-accent" />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-primary-foreground/85">
              {t("hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-14 rounded-md bg-accent px-7 text-base font-bold uppercase tracking-wide text-accent-foreground hover:bg-accent/90 shadow-glow group">
                <Link to="/input">
                  <Camera className="mr-2 h-5 w-5" /> {t("hero.cta.photo")}
                  <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-md border-white/30 bg-white/5 px-7 text-base font-semibold uppercase tracking-wide text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
                <Link to="/input">
                  <Utensils className="mr-2 h-5 w-5" /> {t("hero.cta.type")}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.3em] text-primary-foreground/50">
          ↓ scroll
        </div>
      </section>

      {/* Features — bold editorial layout */}
      <section className="bg-background py-24 sm:py-32">
        <div className="container">
          <div className="grid gap-10 md:grid-cols-12 md:gap-16 mb-16">
            <div className="md:col-span-5">
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-accent mb-4">
                / 01 — How it works
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight text-foreground leading-[0.95]">
                {t("features.title")}
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 flex items-end">
              <p className="text-lg text-muted-foreground">{t("features.subtitle")}</p>
            </div>
          </div>

          <div className="grid gap-px bg-border overflow-hidden rounded-lg border border-border md:grid-cols-3">
            {[
              { Icon: Leaf, n: "01", title: t("features.1.title"), desc: t("features.1.desc") },
              { Icon: Camera, n: "02", title: t("features.2.title"), desc: t("features.2.desc") },
              { Icon: ShieldCheck, n: "03", title: t("features.3.title"), desc: t("features.3.desc") },
            ].map(({ Icon, n, title, desc }, i) => (
              <div
                key={title}
                className="group relative bg-card p-8 sm:p-10 transition-colors hover:bg-secondary animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">/ {n}</span>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big CTA band */}
      <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl" />
        <div className="container relative">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-accent mb-6">
            / 02 — Ready
          </div>
          <h2 className="max-w-4xl text-5xl sm:text-6xl md:text-7xl font-bold uppercase tracking-tight text-primary-foreground leading-[0.95]">
            {t("features.cta")}
            <span className="ml-3 inline-block h-3 w-3 rounded-sm bg-accent" />
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="h-14 rounded-md bg-accent px-8 text-base font-bold uppercase tracking-wide text-accent-foreground hover:bg-accent/90">
              <Link to="/input">
                <Camera className="mr-2 h-5 w-5" /> {t("hero.cta.photo")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-md border-white/30 bg-transparent px-8 text-base font-semibold uppercase tracking-wide text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
              <Link to="/saved">
                <Bookmark className="mr-2 h-5 w-5" /> {t("saved.link")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-10">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-mono uppercase tracking-wider text-xs">© SafeBite Jeju</span>
          <span>{t("footer")}</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
