import api from "./axios";
import type {
  Job,
  JobFormData,
  AuthResponse,
  PaginatedJobsResponse,
  StatsResponse,
} from "../types";

// Auth
export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const updateProfile = async (data: {
  username: string;
  email: string;
}) => {
  const response = await api.put("/auth/profile", data);
  return response.data;
};

// Jobs
export const getJob = async (id: string): Promise<Job> => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const getJobs = async (params?: {
  status?: string;
  search?: string;
  tag?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedJobsResponse> => {
  const response = await api.get("/jobs", { params });
  return response.data;
};

export const createJob = async (data: JobFormData): Promise<Job> => {
  const response = await api.post("/jobs", data);
  return response.data;
};

export const updateJob = async (
  id: string,
  data: Partial<JobFormData>,
): Promise<Job> => {
  const response = await api.patch(`/jobs/${id}`, data);
  return response.data;
};

export const deleteJob = async (id: string): Promise<void> => {
  await api.delete(`/jobs/${id}`);
};

export const getStats = async (): Promise<StatsResponse> => {
  const response = await api.get("/jobs/stats");
  return response.data;
};

// CV
export const uploadCV = async (
  jobId: string,
  file: File,
): Promise<{ cvUrl: string }> => {
  const formData = new FormData();
  formData.append("cv", file);
  const response = await api.post(`/jobs/${jobId}/cv`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteCV = async (jobId: string): Promise<void> => {
  await api.delete(`/jobs/${jobId}/cv`);
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await api.put("/auth/change-password", data);
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return res.data;
};

export const sendReminder = async (jobId: string) => {
  const res = await api.post(`/jobs/${jobId}/remind`);
  return res.data;
};
