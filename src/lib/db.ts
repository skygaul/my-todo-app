// PostgreSQL 연결 모듈. 서버 컴포넌트와 Server Actions에서만 import 합니다.
// 'server-only' 덕분에 클라이언트 컴포넌트에서 import 하면 빌드 오류가 나서,
// DB 접속 정보가 브라우저 번들에 섞여 들어갈 수 없습니다.
import "server-only";

import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL 환경변수가 없습니다. .env.example을 참고해 .env를 만드세요.",
  );
}

// 개발 모드(npm run dev)에서는 파일을 저장할 때마다 모듈이 다시 실행됩니다.
// 그때마다 새 Pool을 만들면 연결이 계속 늘어나므로 globalThis에 하나만 보관해 재사용합니다.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    max: 5, // 교육용 로컬 앱이라 동시 연결 수는 작게 둡니다.
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}
