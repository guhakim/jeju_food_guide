import { AnalysisResult, Allergy, UserPreferences, SafetyLevel } from "@/types/safebite";

interface FoodEntry {
  name: string;
  ingredients: string[];
  risks: Allergy[];
  containsMeat?: boolean;
  containsSeafood?: boolean;
  containsDairy?: boolean;
  containsEgg?: boolean;
  alternatives: { name: string; note: string }[];
}

const FOOD_DB: Record<string, FoodEntry> = {
  "black pork bbq": {
    name: "Jeju Black Pork BBQ (흑돼지)",
    ingredients: ["Black pork belly", "Garlic", "Ssamjang", "Lettuce", "Sesame oil"],
    risks: ["soy", "sesame"],
    containsMeat: true,
    alternatives: [
      { name: "Grilled mushroom ssam", note: "Plant-based wrap with same dipping experience" },
      { name: "Tofu jeon", note: "Pan-fried tofu, vegetarian friendly" },
    ],
  },
  "abalone porridge": {
    name: "Abalone Porridge (전복죽)",
    ingredients: ["Abalone", "Rice", "Sesame oil", "Carrot", "Seaweed"],
    risks: ["shellfish", "sesame"],
    containsSeafood: true,
    alternatives: [
      { name: "Pumpkin porridge (호박죽)", note: "Sweet, vegan, no seafood" },
      { name: "Vegetable juk", note: "Mixed vegetable rice porridge" },
    ],
  },
  "bibimbap": {
    name: "Bibimbap (비빔밥)",
    ingredients: ["Rice", "Spinach", "Carrot", "Bean sprouts", "Egg", "Beef", "Gochujang"],
    risks: ["eggs", "soy", "sesame"],
    containsMeat: true,
    containsEgg: true,
    alternatives: [
      { name: "Vegan bibimbap", note: "Ask: no egg, no meat, tofu instead" },
      { name: "Bibim guksu", note: "Spicy cold noodles — request no egg" },
    ],
  },
  "haemul pajeon": {
    name: "Seafood Pancake (해물파전)",
    ingredients: ["Wheat flour", "Squid", "Shrimp", "Green onion", "Egg"],
    risks: ["shellfish", "fish", "gluten", "eggs"],
    containsSeafood: true,
    containsEgg: true,
    alternatives: [
      { name: "Kimchi jeon", note: "Vegetarian — confirm no fish sauce in kimchi" },
      { name: "Pa jeon (scallion only)", note: "Skip the seafood version" },
    ],
  },
  "kimchi stew": {
    name: "Kimchi Jjigae (김치찌개)",
    ingredients: ["Kimchi", "Pork", "Tofu", "Anchovy broth", "Gochugaru"],
    risks: ["fish", "soy"],
    containsMeat: true,
    containsSeafood: true,
    alternatives: [
      { name: "Doenjang jjigae (vegan)", note: "Request vegetable broth only" },
      { name: "Sundubu (vegetarian)", note: "Soft tofu stew, no meat option" },
    ],
  },
  "고기국수": {
    name: "Gogi Guksu / Meat Noodles (고기국수)",
    ingredients: ["Pork broth", "Pork slices", "Wheat noodles", "Green onion", "Sesame"],
    risks: ["wheat", "pork", "sesame"],
    containsMeat: true,
    alternatives: [
      { name: "Myeolchi guksu (멸치국수)", note: "Anchovy broth instead of pork" },
      { name: "Bibim guksu (비빔국수)", note: "Spicy noodles without meat broth" },
    ],
  },
};

const DEFAULT: FoodEntry = {
  name: "Korean dish",
  ingredients: ["Rice", "Soy sauce", "Sesame oil", "Garlic", "Vegetables"],
  risks: ["soy", "sesame"],
  alternatives: [
    { name: "Steamed rice + side vegetables", note: "Safe baseline option" },
    { name: "Fresh fruit plate", note: "Try Jeju hallabong oranges" },
  ],
};

export function analyzeFood(input: string, prefs: UserPreferences, imageUrl?: string): AnalysisResult {
  let key = input.toLowerCase().trim();
  
  // Mock vision AI: if no text input but image is provided, assume it's Gogi Guksu for the demo
  if (!key && imageUrl) {
    key = "고기국수";
  }

  const match = Object.entries(FOOD_DB).find(([k, v]) => key.includes(k) || k.includes(key) || v.name.toLowerCase().includes(key));
  const entry = match ? match[1] : { ...DEFAULT, name: input ? `${input} (estimated)` : DEFAULT.name };

  const reasons: string[] = [];
  let level: SafetyLevel = "safe";

  // Diet checks
  if (prefs.diet === "vegan") {
    if (entry.containsMeat || entry.containsSeafood || entry.containsDairy || entry.containsEgg) {
      level = "danger";
      reasons.push("Contains animal products — not vegan");
    }
    if (entry.ingredients.some((i) => /anchovy|fish|broth/i.test(i))) {
      level = "danger";
      reasons.push("May use anchovy/fish broth");
    }
  } else if (prefs.diet === "lacto") {
    if (entry.containsMeat || entry.containsSeafood || entry.containsEgg) {
      level = "danger";
      reasons.push("Contains meat, seafood or egg — not lacto vegetarian");
    }
  } else if (prefs.diet === "ovo") {
    if (entry.containsMeat || entry.containsSeafood || entry.containsDairy) {
      level = "danger";
      reasons.push("Contains meat, seafood or dairy — not ovo vegetarian");
    }
  } else if (prefs.diet === "lacto-ovo" || prefs.diet === "vegetarian") {
    if (entry.containsMeat || entry.containsSeafood) {
      level = "danger";
      reasons.push("Contains meat or seafood");
    }
  } else if (prefs.diet === "pescatarian") {
    if (entry.containsMeat) {
      level = "danger";
      reasons.push("Contains meat");
    }
  } else if (prefs.diet === "pollo") {
    if (entry.ingredients.some((i) => /beef|pork|lamb|ham/i.test(i))) {
      level = "danger";
      reasons.push("Contains red meat — not pollo vegetarian");
    }
  }
  // flexitarian & none → no diet restriction

  // Allergy checks
  const hits = prefs.allergies.filter((a) => entry.risks.includes(a));
  if (hits.length > 0) {
    level = "danger";
    reasons.push(`Allergen risk: ${hits.join(", ")}`);
  }

  // Caution if hidden risks but no direct hit
  if (level === "safe" && entry.risks.length > 0) {
    level = "caution";
    reasons.push(`May contain: ${entry.risks.join(", ")}. Confirm with the restaurant.`);
  }

  if (reasons.length === 0) reasons.push("Matches your preferences with no detected risks.");

  const confidence = match ? 88 + Math.floor(Math.random() * 8) : 62 + Math.floor(Math.random() * 12);

  return {
    foodName: entry.name,
    imageUrl,
    safety: level,
    reason: reasons.join(" • "),
    ingredients: entry.ingredients,
    riskTags: entry.risks,
    confidence,
    alternatives: entry.alternatives,
  };
}
