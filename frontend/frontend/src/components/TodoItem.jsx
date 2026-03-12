export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 flex gap-3 items-start">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={Boolean(todo.isCompleted)}
        onChange={() => onToggle(todo)}
        aria-label="Toggle completed"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={`font-semibold truncate ${
              todo.isCompleted ? "line-through text-gray-400" : "text-gray-900 dark:text-gray-100"
            }`}
            title={todo.title}
          >
            {todo.title}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              todo.isCompleted
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
            }`}
          >
            {todo.isCompleted ? "Completed" : "Active"}
          </span>
        </div>
        {todo.description ? (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
            {todo.description}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Created: {new Date(todo.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          className="text-sm px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
          onClick={() => onEdit(todo)}
        >
          Edit
        </button>
        <button
          className="text-sm px-3 py-1 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={() => onDelete(todo)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

