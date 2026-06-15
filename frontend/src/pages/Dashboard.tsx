import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { getStats, getJobs, createJob } from "../api";
import type { StatsResponse, JobStatus, JobFormData, Job } from "../types";
import { Skeleton } from "../components/Skeleton";
import Navbar from "../components/Navbar";
import JobModal from "../components/JobModal";
import ErrorBanner from "../components/ErrorBanner";

const STATUS_COLORS: Record<JobStatus, string> = {
  applied: "#3b82f6",
  interviewing: "#f59e0b",
  offered: "#10b981",
  rejected: "#ef4444",
};

const StatCard = ({
  label,
  value,
  color,
  suffix = "",
}: {
  label: string;
  value: number | string;
  color: string;
  suffix?: string;
}) => (
  <div className="bg-blue-300 rounded-2xl border border-gray-200 p-5 dark:bg-gray-800 dark:border-gray-700">
    <p className="text-sm text-gray-700 mb-1 dark:text-gray-400">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>
      {value}
      {suffix}
    </p>
  </div>
);

type TimeGranularity = "week" | "month";

const GRANULARITY_OPTIONS: { value: TimeGranularity; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const Dashboard = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [granularity, setGranularity] = useState<TimeGranularity>("month");

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, j] = await Promise.all([getStats(), getJobs()]);
      setStats(s);
      setJobs(j.jobs);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        (err instanceof Error ? err.message : "Failed to load dashboard");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // run fetchStats asynchronously to avoid sync state updates inside effect
    void Promise.resolve().then(() => fetchStats());
  }, []);

  const handleCreate = async (data: JobFormData) => {
    await createJob(data);
    fetchStats();
  };

  const handleExportCSV = () => {
    if (jobs.length === 0) return;
    const headers = [
      "Company",
      "Role",
      "Status",
      "Applied Date",
      "Salary",
      "Job URL",
      "Notes",
    ];
    const rows = jobs.map((job) => [
      `"${job.company}"`,
      `"${job.role}"`,
      job.status,
      new Date(job.appliedDate).toLocaleDateString(),
      job.salary ?? "",
      job.jobUrl ?? "",
      `"${(job.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCount = (status: JobStatus) =>
    stats?.statusCounts.find((s) => s._id === status)?.count ?? 0;

  const pieData =
    stats?.statusCounts.map((s) => ({
      name: s._id,
      value: s.count,
      color: STATUS_COLORS[s._id as JobStatus],
    })) ?? [];

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weeklyLineData = (() => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() + mondayOffset);
    const dayMap = new Map<number, number>();
    for (const job of jobs) {
      const d = new Date(job.appliedDate);
      if (
        d >= startOfWeek &&
        d < new Date(startOfWeek.getTime() + 7 * 86400000)
      ) {
        const dayNum = d.getDate();
        dayMap.set(dayNum, (dayMap.get(dayNum) || 0) + 1);
      }
    }
    const result: { name: string; Applications: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      result.push({
        name: DAY_NAMES[d.getDay()],
        Applications: dayMap.get(d.getDate()) || 0,
      });
    }
    return result;
  })();

  const monthlyLineData = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOfMonth = new Date(year, month, 1);
    const startOfNextMonth = new Date(year, month + 1, 1);
    const dayMap = new Map<number, number>();
    for (const job of jobs) {
      const d = new Date(job.appliedDate);
      if (d >= startOfMonth && d < startOfNextMonth) {
        const dayNum = d.getDate();
        dayMap.set(dayNum, (dayMap.get(dayNum) || 0) + 1);
      }
    }
    const result: { name: string; Applications: number }[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      result.push({ name: String(i), Applications: dayMap.get(i) || 0 });
    }
    return result;
  })();

  const timelineData =
    granularity === "week" ? weeklyLineData : monthlyLineData;

  const funnelData =
    stats?.statusCounts.map((s) => ({
      name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
      count: s.count,
      color: STATUS_COLORS[s._id as JobStatus],
    })) ?? [];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 bg-blue-50 dark:bg-gray-900">
          {/* Skeleton for header */}
          <div className="mb-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Skeleton for stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>

          {/* Skeleton for charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[0, 1].map((i) => (
              <Skeleton
                key={i}
                className="h-72 rounded-2xl border border-stone-200 dark:border-gray-700"
              />
            ))}
          </div>

          {/* Skeleton for funnel chart */}
          <div className="mt-6">
            <Skeleton className="h-72 rounded-2xl border border-stone-200 dark:border-gray-700" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 bg-blue-50 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
              Your job application overview
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 dark:bg-green-700 border border-gray-300 text-white hover:bg-green-500 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-green-500"
            >
              Export CSV
            </button>
            <button
              onClick={() => {
                setModalKey((k) => k + 1);
                setModalOpen(true);
              }}
              className="bg-blue-600 text-white border border-stone-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              Add Job
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onRetry={() => void fetchStats()} />
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <StatCard
            label="Total"
            value={stats?.total ?? 0}
            color="text-gray-900 dark:text-gray-100"
          />
          <StatCard
            label="Applied"
            value={getCount("applied")}
            color="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Interviewing"
            value={getCount("interviewing")}
            color="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            label="Offered"
            value={getCount("offered")}
            color="text-green-600 dark:text-green-400"
          />
          <StatCard
            label="Rejected"
            value={getCount("rejected")}
            color="text-red-500 dark:text-red-400"
          />
          <StatCard
            label="Response Rate"
            value={stats?.responseRate ?? 0}
            color="text-yellow-600 dark:text-yellow-400"
            suffix="%"
          />
          <StatCard
            label="Offer Rate"
            value={stats?.offerRate ?? 0}
            color="text-green-600 dark:text-green-400"
            suffix="%"
          />
          <StatCard
            label="Avg Response Time"
            value={stats?.averageResponseTime ?? 0}
            color="text-purple-600 dark:text-purple-400"
            suffix=" days"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-300 rounded-2xl border border-gray-200 p-4 sm:p-6 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 dark:text-gray-300">
              Applications by Status
            </h2>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm dark:text-gray-500">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, String(name)]} />
                  <Legend
                    formatter={(value) =>
                      value.charAt(0).toUpperCase() + value.slice(1)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-blue-300 rounded-2xl border border-gray-200 p-4 sm:p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Applications Over Time
              </h2>
              <div className="flex rounded-lg border border-stone-200 overflow-hidden dark:border-gray-600">
                {GRANULARITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGranularity(opt.value)}
                    className={`px-2.5 py-1 text-xs font-medium transition ${
                      granularity === opt.value
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : "bg-blue-200 text-gray-600 hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {timelineData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm dark:text-gray-500">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: granularity === "month" ? 9 : 11 }}
                    interval={granularity === "month" ? 2 : 0}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="Applications"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Response Funnel */}
        <div className="mt-6">
          <div className="bg-blue-300 rounded-2xl border border-gray-200 p-4 sm:p-6 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 dark:text-gray-300">
              Response Funnel
            </h2>
            {funnelData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm dark:text-gray-500">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <JobModal
        key={modalKey}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
};

export default Dashboard;
