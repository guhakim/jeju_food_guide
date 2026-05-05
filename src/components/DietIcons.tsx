/* eslint-disable react-refresh/only-export-components */
import { cn } from "@/lib/utils";

interface IconProps {
  active?: boolean;
  className?: string;
}

const GRAY = "#C8C8C8";
const GRAY_DARK = "#A8A8A8";

// 1) Broccoli — bright green, leafy
export const BroccoliIcon = ({ active, className }: IconProps) => {
  const head = active ? "#7CC242" : GRAY;
  const headDark = active ? "#5BA82E" : GRAY_DARK;
  const stem = active ? "#A8D96A" : "#D8D8D8";
  return (
    <svg viewBox="0 0 64 64" className={cn(className)} xmlns="http://www.w3.org/2000/svg">
      {/* florets - bumpy cloud cluster */}
      <path
        d="M14 24 Q12 16 20 14 Q22 8 30 10 Q34 6 40 10 Q48 8 50 16 Q56 18 54 26 Q56 32 50 34 L14 34 Q10 30 14 24 Z"
        fill={head}
      />
      {/* darker floret bumps */}
      <circle cx="20" cy="20" r="4" fill={headDark} opacity="0.55" />
      <circle cx="32" cy="16" r="4" fill={headDark} opacity="0.55" />
      <circle cx="44" cy="20" r="4" fill={headDark} opacity="0.55" />
      <circle cx="26" cy="26" r="4" fill={headDark} opacity="0.55" />
      <circle cx="38" cy="26" r="4" fill={headDark} opacity="0.55" />
      {/* stem with leafy sides */}
      <path d="M20 34 L44 34 L40 50 Q32 56 24 50 Z" fill={stem} />
      {/* side leaves */}
      <path d="M18 36 Q12 38 14 44 Q18 42 22 40 Z" fill={stem} />
      <path d="M46 36 Q52 38 50 44 Q46 42 42 40 Z" fill={stem} />
      {/* stem lines */}
      <path d="M28 38 L27 50" stroke={headDark} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M36 38 L37 50" stroke={headDark} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
};

// 2) Milk — light blue carton
export const MilkIcon = ({ active, className }: IconProps) => {
  const fill = active ? "#BCE3F2" : "#E0E0E0";
  const dark = active ? "#9CD0E5" : GRAY_DARK;
  return (
    <svg viewBox="0 0 64 64" className={cn(className)} xmlns="http://www.w3.org/2000/svg">
      {/* carton body */}
      <path d="M18 24 L46 24 L46 56 L18 56 Z" fill={fill} />
      {/* gable top */}
      <path d="M18 24 L32 12 L46 24 L40 24 L32 18 L24 24 Z" fill={dark} />
      <path d="M24 24 L32 18 L40 24 L40 28 L24 28 Z" fill={dark} opacity="0.5" />
      {/* outline */}
      <path d="M18 24 L32 12 L46 24 L46 56 L18 56 Z" fill="none" stroke={dark} strokeWidth="1.2" strokeLinejoin="round" opacity="0.6" />
      {/* label */}
      <rect x="22" y="38" width="20" height="4" rx="0.5" fill="#FFFFFF" />
    </svg>
  );
};

// 3) Egg — fried egg with offset yolk
export const EggIcon = ({ active, className }: IconProps) => {
  const white = active ? "#FFFFFF" : "#EDEDED";
  const stroke = active ? "#FFC42E" : GRAY_DARK;
  const yolk = active ? "#FFC42E" : "#BFBFBF";
  return (
    <svg viewBox="0 0 64 64" className={cn(className)} xmlns="http://www.w3.org/2000/svg">
      {/* irregular egg white blob */}
      <path
        d="M14 32 Q12 18 24 14 Q34 10 42 16 Q54 20 52 32 Q56 42 46 48 Q36 54 26 50 Q12 46 14 32 Z"
        fill={white}
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* yolk - off center */}
      <circle cx="36" cy="30" r="9" fill={yolk} stroke={stroke} strokeWidth="2.5" />
      {/* small white highlight on yolk */}
      <circle cx="33" cy="27" r="2" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
};

// 4) Fish — blue with scales
export const FishIcon = ({ active, className }: IconProps) => {
  const body = active ? "#3B82C4" : GRAY;
  const dark = active ? "#2A6BA8" : GRAY_DARK;
  return (
    <svg viewBox="0 0 64 64" className={cn(className)} xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <path d="M6 32 Q16 16 34 18 Q48 20 52 32 Q48 44 34 46 Q16 48 6 32 Z" fill={body} />
      {/* tail */}
      <path d="M48 32 L60 22 L58 32 L60 42 Z" fill={body} />
      {/* scales */}
      <path d="M22 28 Q26 32 22 36" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M28 26 Q32 32 28 38" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M34 26 Q38 32 34 38" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M40 28 Q44 32 40 36" stroke={dark} strokeWidth="1.2" fill="none" opacity="0.5" />
      {/* eye */}
      <circle cx="14" cy="28" r="2" fill="#FFFFFF" />
      <circle cx="14" cy="28" r="1" fill="#222" />
      {/* gill */}
      <path d="M20 24 Q18 32 20 40" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
};

// 5) Chicken — whole roast chicken with steam
export const ChickenIcon = ({ active, className }: IconProps) => {
  const meat = active ? "#F08A3E" : GRAY;
  const meatDark = active ? "#D26E25" : GRAY_DARK;
  const steam = active ? "#D8D8D8" : "#E5E5E5";
  return (
    <svg viewBox="0 0 64 64" className={cn(className)} xmlns="http://www.w3.org/2000/svg">
      {/* steam wisps */}
      <path d="M22 8 Q20 12 22 16" stroke={steam} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 6 Q30 10 32 14" stroke={steam} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M42 8 Q44 12 42 16" stroke={steam} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* body - rounded plump shape */}
      <path
        d="M14 36 Q12 22 24 20 Q32 16 40 20 Q52 22 50 36 Q52 46 40 50 Q32 52 24 50 Q12 46 14 36 Z"
        fill={meat}
      />
      {/* drumsticks at bottom */}
      <ellipse cx="20" cy="50" rx="6" ry="5" fill={meat} />
      <ellipse cx="44" cy="50" rx="6" ry="5" fill={meat} />
      {/* small wing tips */}
      <ellipse cx="14" cy="38" rx="4" ry="6" fill={meatDark} opacity="0.6" />
      <ellipse cx="50" cy="38" rx="4" ry="6" fill={meatDark} opacity="0.6" />
      {/* shading line */}
      <path d="M22 42 Q32 46 42 42" stroke={meatDark} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
};

// 6) Ham — red ham steak with bone, steam
export const HamIcon = ({ active, className }: IconProps) => {
  const meat = active ? "#E84A3D" : GRAY;
  const meatDark = active ? "#C5342A" : GRAY_DARK;
  const bone = "#F5F1E6";
  const boneStroke = active ? "#A02519" : GRAY_DARK;
  const steam = active ? "#D8D8D8" : "#E5E5E5";
  return (
    <svg viewBox="0 0 64 64" className={cn(className)} xmlns="http://www.w3.org/2000/svg">
      {/* steam */}
      <path d="M22 8 Q20 12 22 16" stroke={steam} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 6 Q30 10 32 14" stroke={steam} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M42 8 Q44 12 42 16" stroke={steam} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* ham body - teardrop / steak shape */}
      <path
        d="M10 38 Q8 26 20 22 Q30 18 40 24 Q52 30 48 42 Q44 52 32 52 Q18 52 12 46 Q10 42 10 38 Z"
        fill={meat}
      />
      {/* highlight */}
      <path d="M16 30 Q22 26 30 28" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.35" />
      {/* protruding bone */}
      <path d="M44 28 L54 22" stroke={bone} strokeWidth="5" strokeLinecap="round" />
      <path d="M44 28 L54 22" stroke={boneStroke} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      <circle cx="55" cy="21" r="3.5" fill={bone} stroke={boneStroke} strokeWidth="1.2" />
    </svg>
  );
};

export type DietIconKey = "broccoli" | "milk" | "egg" | "fish" | "chicken" | "ham";

export const DIET_ICONS: Record<DietIconKey, (props: IconProps) => JSX.Element> = {
  broccoli: BroccoliIcon,
  milk: MilkIcon,
  egg: EggIcon,
  fish: FishIcon,
  chicken: ChickenIcon,
  ham: HamIcon,
};
