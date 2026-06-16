import { useEffect, useState, useCallback } from "react";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  uploadCV,
  deleteCV,
  sendReminder,
} from "../api";
import type { Job, JobFormData, JobStatus } from "../types";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import JobModal from "../components/JobModal";
import JobBoard from "../components/JobBoard";
import { JobRowSkeleton } from "../components/JobRowSkeleton";
import { JobCardSkeleton } from "../components/JobCardSkeleton";
import ErrorBanner from "../components/ErrorBanner";

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState<string | null>(null);
  const [view, setView] = useState<"table" | "board">("table");
  const [modalKey, setModalKey] = useState(0);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJobs({
        search: search || undefined,
        status: statusFilter || undefined,
        tag: tagFilter || undefined,
        sort,
        page,
        limit,
      });
      setJobs(data.jobs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        (err instanceof Error ? err.message : "Failed to load jobs");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, tagFilter, sort, page, limit]);

  useEffect(() => {
    const delay = setTimeout(fetchJobs, 300);
    return () => clearTimeout(delay);
  }, [fetchJobs]);

  const handleCreate = async (data: JobFormData) => {
    await createJob(data);
    fetchJobs();
  };

  const handleUpdate = async (data: JobFormData) => {
    if (!editingJob) return;
    await updateJob(editingJob._id, data);
    fetchJobs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    setDeletingId(id);
    try {
      await deleteJob(id);
      fetchJobs();
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendReminder = async (id: string) => {
    if (!confirm("Send a follow-up reminder for this job?")) return;
    setSendingId(id);
    try {
      await sendReminder(id);
      // show a quick feedback
      try {
        await fetchJobs();
        alert("Reminder sent");
      } catch {
        alert("Reminder sent (could not refresh list)");
      }
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to send reminder",
      );
    } finally {
      setSendingId(null);
    }
  };

  const handleCVUpload = async (job: Job, file: File) => {
    setCvUploading(job._id);
    try {
      await uploadCV(job._id, file);
      fetchJobs();
    } finally {
      setCvUploading(null);
    }
  };

  const handleCVDelete = async (job: Job) => {
    if (!confirm("Remove CV from this job?")) return;
    setCvUploading(job._id);
    try {
      await deleteCV(job._id);
      fetchJobs();
    } finally {
      setCvUploading(null);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    // Optimistically update UI without full refresh
    const originalJob = jobs.find((j) => j._id === jobId);
    if (!originalJob) return;

    // Update local state immediately
    setJobs((prev) =>
      prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j)),
    );

    try {
      await updateJob(jobId, { status: newStatus });
    } catch (err) {
      // Revert UI change on failure
      setJobs((prev) =>
        prev.map((j) =>
          j._id === jobId ? { ...j, status: originalJob.status } : j,
        ),
      );
      alert("Failed to update job status");
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 bg-blue-50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Jobs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {total} application{total !== 1 ? "s" : ""}
              {statusFilter && (
                <span className="ml-1"> | Status: {statusFilter}</span>
              )}
              {tagFilter && <span className="ml-1"> | Tag: {tagFilter}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-blue-100 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                onClick={() => setView("table")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  view === "table"
                    ? "bg-blue-400 shadow text-gray-900 dark:bg-gray-600 dark:text-gray-100"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                ☰ Table
              </button>
              <button
                onClick={() => setView("board")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  view === "board"
                    ? "bg-blue-400 shadow text-gray-900 dark:bg-gray-600 dark:text-gray-100"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                ▦ Board
              </button>
            </div>
            <button
              onClick={() => {
                setEditingJob(null);
                setModalKey((k) => k + 1);
                setModalOpen(true);
              }}
              className="bg-blue-600 dark:bg-blue-500 text-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition"
            >
              Add Job
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by company or role..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-stone-100 border border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-blue-200 border border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-blue-200 border border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <input
            type="text"
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
            className="bg-blue-200 border border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 bg-blue-50 dark:bg-gray-900">
            {view === "table" ? (
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <JobRowSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            )}
          </div>
        ) : error ? (
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
            <ErrorBanner message={error} onRetry={() => void fetchJobs()} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
            <div className="text-center">
              <p className="text-lg mb-2 text-gray-500 dark:text-gray-400">
                No jobs found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add your first application to get started
              </p>
              <button
                onClick={() => {
                  setEditingJob(null);
                  setModalKey((k) => k + 1);
                  setModalOpen(true);
                }}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                + Add Job
              </button>
            </div>
          </div>
        ) : view === "board" ? (
          <JobBoard
            jobs={jobs}
            onStatusChange={handleStatusChange}
            onEdit={(job) => {
              setEditingJob(job);
              setModalKey((k) => k + 1);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-blue-300 dark:bg-gray-800 rounded-xl border border-stone-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {job.jobUrl ? (
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-600 hover:underline"
                        >
                          {job.company}
                        </a>
                      ) : (
                        job.company
                      )}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 shrink-0">
                      {job.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <StatusBadge status={job.status} />
                    <span>
                      {new Date(job.appliedDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>
                      {job.salary ? `$${job.salary.toLocaleString()}` : "—"}
                    </span>
                  </div>
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {cvUploading === job._id ? (
                      <span className="text-gray-400 text-xs">...</span>
                    ) : job.cv ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5000${job.cv}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View CV
                        </a>
                        <button
                          onClick={() => handleCVDelete(job)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                        Upload CV
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCVUpload(job, file);
                          }}
                        />
                      </label>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleSendReminder(job._id)}
                        disabled={sendingId === job._id || job.reminderSent}
                        className={`text-xs px-2.5 py-1 rounded-md transition border border-green-700 dark:border-gray-600 ${job.reminderSent ? "text-gray-500 dark:text-gray-500 line-through" : "text-gray-700 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 hover:border-green-500 hover:dark:border-green-500"}`}
                      >
                        {sendingId === job._id
                          ? "Sending..."
                          : job.reminderSent
                            ? "🔔 Sent"
                            : "🔔 Remind"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingJob(job);
                          setModalKey((k) => k + 1);
                          setModalOpen(true);
                        }}
                        className="text-xs text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-blue-600 dark:border-gray-600 px-2.5 py-1 rounded-md hover:border-blue-400 dark:hover:border-blue-400 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        disabled={deletingId === job._id}
                        className="text-xs text-red-700 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-red-500 dark:border-gray-600 px-2.5 py-1 rounded-md hover:border-red-300 dark:hover:border-red-500 transition disabled:opacity-50"
                      >
                        {deletingId === job._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-blue-200 dark:bg-gray-800 rounded-2xl border border-stone-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-400 dark:bg-gray-700 border-b border-stone-200 dark:border-gray-600">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-800 dark:text-gray-300">
                      Company
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-800 dark:text-gray-300">
                      Role
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-800 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-800 dark:text-gray-300">
                      Applied
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-800 dark:text-gray-300">
                      Salary
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-800 dark:text-gray-300">
                      Tags
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-800 dark:text-gray-300">
                      CV
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-800 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {jobs.map((job) => (
                    <tr
                      key={job._id}
                      className="hover:bg-blue-300 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">
                        {job.jobUrl ? (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                          >
                            {job.company}
                          </a>
                        ) : (
                          job.company
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {job.role}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(job.appliedDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {job.salary ? `$${job.salary.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {job.tags && job.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {job.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {cvUploading === job._id ? (
                          <span className="text-gray-400 text-xs">...</span>
                        ) : job.cv ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`http://localhost:5000${job.cv}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline text-xs"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleCVDelete(job)}
                              className="text-red-400 hover:text-red-600 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer text-xs text-blue-500 hover:text-blue-700">
                            Upload
                            <input
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleCVUpload(job, file);
                              }}
                            />
                          </label>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSendReminder(job._id)}
                            disabled={sendingId === job._id || job.reminderSent}
                            className={`text-xs px-2.5 py-1 rounded-md transition border border-green-600 dark:border-gray-600 ${job.reminderSent ? "text-gray-500 dark:text-gray-500 line-through" : "text-gray-700 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 hover:border-green-500 hover:dark:border-green-500"}`}
                          >
                            {sendingId === job._id
                              ? "Sending..."
                              : job.reminderSent
                                ? "🔔 Sent"
                                : "🔔 Remind"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingJob(job);
                              setModalKey((k) => k + 1);
                              setModalOpen(true);
                            }}
                            className="text-xs text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-blue-600 dark:border-gray-600 px-2.5 py-1 rounded-md hover:border-blue-400 dark:hover:border-blue-400 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(job._id)}
                            disabled={deletingId === job._id}
                            className="text-xs text-red-700 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-red-500 dark:border-gray-600 px-2.5 py-1 rounded-md hover:border-red-300 dark:hover:border-red-500 transition disabled:opacity-50"
                          >
                            {deletingId === job._id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
              of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .map((p, i, arr) => (
                  <span key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-1 text-gray-400 dark:text-gray-500">
                        …
                      </span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`px-2.5 py-1.5 text-xs rounded-lg border transition ${
                        p === page
                          ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                          : "border-stone-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      <JobModal
        key={`${editingJob?._id ?? "new"}-${modalKey}`}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={editingJob ? handleUpdate : handleCreate}
        job={editingJob}
      />
    </>
  );
};

export default Jobs;
