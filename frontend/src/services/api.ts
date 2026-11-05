import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ────────────────────────────────────────
export const authAPI = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  demo: () => api.post("/auth/demo"),
  claim: (data: { email: string; password: string; fullName: string }) => api.post("/auth/claim", data),
};

// ── Ideas ───────────────────────────────────────
export interface IdeaPayload {
  title: string;
  description: string;
  marketSizeEstimate: string;
  teamSummary: string;
  techStack: string;
  revenueModel: string;
  stage: string;
}

export const ideasAPI = {
  list: () => api.get("/ideas"),
  get: (id: string) => api.get(`/ideas/${id}`),
  create: (data: IdeaPayload) => api.post("/ideas", data),
  update: (id: string, data: Partial<IdeaPayload>) => api.put(`/ideas/${id}`, data),
  delete: (id: string) => api.delete(`/ideas/${id}`),
  analyze: (ideaId: string) => api.post(`/ideas/${ideaId}/analyze`),
  getAnalyses: (ideaId: string) => api.get(`/ideas/${ideaId}/analyses`),
};

// ── Analyses ────────────────────────────────────
export const analysesAPI = {
  get: (id: string) => api.get(`/analyses/${id}`),
};
