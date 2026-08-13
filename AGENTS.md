# AGENTS.md

- 이 프로젝트는 Vite, React, TypeScript로 만든 간단한 정적 웹사이트다.
- 불필요한 서버, 데이터베이스, 인증 또는 관리자 기능을 추가하지 않는다.
- 식단표 사진을 받으면 `src/data/meals.ts`를 갱신한다.
- 사진에서 확인되지 않는 메뉴는 추측하지 않는다.
- 읽기 어려운 내용은 해당 날짜의 `uncertainTexts`에 기록한다.
- 날짜나 표 구조처럼 한 주 전체의 확인되지 않은 내용은 `sourceNotes`에 기록한다.
- 실제 날짜를 확인한 경우에만 `status`를 `DATE_VERIFIED`로 설정하고, 날짜를 확인하지 못하면 `DATE_UNVERIFIED`, 예시 데이터는 `SAMPLE`을 사용한다.
- 식단 갱신 시 ISO 8601 형식의 `updatedAt`도 변경한다.
- 변경 후 `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`를 실행한다.
- 모든 작업은 검증이 성공하면 별도 확인 없이 작업 브랜치 생성, 커밋, Push, PR 생성, `main` 병합 및 실제 배포 확인까지 완료한다.
- 사용자가 작업의 중단이나 보류를 요청하면 Git 작업과 배포를 진행하지 않는다.
