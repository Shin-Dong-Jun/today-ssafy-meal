# 오늘 싸피밥

## 프로젝트 목적

SSAFY 대전캠퍼스 교육생이 휴대전화에서 오늘 점심과 현재 등록된 이번 주
식단을 빠르게 확인할 수 있도록 만든 작은 정적 웹사이트입니다. SSAFY 공식
서비스가 아닙니다. 저장된 데이터가 실제 식단인지 샘플인지는 `isSample`로
구분합니다.

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

식단 데이터는 [`src/data/meals.ts`](src/data/meals.ts) 한 곳에서 관리합니다.

1. 해당 주의 A4 식단표 사진을 코드 수정 요청과 함께 첨부합니다.
2. 사진에서 **확실하게 읽히는 내용만** `src/data/meals.ts`에 반영합니다.
3. `weekStart`를 해당 주 월요일의 `YYYY-MM-DD`로 바꿉니다.
4. 월요일부터 금요일까지 각 `date`, `dayOfWeek`, `mealOptions`의
   `label`과 `menuItems`를 갱신합니다. 한 날에 선택 메뉴가 여러 개면 서로
   합치지 않고 별도 `mealOptions`로 기록합니다.
5. 읽기 어려운 원문은 추측하지 않고 해당 날짜의 `uncertainTexts`에 기록합니다.
6. `updatedAt`을 ISO 8601 형식으로 갱신합니다. 대한민국 시각은
   `2026-08-13T10:30:00+09:00`처럼 `+09:00` 오프셋을 사용합니다.
7. 실제 식단을 입력했다면 `isSample`을 `false`로 바꿉니다.
8. 테스트, 린트, 타입 검사와 빌드를 실행합니다.

사진 확인은 배포된 웹사이트가 아니라 식단 데이터를 갱신하는 코드 작업 과정에서만
이루어집니다.

## 샘플 데이터와 실제 데이터 구분

- `isSample: true`: 화면 상단에 `현재 화면은 샘플 식단입니다.` 안내가 표시됩니다.
- `isSample: false`: 실제 식단표를 확인해 입력한 데이터라는 뜻이며 샘플 안내가
  표시되지 않습니다.

샘플 데이터를 사용할 때는 반드시 `isSample: true` 상태를 유지합니다. 실제
식단표를 반영하지 않은 채 이 값을 `false`로 바꾸면 안 됩니다.

## Netlify 배포

운영 사이트는 [Netlify](https://ssafy-daejeon-meal.netlify.app/)에서 제공합니다.
Pull Request에는 Deploy Preview가 생성되고, `main`에 병합되면 production 배포가
자동으로 실행됩니다. Build Command는 `npm run build`, Publish Directory는
`dist`이며 별도 환경 변수는 필요하지 않습니다.

이 프로젝트에는 서버나 비밀 환경 변수가 필요하지 않습니다.
