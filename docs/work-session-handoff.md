# SSAFY 교육장 작업 인수인계

마지막 확인: 2026-08-14 KST

이 문서는 SSAFY 교육장 Windows PC에서 `today-ssafy-meal` 작업을 안전하게
이어가기 위한 체크리스트다. 문서에 적힌 commit은 과거 체크포인트이므로, 실제
최신 상태는 항상 `git fetch --prune origin` 이후의 `origin/main`을 기준으로
판단한다.

## 1. 바로 확인할 정보

- GitHub: <https://github.com/Shin-Dong-Jun/today-ssafy-meal>
- 운영 사이트: <https://ssafy-daejeon-meal.netlify.app/>
- 원격 기능 기준선: `83c130d` (`feat: refine weekly meal trust and menu hierarchy`, PR #14)
- 테스트 격리 기준선: `27eeebf` (`test: decouple E2E scenarios from production meal data`, PR #13)
- 기준선 CI: [GitHub Actions run 31770604809](https://github.com/Shin-Dong-Jun/today-ssafy-meal/actions/runs/31770604809) 성공
- 인수인계 문서와 Node 24 호환성 수정: PR #15
- 배포 주의: 2026-08-14 재감사 때 Netlify production이 `27eeebf`에 머물고
  `83c130d` 배포 기록은 없었다. PR #15 마무리 조건은 최종 `origin/main`과
  production deploy SHA가 정확히 일치하는지 재확인하는 것이다.

PR #15가 병합되면 `main` SHA는 위 기능 기준선보다 새로워진다. 고정 SHA로
되돌아가지 말고 아래 안전 재개 절차로 최신 `origin/main`을 받는다.

## 2. 프로젝트와 현재 운영 상태

이 프로젝트는 Vite, React 19, TypeScript, CSS로 만든 정적 사이트다. Node.js
24.x를 사용하며 Vitest, ESLint, Playwright, GitHub Actions, Netlify로 검증하고
배포한다. 백엔드 서버, 데이터베이스, 인증, 관리자 기능, 비밀 환경 변수는 없다.

현재 `src/data/meals.ts`의 운영 데이터는 다음 상태다.

- `weekStart`: `2026-08-10`
- `updatedAt`: `2026-08-14T11:50:46+09:00`
- `status`: `DATE_VERIFIED`
- 제공자가 실제 주간 날짜와 일부 대표 메뉴 구성을 확인했다. 확정하지 못한 원문과
  판독 근거는 `uncertainTexts`와 `sourceNotes`에 내부 메타데이터로만 보존한다.
- 현재 주의 평일 오늘 레코드가 있고 판독된 `mealOptions`가 정확히 2개이면 오늘
  메뉴와 A/B 룰렛을 제공한다. 주말, 다른 주차, 오늘 레코드 없음은 해당 상태에
  맞는 안내를 표시한다. option 수가 정확히 2개가 아니면 메뉴는 표시하되 룰렛만
  숨긴다.

현재 구현된 주요 UX는 다음과 같다.

- 모바일 하단 fixed / 데스크톱 sticky 식단 navigator와 scrollspy
- 날짜 미확인·샘플 또는 날짜 확인된 지난·예정 식단에만 노출되는 신뢰 안내
- `DATE_UNVERIFIED`에서는 월~금 요일만 표시하고 날짜 숫자·오늘 표시·룰렛은 숨김
- 확정된 `representativeMenuItem`의 `메인` badge와 파란 강조
- `sourceNotes`와 날짜별 `uncertainTexts`는 사용자 화면에 노출하지 않음
- `DATE_VERIFIED`일 때 A/B 룰렛, 오늘의 픽 저장·복원·취소·공유
- 서울 자정, 탭 재노출, 브라우저 focus 시 현재 날짜 갱신
- Web Share API와 clipboard fallback
- 메뉴명에 포함된 단백질 관련 keyword 표시 — 영양 성분 판정은 아님
- keyboard/focus 관리, 반응형 UI, `prefers-reduced-motion` 지원

## 3. 교육장 PC에 처음 clone할 때

### 필수 도구

- Git
- Node.js 24.x (`.nvmrc`와 `package.json` 기준)
- npm
- GitHub CLI `gh` — Push·PR·병합까지 진행할 때 필요

OneDrive 동기화 폴더보다 `C:\dev`처럼 짧은 영문 경로를 권장한다. 교육장 정책상
해당 경로를 만들 수 없다면 사용자 폴더 아래의 동기화되지 않는 경로를 사용한다.

PowerShell에서 실행한다.

```powershell
New-Item -ItemType Directory -Force C:\dev | Out-Null
Set-Location C:\dev

git clone https://github.com/Shin-Dong-Jun/today-ssafy-meal.git
Set-Location .\today-ssafy-meal

git fetch --prune origin
git switch main
git pull --ff-only origin main
git status --short --branch
git log -1 --oneline --decorate
```

Node 버전을 반드시 확인한다. `nvm-windows`는 `.nvmrc` 자동 적용을 전제로 하지
말고 `nvm list available`에서 정확한 24.x 버전을 확인한 뒤 설치·선택한다. 예를
들어 24.14.0을 사용할 수 있다면 `nvm install 24.14.0`, `nvm use 24.14.0`을
실행한다. 관리자 권한이 필요한 PC에서는 교육장 정책에 따라 설치를 요청한다.

```powershell
node --version
npm.cmd --version

if ((node --version) -notmatch '^v24\.') {
    throw 'Node.js 24.x가 필요합니다. .nvmrc와 package.json을 확인하세요.'
}

npm.cmd ci
npx.cmd playwright install chromium
```

PowerShell에서 `npm.ps1 cannot be loaded`가 발생하면 실행 정책이나 보안 설정을
낮추지 말고 `npm.cmd`, `npx.cmd`를 사용한다. 교육장 네트워크가 package나
Chromium 다운로드를 차단하면 성공으로 간주하지 말고 허용된 네트워크와 정책을
확인한다. `strict-ssl=false` 같은 보안 우회는 사용하지 않는다.

## 4. 이미 clone된 저장소에서 안전하게 재개할 때

먼저 원격 상태와 로컬 변경을 확인한다.

```powershell
Set-Location C:\dev\today-ssafy-meal

git fetch --prune origin
git remote get-url origin
git status --short --branch

$DirtyFiles = git status --porcelain
if ($DirtyFiles) {
    $DirtyFiles
    throw '로컬 변경이 있습니다. switch, pull, reset, clean, stash를 진행하지 말고 먼저 변경 내용을 확인하세요.'
}

git switch main
git pull --ff-only origin main
git log -1 --oneline --decorate
git branch --no-merged origin/main
git branch -r --no-merged origin/main

node --version
if ((node --version) -notmatch '^v24\.') {
    throw 'Node.js 24.x가 필요합니다. .nvmrc와 package.json을 확인하세요.'
}

npm.cmd ci
npx.cmd playwright install chromium
```

`npm.cmd ci`는 `package-lock.json`과 설치된 의존성을 다시 일치시킨다. Chromium
설치는 이미 되어 있으면 빠르게 종료된다.

dirty worktree라면 아래 읽기 전용 명령까지만 실행하고 변경 내용을 먼저 보고한다.

```powershell
git status --short --branch
git diff
git diff --cached
```

`git reset`, `git checkout --`, `git clean`, 자동 `git stash`로 기존 작업을 숨기거나
삭제하지 않는다. 인수인계 문서보다 최신 `origin/main`과 실제 열린 PR 상태가
우선이다.

## 5. 로컬 실행과 전체 검증

개발 서버:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

변경 후에는 아래 다섯 검증을 모두 실행한다.

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:e2e
```

`npm run test:e2e`는 production build를 다시 만들고 `127.0.0.1:4173`부터
`127.0.0.1:4176`까지 사용한다. 포트 충돌이 의심되면 다음으로 확인하고, 본인이
실행한 Vite라면 해당 터미널에서 `Ctrl+C`로 종료한다.

```powershell
Get-NetTCPConnection -LocalPort 4173,4174,4175,4176 -ErrorAction SilentlyContinue
```

CI의 `playwright install --with-deps --only-shell chromium`은 Ubuntu 명령이다.
Windows 최초 설치에는 `npx.cmd playwright install chromium`을 사용한다.

현재 테스트 경계도 알고 있어야 한다.

- `production-preview`는 실제 production build가 현재 식단 status와 무관하게 핵심
  화면을 렌더링하고 테스트 fixture가 번들에 새지 않는지 smoke·responsive 검증한다.
- `verified-dev`, `unverified-dev`, `sample-dev`는 각각 고정 fixture로 상태별 UX를
  검증한다. 실제 운영 메뉴가 매주 바뀌어도 상태 계약 테스트는 흔들리지 않는다.
- `src/data/fixtures/`는 테스트 전용 입력이다. 주간 A4 식단 갱신에 맞춰 내용을
  덮어쓰지 않는다.
- `src/data/meals.test.ts`는 실제 운영 데이터의 확인된 날짜·대표 메뉴를 검증할 수
  있으므로, 다음 주 데이터로 바꿀 때 새 원본 근거에 맞춰 expectation도 갱신한다.

## 6. 월요일 A4 식단표를 반영하는 절차

새 기능보다 이 운영 루프가 먼저다. 가능하면 A4 전체와 날짜 머리글이 한 프레임에
보이는 정면 사진 1장, 상단·하단 메뉴가 선명한 확대 사진을 함께 촬영한다.

1. 운영 Source of Truth는 `src/data/meals.ts`다. `src/data/fixtures/`는 건드리지 않는다.
2. 실제 주 월요일을 `weekStart`에 `YYYY-MM-DD`로 입력한다.
3. 월~금 `date`, `dayOfWeek`, `mealOptions.label`, `menuItems`를 사진 순서대로
   갱신한다. 복수 배식 라인은 합치지 말고 별도 `mealOptions`로 기록하며, 룰렛을
   보이게 하려고 가짜 option이나 빈 option을 만들지 않는다.
4. 사진에서 확실히 읽히는 메뉴만 `menuItems`에 넣는다. 추측하지 않는다.
5. option의 대표 음식이 확실하면 `representativeMenuItem`에 해당 option의
   `menuItems`와 정확히 같은 문자열을 기록한다. 확정할 수 없으면 `null`로 둔다.
6. 날짜별 흐린 원문은 해당 날짜의 `uncertainTexts`에 내부 근거로 남긴다.
7. 날짜, 코너명, 표 구조처럼 주 전체에 적용되는 불확실성은 `sourceNotes`에 남긴다.
   두 필드는 사용자 화면에 노출되지 않는다.
8. A4 날짜 머리글 또는 신뢰할 수 있는 제공자의 설명으로 실제 주간 날짜를 확인하고
   그 근거를 `sourceNotes`에 남겼을 때만 `DATE_VERIFIED`로 바꾼다. 월~금 순서는
   확인했지만 날짜 숫자는 확인하지 못했으면 `DATE_UNVERIFIED`, 실제 식단이 아닌
   데이터는 `SAMPLE`을 사용한다. 월~금 순서 자체가 불명확하면 UI가 거짓 요일을
   표시할 수 있으므로 배포하지 말고 재촬영하거나 제공자에게 확인한다.
9. `updatedAt`을 `2026-08-17T10:30:00+09:00` 같은 ISO 8601 형식으로 갱신한다.
10. 전체 검증 후 작업 branch → Push → PR → CI → squash merge → production 배포
    순서로 완료한다.

월요일 현장에서 날짜가 보이지 않으면 그 주를 억지로 확정하지 말고 다시 촬영하거나
제공자에게 실제 주간을 확인해 근거를 남긴다. 배포된 화면을 원본 증거로 사용하지
않는다.

## 7. Git, PR, 병합, 배포 절차

`main`에는 직접 commit하지 않는다. 현재 main protection은 PR과 GitHub Actions
`verify` 성공을 요구하고, main force push와 main 삭제를 차단한다.

아래 PowerShell은 월요일 주간 식단 갱신 예시다. UI·문서 등 다른 작업에서는
branch명과 commit type을 목적에 맞게 바꾸고, `git add --` 뒤에 이번 작업에서
실제로 수정한 파일만 모두 명시한다.

```powershell
git config --get user.name
git config --get user.email
gh auth status

$WeekStart = '20260817' # 실제 반영할 주의 월요일로 변경
$BranchName = "data/update-weekly-meals-$WeekStart"
git switch -c $BranchName

# 작업 및 전체 검증 후
git status --short
git diff --check
git add -- src/data/meals.ts src/data/meals.test.ts
git diff --cached
git commit -m 'data: update weekly meals'
git push -u origin HEAD

gh pr create --base main --head $BranchName --title 'data: 주간 식단 갱신' --body '식단 데이터와 전체 검증 결과를 확인해 주세요.'
$PrNumber = gh pr view $BranchName --json number --jq '.number'
$FeatureHead = git rev-parse HEAD
gh pr checks $PrNumber --watch
if ($LASTEXITCODE -ne 0) {
    throw 'PR checks가 실패했으므로 병합하지 않습니다.'
}

gh pr merge $PrNumber --squash --delete-branch
if ($LASTEXITCODE -ne 0) {
    throw 'PR 병합이 완료되지 않았습니다.'
}
```

병합 후 로컬과 원격을 정리한다.

```powershell
git fetch --prune origin
git switch main
git pull --ff-only origin main
git status --short --branch
```

`gh pr merge --delete-branch`가 local branch까지 삭제하지 않았다면, squash merge
특성상 `git branch -d`가 거부될 수 있다. PR이 실제 `MERGED`이고 병합된 PR의
`headRefOid`가 병합 직전에 저장한 `$FeatureHead`와 일치할 때만 local branch를
강제 삭제한다.

```powershell
$Pr = gh pr view $PrNumber --json state,headRefOid,mergedAt | ConvertFrom-Json
$RemainingLocalBranch = git branch --list $BranchName

if ($RemainingLocalBranch) {
    if ($Pr.state -eq 'MERGED' -and $Pr.headRefOid -eq $FeatureHead) {
        git branch -D $BranchName
    } else {
        throw '병합 상태 또는 feature branch HEAD가 일치하지 않아 삭제하지 않습니다.'
    }
}

git status --short --branch
git branch --no-merged main
git branch -r --no-merged origin/main
```

GitHub Actions 확인:

```powershell
gh auth status
gh pr list --state open
gh run list --branch main --limit 5
$RunId = gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId'
gh run watch $RunId --exit-status
```

운영 접근 확인:

```powershell
$ProductionUrl = 'https://ssafy-daejeon-meal.netlify.app/'
$Response = Invoke-WebRequest -Uri $ProductionUrl -Method Head -UseBasicParsing
$Response.StatusCode
```

HTTP 200은 사이트 접근만 증명한다. 배포 완료는 Netlify Deploy 상세에서 state가
`Published` 또는 `ready`이고, 배포 commit SHA가 `git rev-parse origin/main`과
같은지 대시보드 접근 권한이 있는 계정으로 별도 확인한다. Netlify 상세에 접근할
수 없다면 “HTTP 200 확인, 최종 SHA 미검증”으로 사실 그대로 인수인계한다.

## 8. 교육장 PC 보안과 장애 대응

- 이 프로젝트에는 `.env`가 필요 없다. `.env`, PAT, Netlify token,
  `.git-credentials`, SSH private key를 PC 사이에 복사하거나 commit하지 않는다.
- Push 인증은 Git Credential Manager 또는 `gh auth login --web`을 사용한다.
  PAT를 명령행이나 문서에 붙여 넣지 않는다.
- 공용 PC라면 작업 종료 후 브라우저, GitHub CLI, Git Credential Manager의 로그인
  상태를 확인하고 학교 정책에 맞게 로그아웃한다.
- `npm ci`가 실패해도 `package-lock.json`을 임의로 고치거나 `npm install`로
  덮어쓰지 않는다.
- line ending만 바뀐 대량 diff가 보이면 commit하지 말고 `git diff --stat`,
  `git diff --check`로 원인을 확인한다.
- Playwright 실패 산출물인 `playwright-report/`, `test-results/`는 Git에 올리지
  않는다.
- 도구 설치 뒤 PATH가 보이지 않으면 새 PowerShell을 열고 다시 확인한다.

## 9. 다음 작업 후보와 결정 경계

아래는 아직 구현되지 않은 `Proposed / User confirmation required` 항목이다.
완료 기능처럼 취급하지 않는다.

1. **월요일 freshness 운영 정착 — 최우선**
   실제 날짜가 보이는 A4를 촬영해 오전 중 `DATE_VERIFIED`로 배포하는 흐름을 먼저
   최소 2주 안정적으로 반복한다.
2. **오늘/이번 주 식단 자체 공유**
   룰렛 결과와 무관한 Web Share CTA를 검토한다. `DATE_VERIFIED + CURRENT`에서만
   “오늘”이라고 표현하고, 미확정·지난 식단을 현재 식단처럼 공유하지 않는다.
3. **현장 QR 유입**
   식당 A4 옆 고정 URL QR은 게시 허가를 먼저 받고 “SSAFY 공식 서비스가 아닌
   개인 제작”을 명시한다.
4. **최소 측정 또는 PWA**
   analytics는 개인정보·도구·측정 지표를 먼저 합의한다. PWA/service worker는
   오래된 식단을 최신처럼 보여줄 위험이 있어 freshness 운영이 안정되기 전에는
   추가하지 않는다.

로그인, DB, 댓글, 평점, 실시간 인기투표, Push 알림, 관리자 화면은 현재 제품
범위와 맞지 않으므로 추가하지 않는다.

## 10. 작업 종료 체크리스트

- [ ] 전체 검증 5개 성공
- [ ] 수정 파일만 명시적으로 stage하고 diff 재확인
- [ ] 작업 branch Push, PR 생성, `verify` 성공
- [ ] squash merge 후 feature branch local/remote 정리
- [ ] `main == origin/main`, clean worktree, 열린 PR·미병합 branch 없음
- [ ] Netlify production이 최종 `origin/main` SHA로 `ready`
- [ ] 운영 URL에서 핵심 화면과 가로 overflow를 실제 확인
- [ ] 다음 PC가 알아야 할 미완료 항목을 이 문서에 갱신

## 11. 교육장에서 Codex에 전달할 시작 문구

> 먼저 `AGENTS.md`, `README.md`, `docs/work-session-handoff.md`를 읽고
> `git fetch --prune origin`으로 실제 원격 상태를 확인해. dirty worktree면 어떤
> 변경도 버리거나 숨기지 말고 먼저 보고해. 이번 주 A4 식단표 사진이 있으면 실제
> 날짜와 확실히 판독 가능한 메뉴만 반영하고, 전체 검증 후 작업 branch, Push, PR,
> squash merge, production 배포 확인까지 완료해.
