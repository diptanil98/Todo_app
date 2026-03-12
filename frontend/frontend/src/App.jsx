import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddTodo from "./pages/AddTodo";
import EditTodo from "./pages/EditTodo";
import ProtectedRoute from "./components/ProtectedRoute";
import { getToken } from "./lib/api";

export default function App() {
  const token = getToken();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/todos/new"
          element={
            <ProtectedRoute>
              <AddTodo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/todos/:id/edit"
          element={
            <ProtectedRoute>
              <EditTodo />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
