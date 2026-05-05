# 🍊 SafeBite Jeju

> 제주를 여행하는 외국인 관광객을 위한 AI 기반 음식 안전 가이드

**Live →** [https://jeju-food-guide.vercel.app](https://jeju-food-guide.vercel.app)

---

## 기획 배경

제주도를 찾는 외국인 관광객이 연간 100만 명을 넘어섰지만, 언어 장벽으로 인해 음식 성분을 확인하기 어렵습니다. 특히 비건·채식주의자나 알레르기가 있는 여행객은 메뉴를 보고도 "이 음식을 먹어도 될까?" 라는 불안을 안고 식사를 합니다.

**SafeBite Jeju**는 음식 사진을 찍거나 이름을 입력하면 즉시 안전 여부를 알려주는 앱입니다.

---

## 핵심 기능

| 기능 | 설명 |
|------|------|
| 📸 사진 분석 | 음식 사진을 업로드하면 AI가 메뉴를 인식하고 안전 등급을 판정 |
| ✍️ 텍스트 입력 | 메뉴 이름을 직접 입력해서 분석 |
| 🌿 식단 설정 | 비건, 채식(락토·오보·페스코 등 8가지), 플렉시테리언 지원 |
| ⚠️ 알레르기 필터 | 한국 식품안전처 기준 18가지 알레르기 항목 |
| 🔴🟡🟢 안전 등급 | Safe / Caution / Danger 3단계로 즉시 판정 |
| 🍽️ 대안 음식 추천 | 위험 음식 대신 먹을 수 있는 대안 제시 |
| 📊 영양 정보 | 칼로리, 나트륨, 단백질 등 영양 성분 시각화 |
| 📍 주변 식당 추천 | 제주 지역 식단 친화적 식당 목록 |
| 🔖 저장 기능 | 분석한 음식 기록 저장 및 재확인 |
| 🌐 4개 언어 지원 | 한국어 · 영어 · 중국어 · 일본어 |

---

## 개발 과정

### 1단계 — 기획 (아이디어 정의)

- **타겟**: 제주도를 방문하는 외국인 관광객 (특히 비건·채식·알레르기 보유자)
- **핵심 문제**: 제주 음식 메뉴는 한국어 위주 → 성분 파악 불가
- **해결책**: 사진 한 장으로 즉시 안전 여부를 다국어로 알려주는 AI 가이드

### 2단계 — 설계 (데이터 모델 & UX 흐름)

```
홈 (언어 선택) → 입력 (사진/텍스트 + 식단 설정) → 분석 결과 → 저장
```

- 식단 타입: `vegan | lacto | ovo | lacto-ovo | pescatarian | pollo | flexitarian`
- 알레르기: 한국 식품안전처 고시 기준 18종 (우유, 밀, 땅콩, 갑각류 등)
- 안전 등급: `safe | caution | danger`

### 3단계 — 개발 (기술 구현)

- **프레임워크**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui 컴포넌트
- **라우팅**: React Router v6 (SPA)
- **백엔드**: Supabase (인증 및 데이터 저장)
- **AI 분석**: 음식 DB 기반 안전 판정 + Fallback 로직
- **다국어**: 커스텀 i18n 시스템 (EN/KO/CN/JP 전환)

### 4단계 — 배포

| 플랫폼 | URL | 용도 |
|--------|-----|------|
| Vercel | [jeju-food-guide.vercel.app](https://jeju-food-guide.vercel.app) | 메인 서비스 |
| GitHub Pages | [guhakim.github.io/jeju_food_guide](https://guhakim.github.io/jeju_food_guide) | 백업 |

---

## 기술 스택

```
Frontend   React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui
Routing    React Router v6
Backend    Supabase
Deploy     Vercel · GitHub Pages (Actions)
Test       Vitest · Testing Library
```

---

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env에 Supabase 키 입력

# 3. 개발 서버 시작
npm run dev
```

환경 변수:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

## 화면 구성

```
/          홈 — 히어로 배너 + 기능 소개
/input     입력 — 사진 업로드 또는 텍스트 입력 + 식단/알레르기 설정
/result    결과 — 안전 등급 · 성분 · 영양 · 대안 · 주변 식당
/saved     저장 — 분석 기록 모아보기
```

---

## 지원 식단 & 알레르기

**식단** (8종): 제한 없음 · 비건 · 락토 · 오보 · 락토오보 · 페스코 · 폴로 · 플렉시테리언

**알레르기** (18종): 우유 · 밀 · 땅콩 · 달걀 · 메밀 · 게 · 대두 · 새우 · 복숭아 · 돼지고기 · 쇠고기 · 토마토 · 고등어 · 닭고기 · 오징어 · 굴/전복/홍합 · 호두/잣 · 아황산류

---

© SafeBite Jeju · Travel safely, eat happily 🍊
