import { deleteTodo, toggleTodo } from "@/app/actions";
import type { Todo } from "@/lib/types";

// 할 일 한 줄. 서버 컴포넌트 그대로 두고, 각 버튼을 <form action={Server Action}>으로 감쌉니다.
// bind(null, todo.id)로 id를 미리 넣어 두면 버튼을 누를 때 해당 할 일의 id가 서버로 전달됩니다.
export default function TodoItem({ todo }: { todo: Todo }) {
  const toggle = toggleTodo.bind(null, todo.id);
  const remove = deleteTodo.bind(null, todo.id);

  return (
    <li className="flex items-center gap-3 py-3">
      <form action={toggle}>
        <button
          type="submit"
          role="checkbox"
          aria-checked={todo.is_completed}
          aria-label={`${todo.title} ${todo.is_completed ? "미완료로 변경" : "완료로 변경"}`}
          className={
            todo.is_completed
              ? "flex size-5 items-center justify-center rounded border border-blue-600 bg-blue-600 text-xs text-white"
              : "flex size-5 items-center justify-center rounded border border-gray-400 hover:border-blue-600"
          }
        >
          {todo.is_completed && "✓"}
        </button>
      </form>
      <span
        className={
          todo.is_completed ? "flex-1 text-gray-400 line-through" : "flex-1"
        }
      >
        {todo.title}
      </span>
      <form action={remove}>
        <button
          type="submit"
          aria-label={`${todo.title} 삭제`}
          className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
        >
          삭제
        </button>
      </form>
    </li>
  );
}
