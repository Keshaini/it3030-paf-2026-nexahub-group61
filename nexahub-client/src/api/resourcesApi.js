import axiosInstance from "./axiosInstance";

const BASE = "/api/resources";

export const resourcesApi = {

  // GET /api/resources with optional filters
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type)        params.append("type",        filters.type);
    if (filters.status)      params.append("status",      filters.status);
    if (filters.location)    params.append("location",    filters.location);
    if (filters.minCapacity) params.append("minCapacity", filters.minCapacity);
    return axiosInstance.get(`${BASE}?${params}`).then(r => r.data);
  },

  // GET /api/resources/:id
  getById: (id) =>
    axiosInstance.get(`${BASE}/${id}`).then(r => r.data),

  // POST /api/resources  (Admin)
  create: (data) =>
    axiosInstance.post(BASE, data).then(r => r.data),

  // PATCH /api/resources/:id  (Admin)
  update: (id, data) =>
    axiosInstance.patch(`${BASE}/${id}`, data).then(r => r.data),

  // DELETE /api/resources/:id  (Admin)
  delete: (id) =>
    axiosInstance.delete(`${BASE}/${id}`),
};