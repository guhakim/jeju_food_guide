import { AnalysisResult } from "@/types/safebite";

const KEY = "safebite.saved.v1";

export interface SavedFood extends AnalysisResult {
  id: string;
  savedAt: number;
}

export function getSavedFoods(): SavedFood[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Compress a data URL image to keep localStorage size manageable on mobile.
 * Resizes to max 640px on the longest side and re-encodes as JPEG q=0.7.
 */
async function compressImage(dataUrl: string, maxSize = 640, quality = 0.7): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:image")) return dataUrl;
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
    const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
    const w = Math.round(img.width * ratio);
    const h = Math.round(img.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return dataUrl;
  }
}

function trySetItem(list: SavedFood[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export async function saveFood(result: AnalysisResult): Promise<SavedFood> {
  // Compress image first to avoid mobile localStorage quota issues
  let imageUrl = result.imageUrl;
  if (imageUrl && imageUrl.startsWith("data:")) {
    imageUrl = await compressImage(imageUrl);
  }

  const item: SavedFood = {
    ...result,
    imageUrl,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: Date.now(),
  };

  const existing = getSavedFoods();
  // dedupe identical foodName saved within last 5s
  let list = existing.filter(
    (f) => !(f.foodName === item.foodName && Date.now() - f.savedAt < 5000),
  );
  list.unshift(item);
  list = list.slice(0, 100);

  // Try to save; if quota exceeded, drop oldest entries until it fits
  while (!trySetItem(list)) {
    if (list.length <= 1) {
      // Last resort: drop the image from the new item
      const stripped = { ...item, imageUrl: undefined };
      try {
        localStorage.setItem(KEY, JSON.stringify([stripped]));
        return stripped;
      } catch {
        throw new Error("Storage full");
      }
    }
    list.pop(); // remove oldest
  }

  return item;
}

export function deleteSavedFood(id: string) {
  const list = getSavedFoods().filter((f) => f.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function isSaved(foodName: string): boolean {
  return getSavedFoods().some((f) => f.foodName === foodName);
}
