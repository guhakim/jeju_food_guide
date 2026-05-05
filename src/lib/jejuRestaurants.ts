import { DietType, Allergy } from "@/types/safebite";

export interface FallbackRestaurant {
  name: string;
  region: string;
  signatureMenu: string;
  reason: string;
  address: string;
  phone?: string;
  hours: string;
  priceRange: string;
  mapsUrl: string;
  // tags for filtering
  veganFriendly: boolean;
  vegetarianFriendly: boolean;
  pescatarianOnly?: boolean;
  contains: Allergy[];
}

const mapUrl = (q: string) => `https://www.google.com/maps/search/${encodeURIComponent(q + " 제주")}`;

export const JEJU_RESTAURANTS: FallbackRestaurant[] = [
  {
    name: "슬로보트 (Slowboat)",
    region: "제주시 한림",
    signatureMenu: "비건 버거 · 채식 플레이트",
    reason: "비건/채식 메뉴를 메인으로 제공하는 제주 대표 비건 친화 식당.",
    address: "제주특별자치도 제주시 한림읍 한림로",
    hours: "11:00 - 20:00 (수 휴무)",
    priceRange: "₩12,000 - 22,000",
    mapsUrl: mapUrl("슬로보트 제주 한림"),
    veganFriendly: true,
    vegetarianFriendly: true,
    contains: ["wheat", "soybean"],
  },
  {
    name: "제주식물 (Jeju Sikmul)",
    region: "제주시 구좌",
    signatureMenu: "비건 카레 · 두부 스테이크",
    reason: "동물성 재료 없는 식물 기반 메뉴. 비건·락토오보 모두 안심.",
    address: "제주특별자치도 제주시 구좌읍 세화리",
    hours: "11:30 - 19:00 (화 휴무)",
    priceRange: "₩13,000 - 18,000",
    mapsUrl: mapUrl("제주식물 구좌"),
    veganFriendly: true,
    vegetarianFriendly: true,
    contains: ["soybean", "wheat"],
  },
  {
    name: "모시토끼 (Mosi Tokki)",
    region: "서귀포시 중문",
    signatureMenu: "비건 떡볶이 · 채식 김밥",
    reason: "비건 분식 전문점. 한국식 분식을 동물성 재료 없이.",
    address: "제주특별자치도 서귀포시 중문동",
    hours: "11:00 - 20:00",
    priceRange: "₩8,000 - 15,000",
    mapsUrl: mapUrl("모시토끼 서귀포"),
    veganFriendly: true,
    vegetarianFriendly: true,
    contains: ["wheat", "soybean"],
  },
  {
    name: "카페 오라 (Cafe Ora)",
    region: "제주시 애월",
    signatureMenu: "비건 브런치 · 두유 라떼",
    reason: "오션뷰 비건 카페. 락토 베지테리언을 위한 메뉴 옵션도 제공.",
    address: "제주특별자치도 제주시 애월읍 곽지리",
    hours: "10:00 - 21:00",
    priceRange: "₩9,000 - 20,000",
    mapsUrl: mapUrl("카페 오라 애월"),
    veganFriendly: true,
    vegetarianFriendly: true,
    contains: ["wheat", "milk", "soybean"],
  },
  {
    name: "닐모리동동",
    region: "제주시 애월",
    signatureMenu: "전복 비빔밥 · 해물 솥밥",
    reason: "신선한 제주 해산물 요리. 페스코 베지테리언과 해산물 OK인 식단에 추천.",
    address: "제주특별자치도 제주시 애월읍 곽지리",
    hours: "10:00 - 21:00",
    priceRange: "₩15,000 - 30,000",
    mapsUrl: mapUrl("닐모리동동 애월"),
    veganFriendly: false,
    vegetarianFriendly: false,
    pescatarianOnly: true,
    contains: ["shellfish", "shrimp", "crab", "squid"],
  },
  {
    name: "명리동식당",
    region: "제주시 노형",
    signatureMenu: "흑돼지 근고기",
    reason: "제주 흑돼지 정통 맛집. 육식 OK인 플렉시테리언/제한 없음 추천.",
    address: "제주특별자치도 제주시 노형동",
    hours: "12:00 - 22:00",
    priceRange: "₩20,000 - 40,000",
    mapsUrl: mapUrl("명리동식당 제주 흑돼지"),
    veganFriendly: false,
    vegetarianFriendly: false,
    contains: ["pork", "soybean"],
  },
  {
    name: "무거버거",
    region: "서귀포시 안덕",
    signatureMenu: "흑돼지 버거 · 비건 버거",
    reason: "비건 버거 옵션과 흑돼지 버거 모두 제공. 다양한 식단 동반자에 추천.",
    address: "제주특별자치도 서귀포시 안덕면",
    hours: "10:30 - 19:00",
    priceRange: "₩9,000 - 16,000",
    mapsUrl: mapUrl("무거버거 안덕"),
    veganFriendly: true,
    vegetarianFriendly: true,
    contains: ["wheat", "milk", "soybean"],
  },
  {
    name: "푸른밤 식탁",
    region: "제주시 조천",
    signatureMenu: "한치 물회 · 갈치조림",
    reason: "신선한 제주 생선 요리. 페스코 베지테리언/해산물 가능 식단에 적합.",
    address: "제주특별자치도 제주시 조천읍",
    hours: "11:00 - 21:00",
    priceRange: "₩14,000 - 28,000",
    mapsUrl: mapUrl("푸른밤 제주 조천"),
    veganFriendly: false,
    vegetarianFriendly: false,
    pescatarianOnly: true,
    contains: ["squid", "mackerel", "shellfish"],
  },
];

export function pickFallbackRestaurants(diet: DietType, allergies: Allergy[]): FallbackRestaurant[] {
  let pool = JEJU_RESTAURANTS;

  if (diet === "vegan") {
    pool = pool.filter((r) => r.veganFriendly);
  } else if (diet === "lacto" || diet === "ovo" || diet === "lacto-ovo" || diet === "vegetarian") {
    pool = pool.filter((r) => r.vegetarianFriendly);
  } else if (diet === "pescatarian") {
    pool = pool.filter((r) => r.vegetarianFriendly || r.pescatarianOnly);
  } else if (diet === "pollo") {
    pool = pool.filter((r) => !r.contains.includes("pork") && !r.contains.includes("beef"));
  }
  // flexitarian / none: no diet filter

  // Filter out restaurants that contain user's allergens
  if (allergies.length > 0) {
    const filtered = pool.filter((r) => !r.contains.some((c) => allergies.includes(c)));
    if (filtered.length >= 3) pool = filtered;
  }

  return pool.slice(0, 5);
}
