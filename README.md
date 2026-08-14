# 오늘 싸피밥

## 프로젝트 목적

SSAFY 대전캠퍼스 교육생이 휴대전화에서 오늘 점심과 현재 등록된 이번 주
식단을 빠르게 확인할 수 있도록 만든 작은 정적 웹사이트입니다. SSAFY 공식
서비스가 아닙니다. 실제 날짜 확인 여부와 샘플 여부는 `status`로 구분하고,
읽기 어려운 메뉴 원문은 갱신 근거로 데이터에만 보존합니다.

## 기술 스택

- Vite
- React
- TypeScript
- CSS
- Vitest
- ESLint
- Playwright
- GitHub Actions
- Netlify 정적 배포

백엔드 서버, 데이터베이스, 인증 기능을 사용하지 않는 정적 웹사이트입니다.

## 로컬 실행

Node.js 24 LTS를 사용합니다. `nvm`을 사용한다면 저장소의 `.nvmrc`로
버전을 맞출 수 있습니다.

```bash
nvm use
npm ci
npm run dev
```

터미널에 표시된 로컬 주소를 브라우저에서 엽니다.

## 품질 검사

```bash
# 단위 테스트
npm test

# 린트
npm run lint

# TypeScript 타입 검사
npm run typecheck

# 프로덕션 빌드
npm run build

# 반응형 브라우저 회귀 테스트 (최초 1회 Chromium 설치 필요)
npx playwright install chromium
npm run test:e2e
```

빌드 결과물은 `dist/`에 생성됩니다.
Pull Request와 `main` Push에서는 GitHub Actions가 위 검사를 자동 실행합니다.
브라우저 회귀 테스트는 실제 production build의 상태 독립 smoke 검사와
`DATE_VERIFIED`·`DATE_UNVERIFIED`·`SAMPLE` 고정 fixture 기반 시나리오를
분리합니다.
따라서 매주 바뀌는 운영 식단 내용이 상태별 UX 테스트의 전제가 되지 않습니다.

## 동적 사용자 경험

별도 서버 없이 React의 클라이언트 상태와 브라우저 API만 사용합니다.

- A/B 메뉴 룰렛의 결과를 `localStorage`에 저장해 새로고침 후에도 복원합니다.
- 선택은 서울 기준 오늘 날짜와 현재 식단의 `updatedAt`이 모두 일치할 때만
  유효합니다. 자정이 지나거나 식단이 갱신되면 자동으로 폐기합니다.
- Web Share API를 지원하는 환경에서는 오늘의 픽을 공유하고, 지원하지 않으면
  클립보드 복사를 시도합니다.
- 탭을 오래 열어 둬도 서울 자정, 탭 재노출, 브라우저 포커스 시 현재 날짜를
  다시 계산합니다.
- 룰렛과 결과 전환은 `prefers-reduced-motion` 설정을 존중합니다.

## 매주 식단 데이터 갱신

운영 식단 데이터는 [`src/data/meals.ts`](src/data/meals.ts) 한 곳에서 관리합니다.
`src/data/fixtures/`의 데이터는 상태별 UX 계약을 검증하는 테스트 전용 입력이며,
매주 식단을 갱신할 때 함께 수정하지 않습니다.

1. 해당 주의 A4 식단표 사진을 코드 수정 요청과 함께 첨부합니다.
2. 사진에서 **확실하게 읽히는 내용만** `src/data/meals.ts`에 반영합니다.
3. `weekStart`를 해당 주 월요일의 `YYYY-MM-DD`로 바꿉니다.
4. 월요일부터 금요일까지 각 `date`, `dayOfWeek`, `mealOptions`의
   `label`과 `menuItems`를 갱신합니다. 한 날에 선택 메뉴가 여러 개면 서로
   합치지 않고 별도 `mealOptions`로 기록합니다.
5. 각 option의 대표 음식이 사진에서 확실히 확인되면
   `representativeMenuItem`에 `menuItems`와 정확히 같은 메뉴명을 기록합니다.
   대표 음식을 확정할 수 없으면 추측하지 않고 `null`로 둡니다.
6. 읽기 어려운 원문은 추측하지 않고 해당 날짜의 `uncertainTexts`에 기록합니다.
7. 날짜·코너명처럼 한 주 전체에 적용되는 주의사항은 `sourceNotes`에 기록합니다.
8. 데이터 성격에 맞게 `status`를 설정합니다.
   - `DATE_VERIFIED`: 식단표의 실제 날짜를 확인함
   - `DATE_UNVERIFIED`: 메뉴와 월~금 요일 순서는 확인했지만 날짜 숫자를 확인하지 못함
   - `SAMPLE`: 실제 식단이 아닌 예시 데이터
9. `updatedAt`을 ISO 8601 형식으로 갱신합니다. 대한민국 시각은
   `2026-08-13T10:30:00+09:00`처럼 `+09:00` 오프셋을 사용합니다.
10. 테스트, 린트, 타입 검사, 빌드와 브라우저 회귀 테스트를 실행합니다.

사진 확인은 배포된 웹사이트가 아니라 식단 데이터를 갱신하는 코드 작업 과정에서만
이루어집니다.

## 데이터 확인 상태

- `DATE_VERIFIED`: 실제 날짜를 확인하여 오늘 메뉴와 A/B 룰렛을 제공합니다.
  화면에는 사진에서 확실하게 읽은 메뉴만 표시합니다.
- `DATE_UNVERIFIED`: 확인하지 못한 범위를 화면 상단에 공개하고, 임시 날짜를 오늘 식단으로
  단정하지 않습니다. 확인된 요일 순서에 따라 월~금으로 표시하되 실제 날짜 숫자는
  노출하지 않습니다.
- `SAMPLE`: 실제 SSAFY 식단이 아님을 명확히 표시합니다.

`uncertainTexts`와 `sourceNotes`는 식단 갱신 근거를 보존하는 내부 메타데이터이며
사용자 화면에는 표시하지 않습니다. 샘플 데이터는 `status: "SAMPLE"`, 날짜를
확인하지 못한 실제 사진 데이터는 `status: "DATE_UNVERIFIED"`로 기록합니다.

## Netlify 배포

운영 사이트는 [Netlify](https://ssafy-daejeon-meal.netlify.app/)에서 제공합니다.
Pull Request에는 Deploy Preview가 생성되고, `main`에 병합되면 production 배포가
자동으로 실행됩니다. Build Command는 `npm run build`, Publish Directory는
`dist`이며 별도 환경 변수는 필요하지 않습니다.

이 프로젝트에는 서버나 비밀 환경 변수가 필요하지 않습니다.
