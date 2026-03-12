import axios from "axios";

const API_BASE_URL = "https://todo-app-qrta.onrender.com/api";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  if (!token) localStorage.removeItem("token");
  else localStorage.setItem("token", token);
}

export function getStoredUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (!user) localStorage.removeItem("user");
  else localStorage.setItem("user", JSON.stringify(user));
}

export function logout() {
  setToken(null);
  setStoredUser(null);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      logout();
      if (typeof window !== "undefined" && window.location?.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export function getApiErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong"
  );
}

