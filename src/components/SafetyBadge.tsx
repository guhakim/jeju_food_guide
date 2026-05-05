import { SafetyLevel } from "@/types/safebite";
import { Check, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSafeBite } from "@/context/SafeBiteContext";
import { useT } from "@/lib/i18n";

const config = {
  safe: { key: "safety.safe", Icon: Check, gradient: "bg-gradient-safe", text: "text-safe-foreground" },
  caution: { key: "safety.caution", Icon: AlertTriangle, gradient: "bg-gradient-caution", text: "text-caution-foreground" },
  danger: { key: "safety.danger", Icon: X, gradient: "bg-gradient-danger", text: "text-danger-foreground" },
} as const;

export const SafetyBadge = ({ level, size = "lg" }: { level: SafetyLevel; size?: "sm" | "lg" }) => {
  const { prefs } = useSafeBite();
  const t = useT(prefs.language);
  const { key, Icon, gradient, text } = config[level];
  const label = t(key);
  if (size === "sm") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", gradient, text)}>
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
    );
  }
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-3xl px-8 py-6 shadow-card animate-scale-in", gradient, text)}>
      <div className="rounded-full bg-white/25 p-4 backdrop-blur-sm">
        <Icon className="h-10 w-10" strokeWidth={2.5} />
      </div>
      <p className="text-2xl font-bold tracking-tight">{label}</p>
    </div>
  );
};
