/* eslint-disable react-refresh/only-export-components */
// Colorful flat illustration-style allergy icons
// Designed to feel friendly & info-graphic, matching the reference photo

type IconProps = { className?: string };

export const MilkAllergyIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M16 6 H32 V12 L36 18 V40 Q36 42 34 42 H14 Q12 42 12 40 V18 L16 12 Z" fill="#fff" stroke="#3a4a5a" strokeWidth="1.5" />
    <rect x="16" y="22" width="16" height="9" fill="#4FC3F7" />
    <text x="24" y="29" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff" fontFamily="sans-serif">MILK</text>
  </svg>
);

export const WheatIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M24 6 L24 42" stroke="#C68B3F" strokeWidth="2" />
    {[10, 16, 22, 28, 34].map((y, i) => (
      <g key={i}>
        <ellipse cx="18" cy={y} rx="5" ry="3" fill="#F4A93D" transform={`rotate(-25 18 ${y})`} />
        <ellipse cx="30" cy={y} rx="5" ry="3" fill="#F4A93D" transform={`rotate(25 30 ${y})`} />
      </g>
    ))}
    <ellipse cx="24" cy="8" rx="4" ry="3" fill="#F4A93D" />
  </svg>
);

export const PeanutsIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <ellipse cx="18" cy="22" rx="9" ry="13" fill="#D9A05B" transform="rotate(-20 18 22)" />
    <ellipse cx="30" cy="28" rx="9" ry="13" fill="#C68B3F" transform="rotate(15 30 28)" />
    <circle cx="16" cy="18" r="1.5" fill="#7a4a1a" opacity="0.5" />
    <circle cx="20" cy="26" r="1.5" fill="#7a4a1a" opacity="0.5" />
    <circle cx="30" cy="24" r="1.5" fill="#7a4a1a" opacity="0.5" />
    <circle cx="32" cy="32" r="1.5" fill="#7a4a1a" opacity="0.5" />
  </svg>
);

export const EggPoultryIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <ellipse cx="24" cy="26" rx="14" ry="17" fill="#FFE6D5" stroke="#E5B89A" strokeWidth="1.5" />
    <ellipse cx="20" cy="20" rx="4" ry="2.5" fill="#fff" opacity="0.7" />
  </svg>
);

export const BuckwheatIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="18" fill="#5C3A1E" />
    {[
      [16, 16], [24, 14], [32, 16], [14, 22], [22, 22], [30, 22], [38, 22],
      [16, 30], [24, 30], [32, 30], [20, 36], [28, 36],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="2.5" fill="#F5C76A" />
    ))}
  </svg>
);

export const CrabIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <ellipse cx="24" cy="26" rx="14" ry="9" fill="#E8463A" />
    <circle cx="19" cy="22" r="1.8" fill="#fff" />
    <circle cx="29" cy="22" r="1.8" fill="#fff" />
    <circle cx="19" cy="22" r="0.9" fill="#000" />
    <circle cx="29" cy="22" r="0.9" fill="#000" />
    <path d="M8 18 L4 12 M40 18 L44 12" stroke="#E8463A" strokeWidth="3" strokeLinecap="round" />
    <circle cx="4" cy="11" r="3" fill="#E8463A" />
    <circle cx="44" cy="11" r="3" fill="#E8463A" />
    <path d="M12 35 L8 40 M18 37 L16 42 M30 37 L32 42 M36 35 L40 40" stroke="#E8463A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const SoybeanIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M10 26 Q20 18 38 22 Q34 30 22 32 Q14 32 10 26 Z" fill="#A6C76A" />
    <circle cx="18" cy="26" r="3" fill="#D9E89A" />
    <circle cx="26" cy="26" r="3" fill="#D9E89A" />
    <circle cx="32" cy="25" r="3" fill="#D9E89A" />
    <path d="M34 18 L40 12" stroke="#6B8E3D" strokeWidth="1.5" />
    <ellipse cx="40" cy="11" rx="3" ry="2" fill="#A6C76A" transform="rotate(-30 40 11)" />
  </svg>
);

export const ShrimpIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M8 28 Q14 16 28 14 Q40 14 42 24 Q40 32 28 32 Q18 32 14 36 L8 38 Z" fill="#F26B3F" />
    <path d="M14 22 L18 22 M20 22 L24 22 M26 22 L30 22" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
    <circle cx="36" cy="20" r="1.5" fill="#000" />
  </svg>
);

export const PeachIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <circle cx="20" cy="28" r="12" fill="#FBC4A8" />
    <circle cx="30" cy="28" r="12" fill="#F69C7A" />
    <path d="M25 16 Q25 6 32 6" stroke="#7a4a1a" strokeWidth="1.5" fill="none" />
    <ellipse cx="34" cy="10" rx="4" ry="2.5" fill="#6B8E3D" transform="rotate(-20 34 10)" />
  </svg>
);

