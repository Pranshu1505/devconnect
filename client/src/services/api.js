import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (token expired)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// ── Posts ─────────────────────────────────────────
export const postsAPI = {
  getAll: (params) => api.get("/posts", { params }),
  getOne: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post("/posts", data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.put(`/posts/${id}/like`),
  bookmark: (id) => api.put(`/posts/${id}/bookmark`),
  addComment: (id, body) => api.post(`/posts/${id}/comments`, { body }),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
  uploadCover: (file) => {
    const form = new FormData();
    form.append("cover", file);
    return api.post("/posts/upload-cover", form, { headers: { "Content-Type": "multipart/form-data" } });
  },
};

// ── Jobs ──────────────────────────────────────────
export const jobsAPI = {
  getAll: (params) => api.get("/jobs", { params }),
  getOne: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  apply: (id, coverLetter) => api.post(`/jobs/${id}/apply`, { coverLetter }),
  getApplications: (id) => api.get(`/jobs/${id}/applications`),
  updateStatus: (jobId, appId, status) => api.put(`/jobs/${jobId}/applications/${appId}`, { status }),
};

// ── Users ─────────────────────────────────────────
export const usersAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put("/users/profile", data),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.post("/users/avatar", form, { headers: { "Content-Type": "multipart/form-data" } });
  },
  follow: (id) => api.put(`/users/${id}/follow`),
  search: (q) => api.get("/users/search", { params: { q } }),
  getNotifications: () => api.get("/users/notifications"),
  markNotificationsRead: () => api.put("/users/notifications/read"),
  getBookmarks: () => api.get("/users/bookmarks"),
};

export default api;