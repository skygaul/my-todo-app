# AIFFEL Campus Agent Code Review Templete
- 개발자 : 최홍식
- 리뷰어 : 김지은

> 리뷰 대상: https://github.com/skygaul/my-todo-app (커밋 `a5bf6b1`, 단일 커밋)
> 리뷰 방식: **정적 코드 리뷰**(소스 · 설정 · 문서 전수 확인) + `npm audit` / 레지스트리 조회.
> 리뷰 환경에서 `npm ci`(외부 패키지 설치 스크립트 실행)가 허용되지 않아 **앱을 직접 실행하지 못했습니다.** 따라서 1번 항목의 실행 화면 캡처는 첨부하지 못했고, 아래 "리뷰어가 직접 확인할 체크리스트"로 대체합니다.


# ART(Agent Review Template)
[ ]  **1. 원하는 기능이 의도한 대로 동작하나요?** — ⚠️ 코드상 구현은 확인, **실행 검증은 미완료**
- 요청(프롬프트)한 기능이 정상적으로 구현되었는지?
- 실제 실행 화면/결과물을 캡처하여 근거로 첨부

**PRD 요구사항 대비 코드 대조 (정적 확인)**

| 요구사항 | 구현 위치 | 판정 |
|---|---|---|
| FR-1 추가: trim 후 빈 값 · 200자 초과 거부, 3중 검증 | `TodoForm.tsx`(`required`, `maxLength=200`) → `actions.ts` `addTodo`(trim, `[...title].length`) → `db/init.sql`(`CHECK btrim(title) <> ''`, `VARCHAR(200)`) | 구현 확인 |
| FR-2 조회: 서버 컴포넌트, `created_at DESC`, 빈 상태 문구 | `page.tsx` `TodoList` | 구현 확인 |
| FR-3 완료 토글: `NOT is_completed`, 취소선 | `actions.ts` `toggleTodo`, `TodoItem.tsx` | 구현 확인 |
| FR-4 삭제 | `actions.ts` `deleteTodo` | 구현 확인 |
| NFR-1 영속성: named volume | `docker-compose.yml` `pgdata` | 구현 확인 |
| 아키텍처 규칙: `app/api/` 없음, `page.tsx`에 `'use client'` 없음, `actions.ts`에 `'use server'` | 파일 트리 확인 | 준수 |
| `<Suspense>`로 DB 조회 감싸기 (Cache Components) | `page.tsx`, `next.config.ts`(`cacheComponents: true`) | 준수 |

**장점**
- 화면 요구사항(진행 중 버튼 비활성화 `pending`, 오류 메시지 `role="alert"`, 완료 항목 `aria-checked`)까지 챙긴 점이 좋습니다.
- 토글을 "화면 값 기준"이 아니라 DB의 현재 값 기준(`NOT is_completed`)으로 뒤집어 오래된 화면에서도 일관됩니다.
- PRD → DB 설계 → README로 이어지는 문서가 코드와 잘 맞습니다. (문서에서 말한 구조 · 규칙이 실제 코드와 일치함을 확인)

**미검증 / 주의할 점**
- PRD 11절 인수 기준이 전부 `[x]`로 체크돼 있지만, **저장소 안에 실행 화면 · 테스트 · 로그 같은 근거가 없습니다.** 자체 선언일 뿐 제3자가 확인할 수 없는 상태입니다.
- 자동화 테스트가 하나도 없습니다 (`*.test.*`, `*.spec.*`, test 스크립트 없음).
- `next.config.ts`가 Tailwind v4에서 일반적인 `@tailwindcss/postcss` 대신 `@tailwindcss/turbopack` + 커스텀 `turbopack.rules`를 사용합니다. 패키지(4.3.3)는 레지스트리에 존재하고 lockfile에도 있지만, 실제 빌드에서 스타일이 적용되는지는 실행해서 확인해야 합니다.

