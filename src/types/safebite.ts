export type DietType =
  | "none"
  | "vegan"
  | "lacto"
  | "ovo"
  | "lacto-ovo"
  | "pescatarian"
  | "pollo"
  | "flexitarian"
  | "vegetarian"; // legacy alias, treated like lacto-ovo

export type Allergy =
  | "milk"
  | "wheat"
  | "peanuts"
  | "poultry-eggs"
  | "buckwheat"
  | "crab"
  | "soybean"
  | "shrimp"
  | "peach"
  | "pork"
  | "beef"
  | "tomato"
  | "mackerel"
  | "chicken"
  | "squid"
  | "shellfish"
  | "walnut-pinenut"
  | "sulfites"
  // legacy values kept so older saved prefs don't break
  | "fish"
  | "nuts"
  | "eggs"
  | "dairy"
  | "gluten"
  | "soy"
  | "sesame";

export type SafetyLevel = "safe" | "caution" | "danger";

export interface UserPreferences {
  diet: DietType;
  allergies: Allergy[];
  language: "EN" | "KO" | "CN" | "JP";
}

export interface Nutrition {
  servingSize: string;
  calories: number;
  sodium: number;
  protein: number;
  potassium: number;
  phosphorus: number;
}

export interface AnalysisResult {
  foodName: string;
  imageUrl?: string;
  safety: SafetyLevel;
  reason: string;
  ingredients: string[];
  riskTags: string[];
  confidence: number;
  alternatives: { name: string; note: string }[];
  nutrition?: Nutrition;
}
