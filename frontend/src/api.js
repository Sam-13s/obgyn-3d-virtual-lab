import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  headers: { Accept: "application/json" }
});

export async function refreshCsrf() {
  const { data } = await api.get("/auth/csrf/");
  api.defaults.headers.common["X-CSRFToken"] = data.csrfToken;
  return data.csrfToken;
}

export default api;