**리뷰어가 직접 확인할 체크리스트 (캡처 첨부용)**
```bash
cp .env.example .env        # POSTGRES_PASSWORD, DATABASE_URL 비밀번호 채우기
docker compose up -d --wait
npm ci && npm run dev       # http://localhost:3000
npm run lint && npm run build
```
- [ ] 정상 추가 → 목록 맨 위에 표시 (캡처)
- [ ] 공백만 입력 / 201자 입력 → 거부 메시지 (캡처)
- [ ] 체크 토글 · 새로고침 후에도 유지 (캡처)
- [ ] 삭제 후 새로고침해도 복구되지 않음 (캡처)
- [ ] `docker compose down` → `up` 후 데이터 유지
- [ ] `docker compose stop db` 상태에서 페이지 접속 → 오류 화면이 어떻게 보이는지 (아래 개선안 #2 확인용)


[x]  **2. 보안 검토를 수행했나요?** — ✅ 기본 사항은 양호 (일부 개선 여지)
- API 키, 비밀번호 등 민감 정보가 코드에 하드코딩되지 않았는지
- 사용자 입력값 검증 등 기본 보안 사항 확인
- 외부 데이터/의존성 사용 시 출처와 위험 검토했는지

**민감 정보**
- 소스 전체와 git 히스토리를 `password / secret / api key / token`으로 검색했으나 하드코딩된 값 없음. `.env.example`의 `POSTGRES_PASSWORD=`는 빈 값.
- `.env`, `.env*.local`이 `.gitignore`에 등록돼 있고, 추적 중인 env 파일은 `.env.example`뿐.
- `DATABASE_URL` 누락 시 명확한 오류로 즉시 중단 (`lib/db.ts`).
- `docker-compose.yml`은 필수 변수가 없으면 `:?`로 실패시키고, DB 포트를 `127.0.0.1:5432`에만 바인딩해 같은 네트워크의 다른 기기에서 접근할 수 없음. 👍

**입력값 검증 / 인젝션**
- 모든 SQL이 `$1` 파라미터화 쿼리 (문자열 이어붙이기 없음).
- `toggleTodo` / `deleteTodo`는 Server Action이 공개 엔드포인트라는 점을 인지하고 UUID 정규식으로 `id`를 검증 (`actions.ts`).
- 제목은 서버에서 `typeof` 검사 → trim → 길이 검사. 브라우저 검증을 우회해도 서버 · DB에서 다시 막힘.
- 제목 출력은 React JSX 기본 이스케이프를 사용하고 `dangerouslySetInnerHTML` 없음 → XSS 위험 낮음.
- `import "server-only"`로 DB 모듈이 클라이언트 번들에 섞이지 않도록 보호.

**의존성**
- `npm audit --package-lock-only`: **취약점 0건**.
- 핵심 버전 `next@16.4.3`, `react@19.3.0`, `pg@8.23.1`, `@tailwindcss/turbopack@4.3.3`이 npm 레지스트리에 실제 존재함을 확인.
- `package-lock.json`의 `resolved` 453개가 모두 `registry.npmjs.org`이고 `integrity` 해시가 있어 출처가 일관됨.
- 설치 스크립트(`hasInstallScript`)가 있는 패키지는 `unrs-resolver` 1개(eslint-config-next의 dev 의존성, 네이티브 바이너리 선택용)뿐 — 위험 낮음.
- 런타임 의존성은 `next`, `react`, `react-dom`, `pg`, `server-only`로 최소화. 외부 API 호출 없음.
- 한 가지 외부 의존: `next/font/google`이 빌드 시 Google Fonts에서 폰트를 내려받음 (오프라인 · 사내망 빌드 시 실패 가능).

**보안 관점 개선 제안**
- 인증 · 속도 제한이 없어 Server Action을 누구나 반복 호출할 수 있음 → PRD 비목표라 **결함은 아니지만**, 로컬 외 환경에 배포하면 안 된다는 경고를 README에 명시하면 좋겠습니다.
- `.env`에 비밀번호를 두 번(`POSTGRES_PASSWORD`, `DATABASE_URL`) 적어야 함. 비밀번호에 `@ : / # %` 같은 문자가 들어가면 URL 인코딩이 필요한데 README에 언급이 없어 연결 실패의 원인이 될 수 있음.


[ ]  **3. 에러가 난 부분을 디버깅하여 "문제를 해결한 기록"을 남겼나요?** — ❌ 기록 부족
- 에이전트가 만든 코드의 오류를 어떻게 발견하고 수정했는지
- 새로운 시도 및 추가 실험이 기록되어 있는지

- 저장소에는 **커밋이 1개**뿐이라 시행착오를 git 히스토리로 추적할 수 없습니다.
- README의 "문제 해결" 표(`DATABASE_URL` 없음, `ECONNREFUSED`, 비밀번호 인증 실패, 포트 충돌)는 유용한 사전 안내지만, **실제로 겪은 오류 · 원인 · 수정 과정**이 아니라 일반적인 FAQ 형태입니다.
- 코드 주석에 흔적은 남아 있습니다. 이는 좋은 신호이나 별도 기록은 없습니다.
  - `actions.ts`: `[...title].length`로 이모지를 1글자로 세어 `VARCHAR(200)`과 기준을 맞춘 부분
  - `db.ts`: dev 모드에서 Pool이 계속 늘어나는 문제를 `globalThis`로 해결한 부분
  - `page.tsx`: Cache Components 때문에 DB 조회를 `<Suspense>`로 감싼 부분
- `AGENTS.md`의 Next.js 안내 블록은 `next dev`가 자동 생성하는 것으로, 개발자가 남긴 디버깅 기록이 아닙니다.
- 추가 실험(예: 영속성 · 재시작 시나리오 결과, 오류 재현 로그, 에이전트 출력물과 수정본의 차이)을 기록한 문서나 프롬프트 이력이 없습니다.

**요청 사항**: 위 세 가지 주석 사례만이라도 "무엇이 문제였고(증상/에러 메시지) → 어떻게 발견했고 → 어떻게 고쳤는지"를 한 줄씩 `docs/` 아래 트러블슈팅 문서로 남겨 주세요.


# 참고 링크 및 코드 개선

## 1.리뷰 시 참고한 링크가 있다면 링크와 간략한 설명을 첨부합니다.

- 대상 저장소: https://github.com/skygaul/my-todo-app
- 저장소 내 문서: `PRD.md`(요구사항 · 인수 기준), `docs/DB_DESIGN.md`(DB 설계), `README.md`(실행 · 보안 규칙 · 문제 해결)
- 저장소 내 `AGENTS.md`: Next.js 16의 변경점은 `node_modules/next/dist/docs/`를 참고하라는 안내 (자동 생성 블록)
- npm 레지스트리 (https://www.npmjs.com): `next`, `react`, `pg`, `@tailwindcss/turbopack` 버전 실존 여부 확인 및 `npm audit`
- node-postgres Pool 문서: https://node-postgres.com/apis/pool (idle client의 `error` 이벤트 처리 권장 사항)

## 2.리뷰를 통해 개선을 제안할 부분이 있다면 내용과 간략한 설명을 첨부합니다.

우선순위 순입니다.

1. **(중) 인수 기준의 근거 남기기** — PRD 11절이 모두 체크돼 있지만 근거가 없습니다. 실행 화면 캡처를 `docs/` 에 두거나, 최소한 Server Action 단위 테스트(빈 값 · 201자 · 잘못된 UUID)를 추가하면 "잘 만들어졌다"를 증명할 수 있습니다.
2. **(중) DB 장애 시 처리** — `page.tsx`의 `TodoList`는 `pool.query`를 try/catch 없이 호출하고, 저장소에 `error.tsx`도 없습니다. DB가 꺼져 있으면 Next.js 기본 오류 화면이 뜹니다(README 문제 해결 표는 이를 전제로 하지만 화면은 안내하지 않음). `app/error.tsx`를 추가해 "DB 연결을 확인하세요" 같은 안내와 재시도 버튼을 보여 주세요.
3. **(중) 토글 · 삭제 실패가 사용자에게 보이지 않음** — `toggleTodo` / `deleteTodo`는 오류를 `console.error`만 하고 조용히 `return`합니다. 반면 `addTodo`는 오류 메시지를 화면에 표시해 일관성이 없습니다. 실패 시 사용자에게 알리거나 최소한 이 의도를 주석으로 남겨 주세요.
4. **(낮음) Pool `error` 이벤트 핸들러 없음** — `pg` Pool은 유휴 연결이 끊기면 `error` 이벤트를 내는데 리스너가 없으면 Node 프로세스가 종료될 수 있습니다(DB 재시작 시나리오). `pool.on("error", ...)` 로 로깅하도록 추가하세요.
5. **(낮음) 글자 수 기준 불일치** — 서버는 `[...title].length`(코드포인트)로 세지만, 브라우저 `maxLength={200}`은 UTF-16 코드 유닛 기준이라 이모지는 2로 셉니다. 이모지가 많은 입력은 브라우저에서 먼저 막혀 서버 기준(200자)보다 짧게 제한됩니다. 동작상 안전한 쪽으로 어긋나지만 주석(“기준이 같아집니다”)과 완전히 일치하지는 않으므로 주석을 바로잡거나 `maxLength`를 제거하고 서버 검증에 맡기는 방안을 고려하세요.
6. **(낮음) 폰트 설정 불일치** — `layout.tsx`에서 Geist 폰트를 불러오지만 `globals.css`의 `body { font-family: Arial, Helvetica, sans-serif; }`가 이를 덮어써서 Geist가 실제로는 쓰이지 않을 가능성이 큽니다(실행 후 확인 필요). 불필요한 폰트 다운로드가 되므로 body 규칙을 `var(--font-sans)`로 바꾸거나 폰트 로딩을 제거하세요.
7. **(낮음) 더블 클릭 시 토글 두 번** — 토글이 "상대적 뒤집기"라 빠르게 두 번 누르면 원상 복귀합니다. 현재 `useFormStatus` 등으로 버튼을 잠그지 않았습니다. 교육용 범위에서는 허용 가능하지만 인지해 두세요.
8. **(낮음) 문서 보강** — README에 (a) 비밀번호의 URL 특수문자 인코딩 주의, (b) "인증이 없으므로 로컬 전용"이라는 경고, (c) Windows에서 실행할 때의 안내(PRD는 macOS 전제)를 추가하세요. `CI`(lint · build)도 없어 PR 단계의 자동 검증이 없습니다.


# 총평

**구조와 보안 기본기는 매우 탄탄한 프로젝트입니다.** 서버 컴포넌트 조회 + Server Actions 변경이라는 PRD의 아키텍처 규칙이 코드에서 그대로 지켜졌고, 파라미터화된 SQL, UUID 검증, 3중 입력 검증, `server-only`, 비밀번호의 환경변수 분리, DB 포트의 로컬 바인딩, 취약점 0건의 의존성 등 보안 항목은 교육용 앱 기준으로 모범적입니다. 코드는 짧고 읽기 쉬우며 주석이 "왜 이렇게 했는지"를 설명하고, 문서(PRD · DB 설계 · README)와 코드가 서로 일치합니다.

**반면 "잘 동작한다"는 증명이 부족합니다.** 이번 리뷰는 정적 리뷰라 실행 화면을 첨부하지 못했고(리뷰어 환경 제약), 개발자 쪽에도 실행 근거 · 테스트 · 시행착오 기록이 저장소에 없습니다. 특히 항목 3(디버깅 기록)은 단일 커밋과 일반적인 FAQ 형태의 README만 있어 충족한다고 보기 어렵습니다.

| 항목 | 평가 |
|---|---|
| 1. 기능 동작 | 🔶 코드상 요구사항 충족, 실행 증빙 없음 (리뷰어 실행 체크리스트로 보완 필요) |
| 2. 보안 | ✅ 양호 |
| 3. 디버깅 기록 | ❌ 보완 필요 |

**권장 결론**: 개선 제안 #1(증빙 · 테스트)과 항목 3의 트러블슈팅 기록, #2~#3(오류 처리)을 반영하면 **승인(Approve)** 수준입니다. 현재 상태는 **조건부 승인(Approve with comments)** 입니다.
