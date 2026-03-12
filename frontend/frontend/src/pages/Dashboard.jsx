import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TodoItem from "../components/TodoItem";
import { api, getApiErrorMessage, getStoredUser, logout } from "../lib/api";
import { getTheme, setTheme } from "../lib/theme";

export default function Dashboard() {
  const nav = useNavigate();
  const user = useMemo(() => getStoredUser(), []);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [theme, setThemeState] = useState(getTheme());

  async function loadTodos(opts = {}) {
    const nextPage = opts.page ?? page;
    const nextLimit = opts.limit ?? limit;
    const nextSearch = opts.search ?? search;
    const nextStatus = opts.status ?? status;

    setError("");
    setLoading(true);
    try {
      const res = await api.get("/todos", {
        params: { page: nextPage, limit: nextLimit, search: nextSearch, status: nextStatus },
      });
      setItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || nextPage);
      setLimit(res.data.limit || nextLimit);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTodos({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onToggle(todo) {
    const next = !Boolean(todo.isCompleted);
    setItems((prev) => prev.map((t) => (t._id === todo._id ? { ...t, isCompleted: next } : t)));
    try {
      await api.put(`/todos/${todo._id}`, { isCompleted: next });
    } catch (err) {
      setError(getApiErrorMessage(err));
      loadTodos();
    }
  }

  function onEdit(todo) {
    nav(`/todos/${todo._id}/edit`);
  }

  async function onDelete(todo) {
    if (!confirm("Delete this todo?")) return;
    try {
      await api.delete(`/todos/${todo._id}`);
      loadTodos();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function onMarkAllCompleted() {
    try {
      await api.put("/todos/mark-all/completed");
      loadTodos();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  function onLogout() {
    logout();
    nav("/login", { replace: true });
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  function applyFilters(e) {
    e.preventDefault();
    loadTodos({ page: 1 });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {user?.name ? `Hi, ${user.name}.` : "Your todos."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleTheme}
              className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200"
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={onMarkAllCompleted}
              className="text-sm px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-200"
            >
              Mark all completed
            </button>
            <Link
              to="/todos/new"
              className="text-sm px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Add Todo
            </Link>
            <button
              onClick={onLogout}
              className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200"
            >
              Logout
            </button>
          </div>
        </div>

        <form onSubmit={applyFilters} className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            className="sm:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title/description..."
          />
          <select
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold px-4 py-2 hover:opacity-90"
          >
            Apply
          </button>
        </form>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="text-gray-700 dark:text-gray-200">Loading todos...</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-gray-700 dark:text-gray-200">
              No todos found.
            </div>
          ) : (
            items.map((t) => (
              <TodoItem
                key={t._id}
                todo={t}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => loadTodos({ page: Math.max(page - 1, 1) })}
              className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-50 text-gray-800 dark:text-gray-200"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => loadTodos({ page: Math.min(page + 1, totalPages) })}
              className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-50 text-gray-800 dark:text-gray-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

