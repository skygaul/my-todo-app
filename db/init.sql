-- My Todo: todos 테이블
-- PostgreSQL 13+ 표준 SQL (확장 설치 불필요) · Docker PostgreSQL / Supabase 공용
-- Docker: 볼륨이 비어 있을 때 한 번만 자동 실행됨
-- Supabase: SQL Editor에 그대로 붙여 넣어 실행

CREATE TABLE IF NOT EXISTS todos (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title        VARCHAR(200) NOT NULL,
    is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT todos_title_not_blank CHECK (btrim(title) <> '')
);

CREATE INDEX IF NOT EXISTS todos_created_at_idx
    ON todos (created_at DESC);
