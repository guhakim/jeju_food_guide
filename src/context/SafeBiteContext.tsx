/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode } from "react";
import { AnalysisResult, UserPreferences } from "@/types/safebite";

interface Ctx {
  prefs: UserPreferences;
  setPrefs: (p: UserPreferences) => void;
  result: AnalysisResult | null;
  setResult: (r: AnalysisResult | null) => void;
}

const SafeBiteCtx = createContext<Ctx | null>(null);

export const SafeBiteProvider = ({ children }: { children: ReactNode }) => {
  const [prefs, setPrefs] = useState<UserPreferences>({ diet: "none", allergies: [], language: "KO" });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  return <SafeBiteCtx.Provider value={{ prefs, setPrefs, result, setResult }}>{children}</SafeBiteCtx.Provider>;
};

export const useSafeBite = () => {
  const ctx = useContext(SafeBiteCtx);
  if (!ctx) throw new Error("useSafeBite must be used within SafeBiteProvider");
  return ctx;
};
