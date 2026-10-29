"use client";

// 입력 폼. 저장 중 버튼 비활성화와 오류 메시지 표시를 위해 클라이언트 컴포넌트로 만듭니다.
// DB 접근은 하지 않고, Server Action(addTodo)을 호출하기만 합니다.
import { useActionState } from "react";

import { addTodo, type AddTodoState } from "@/app/actions";

const initialState: AddTodoState = { error: null };

export default function TodoForm() {
  const [state, formAction, pending] = useActionState(addTodo, initialState);

  return (
    // React 19는 action이 끝나면 입력창을 자동으로 비워 줍니다.
    <form action={formAction} className="mb-6">
      <div className="flex gap-2">
        <input
          name="title"
          required
          maxLength={200}
          placeholder="할 일을 입력하세요"
          aria-label="할 일"
          autoComplete="off"
          className="flex-1 rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "추가 중..." : "추가"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
