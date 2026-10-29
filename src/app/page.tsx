import { Suspense } from "react";

import TodoForm from "@/components/TodoForm";
import TodoItem from "@/components/TodoItem";
import { pool } from "@/lib/db";
import type { Todo } from "@/lib/types";

// DB에서 목록을 읽는 서버 컴포넌트. 브라우저에는 결과 HTML만 전달됩니다.
async function TodoList() {
  const { rows: todos } = await pool.query<Todo>(
    "SELECT id, title, is_completed, created_at FROM todos ORDER BY created_at DESC",
  );

  if (todos.length === 0) {
    return <p className="py-8 text-center text-gray-500">할 일이 없습니다</p>;
  }

  const completedCount = todos.filter((todo) => todo.is_completed).length;

  return (
    <>
      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
      <p className="mt-4 text-sm text-gray-500">
        총 {todos.length}개 · 완료 {completedCount}개
      </p>
    </>
  );
}

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">My Todo</h1>
      <TodoForm />
      {/* Cache Components: 캐시하지 않는 DB 조회는 Suspense 안에서 요청마다 실행됩니다. */}
      <Suspense
        fallback={<p className="py-8 text-center text-gray-500">불러오는 중...</p>}
      >
        <TodoList />
      </Suspense>
    </main>
  );
}