export const PorkIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    {[10, 18, 26, 34].map((x, i) => (
      <g key={i}>
        <rect x={x} y="10" width="6" height="28" rx="1" fill="#F2A8A0" />
        <rect x={x} y="10" width="6" height="6" fill="#fff" />
        <rect x={x} y="22" width="6" height="4" fill="#fff" />
        <rect x={x} y="32" width="6" height="4" fill="#fff" />
      </g>
    ))}
  </svg>
);

export const BeefIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M8 22 Q16 12 28 14 Q42 16 40 28 Q36 38 22 36 Q10 34 8 22 Z" fill="#D85B5B" />
    <path d="M14 24 Q20 22 26 26 Q22 30 16 28 Z" fill="#F2C5C5" />
    <path d="M28 22 Q34 24 36 30 Q30 30 28 26 Z" fill="#F2C5C5" />
  </svg>
);

export const TomatoIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="28" r="14" fill="#E64A3F" />
    <path d="M16 14 L20 18 M24 12 L24 18 M32 14 L28 18" stroke="#4C9A3A" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="20" cy="24" rx="3" ry="2" fill="#fff" opacity="0.4" />
  </svg>
);

export const MackerelIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M4 24 L12 18 L12 30 Z" fill="#3A6FA0" />
    <ellipse cx="26" cy="24" rx="16" ry="9" fill="#5BA0D0" />
    <path d="M14 20 L42 19 M14 24 L42 24 M14 28 L42 28" stroke="#3A6FA0" strokeWidth="1" />
    <circle cx="36" cy="22" r="1.5" fill="#000" />
  </svg>
);

export const ChickenMeatIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <ellipse cx="24" cy="26" rx="14" ry="11" fill="#FBD3B8" />
    <path d="M14 32 L10 40 L14 41 L17 34 Z" fill="#E8E2D0" />
    <path d="M34 32 L38 40 L34 41 L31 34 Z" fill="#E8E2D0" />
    <path d="M16 22 Q24 18 32 22" stroke="#D89878" strokeWidth="1.5" fill="none" />
  </svg>
);

export const SquidIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M16 6 L32 6 Q36 6 36 12 L36 24 Q36 28 32 28 L16 28 Q12 28 12 24 L12 12 Q12 6 16 6 Z" fill="#F19D8E" />
    {[14, 18, 22, 26, 30, 34].map((x, i) => (
      <path key={i} d={`M${x} 28 Q${x + (i % 2 ? 2 : -2)} 36 ${x} 44`} stroke="#F19D8E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    ))}
    <circle cx="20" cy="16" r="1.5" fill="#000" />
    <circle cx="28" cy="16" r="1.5" fill="#000" />
  </svg>
);

export const ShellfishIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M24 6 Q8 14 8 28 Q8 38 24 38 Q40 38 40 28 Q40 14 24 6 Z" fill="#F0E6D2" stroke="#A8967A" strokeWidth="1.5" />
    {[14, 19, 24, 29, 34].map((x, i) => (
      <line key={i} x1={x} y1="10" x2={x} y2="36" stroke="#A8967A" strokeWidth="0.8" />
    ))}
  </svg>
);

export const WalnutIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="16" fill="#A06A3F" />
    <path d="M24 8 L24 40 M10 18 Q24 22 38 18 M10 30 Q24 26 38 30 M14 12 Q20 24 14 36 M34 12 Q28 24 34 36"
      stroke="#5C3A1E" strokeWidth="1.5" fill="none" />
  </svg>
);

export const SulfitesIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path d="M14 6 L34 6 Q34 18 24 22 Q14 18 14 6 Z" fill="#7A1F3F" />
    <rect x="22" y="22" width="4" height="14" fill="#A8967A" />
    <ellipse cx="24" cy="40" rx="10" ry="3" fill="#A8967A" />
    <ellipse cx="20" cy="11" rx="3" ry="2" fill="#fff" opacity="0.3" />
  </svg>
);

export const ALLERGY_ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  milk: MilkAllergyIcon,
  wheat: WheatIcon,
  peanuts: PeanutsIcon,
  "poultry-eggs": EggPoultryIcon,
  buckwheat: BuckwheatIcon,
  crab: CrabIcon,
  soybean: SoybeanIcon,
  shrimp: ShrimpIcon,
  peach: PeachIcon,
  pork: PorkIcon,
  beef: BeefIcon,
  tomato: TomatoIcon,
  mackerel: MackerelIcon,
  chicken: ChickenMeatIcon,
  squid: SquidIcon,
  shellfish: ShellfishIcon,
  "walnut-pinenut": WalnutIcon,
  sulfites: SulfitesIcon,
};
