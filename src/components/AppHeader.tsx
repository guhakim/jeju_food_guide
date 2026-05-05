import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSafeBite } from "@/context/SafeBiteContext";
import { useT } from "@/lib/i18n";

export const AppHeader = ({ back = false, titleKey }: { back?: boolean; titleKey?: string }) => {
  const nav = useNavigate();
  const { prefs } = useSafeBite();
  const t = useT(prefs.language);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {back ? (
            <Button variant="ghost" size="icon" onClick={() => nav(-1)} aria-label={t("header.back")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-xl bg-gradient-safe p-1.5">
                <Leaf className="h-5 w-5 text-safe-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">SafeBite Jeju</span>
            </Link>
          )}
          {titleKey && <span className="ml-2 text-base font-semibold">{t(titleKey)}</span>}
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link to="/saved" className="flex items-center gap-1.5">
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">{t("saved.link")}</span>
          </Link>
        </Button>
      </div>
    </header>
  );
};
