export type JobStatus = "applied" | "interviewing" | "offered" | "rejected";

export interface Job {
  _id: string;
  company: string;
  role: string;
  status: JobStatus;
  appliedDate: string;
  jobUrl?: string;
  salary?: number;
  notes?: string;
  cv?: string;
  tags?: string[];
  timeline?: { status: JobStatus; date: string }[];
  followUpDate?: string;
  reminderSent?: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobFormData {
  company: string;
  role: string;
  status: JobStatus;
  appliedDate: string;
  jobUrl?: string;
  salary?: number;
  notes?: string;
  tags?: string[];
  followUpDate?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  message: string;
  token: string;
}

export interface PaginatedJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StatsResponse {
  total: number;
  statusCounts: { _id: JobStatus; count: number }[];
  monthlyApplications: {
    _id: { year: number; month: number };
    count: number;
  }[];
  weeklyApplications: {
    _id: { year: number; week: number };
    count: number;
  }[];
  yearlyApplications: {
    _id: { year: number };
    count: number;
  }[];
  responseRate: number;
  offerRate: number;
  rejectionRate: number;
  averageResponseTime: number;
}
