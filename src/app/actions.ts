"use server";

// Server Actions: 브라우저의 form 제출을 받아 서버에서 실행되는 함수들입니다.
// 별도 REST API 없이 이 파일의 함수가 곧 데이터 변경 창구입니다.
import { revalidatePath } from "next/cache";

import { pool } from "@/lib/db";

const TITLE_MAX_LENGTH = 200;

export type AddTodoState = { error: string | null };

export async function addTodo(
  _prevState: AddTodoState,
  formData: FormData,
): Promise<AddTodoState> {
  const raw = formData.get("title");
  const title = typeof raw === "string" ? raw.trim() : "";

  // 브라우저 검증(required, maxLength)은 우회할 수 있으므로 서버에서 다시 검사합니다.
  if (title === "") {
    return { error: "할 일을 입력하세요." };
  }
  // [...title]로 세면 이모지도 1글자로 세어 PostgreSQL VARCHAR(200)과 기준이 같아집니다.
  if ([...title].length > TITLE_MAX_LENGTH) {
    return { error: `할 일은 ${TITLE_MAX_LENGTH}자 이하로 입력하세요.` };
  }

  try {
    // $1 자리에 값을 따로 전달하는 파라미터화된 쿼리 (SQL Injection 방지)
    await pool.query("INSERT INTO todos (title) VALUES ($1)", [title]);
  } catch (error) {
    console.error("addTodo 실패:", error);
    return { error: "저장하지 못했습니다. 잠시 후 다시 시도하세요." };
  }

  // 목록 페이지를 다시 렌더링해 방금 추가한 항목이 바로 보이게 합니다.
  revalidatePath("/");
  return { error: null };
}

// Server Action은 누구나 호출할 수 있는 서버 함수이므로 id도 형식을 검사합니다.
// 형식이 틀린 값을 그대로 넘기면 PostgreSQL이 uuid 변환 오류를 냅니다.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export async function toggleTodo(id: string): Promise<void> {
  if (!isUuid(id)) return;

  try {
    // 화면의 값이 아니라 DB에 저장된 현재 값을 기준으로 뒤집습니다.
    await pool.query(
      "UPDATE todos SET is_completed = NOT is_completed WHERE id = $1",
      [id],
    );
  } catch (error) {
    console.error("toggleTodo 실패:", error);
    return;
  }

  revalidatePath("/");
}

export async function deleteTodo(id: string): Promise<void> {
  if (!isUuid(id)) return;

  try {
    await pool.query("DELETE FROM todos WHERE id = $1", [id]);
  } catch (error) {
    console.error("deleteTodo 실패:", error);
    return;
  }

  revalidatePath("/");
}
