import { useState } from "react";
import type { Job, JobFormData, JobStatus } from "../types";
import StatusBadge from "./StatusBadge";
import { sendReminder } from "../api";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormData) => Promise<void>;
  job?: Job | null;
}

// Local form state uses string for tags (comma-separated)
interface FormState {
  company: string;
  role: string;
  status: JobStatus;
  appliedDate: string;
  jobUrl: string;
  salary: number | undefined;
  notes: string;
  tags: string;
  followUpDate?: string;
}

const defaultForm: FormState = {
  company: "",
  role: "",
  status: "applied",
  appliedDate: new Date().toISOString().split("T")[0],
  jobUrl: "",
  salary: undefined,
  notes: "",
  tags: "",
  followUpDate: undefined,
};

const JobModal = ({ isOpen, onClose, onSubmit, job }: JobModalProps) => {
  const [form, setForm] = useState<FormState>(() =>
    job
      ? {
          company: job.company,
          role: job.role,
          status: job.status,
          appliedDate:
            job.appliedDate?.split("T")[0] || defaultForm.appliedDate,
          jobUrl: job.jobUrl || "",
          salary: job.salary,
          notes: job.notes || "",
          tags: job.tags?.join(", ") || "",
          followUpDate: job.followUpDate
            ? new Date(job.followUpDate).toISOString().split("T")[0]
            : undefined,
        }
      : defaultForm,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "salary"
          ? value
            ? Number(value)
            : undefined
          : name === "company" || name === "role"
            ? capitalizeWords(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.company || !form.role) {
      setError("Company and role are required.");
      return;
    }
    setLoading(true);
    try {
      // Convert comma-separated tags string to array
      const tags = form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : [];
      await onSubmit({ ...form, tags, followUpDate: form.followUpDate });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-blue-300 dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-2 p-4 sm:mx-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {job ? "Edit Job" : "Add New Job"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g. Google"
                className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g. Frontend Engineer"
                className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(
                  [
                    "applied",
                    "interviewing",
                    "offered",
                    "rejected",
                  ] as JobStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Applied Date
              </label>
              <input
                type="date"
                name="appliedDate"
                value={form.appliedDate}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salary (optional)
              </label>
              <input
                type="number"
                name="salary"
                value={form.salary ?? ""}
                onChange={handleChange}
                placeholder="e.g. 90000"
                className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job URL (optional)
              </label>
              <input
                name="jobUrl"
                value={form.jobUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any notes about this application..."
              className="w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              name="tags"
              value={form.tags || ""}
              onChange={handleChange}
              placeholder="remote, frontend, senior"
              className="w-full bg-stone-100 border border-stone-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Follow-up date (optional)
            </label>
            <input
              type="date"
              name="followUpDate"
              value={form.followUpDate || ""}
              onChange={handleChange}
              className="w-full bg-stone-100 border border-stone-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {job?.timeline && job.timeline.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Timeline
              </h3>
              <ul className="space-y-2">
                {[...job.timeline]
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((t) => (
                    <li
                      key={`${t.date}-${t.status}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <StatusBadge status={t.status as JobStatus} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(t.date).toLocaleString()}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {job && job.followUpDate && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    await sendReminder(job._id);
                    alert("Reminder sent");
                  } catch (err: unknown) {
                    alert(
                      (err as { response?: { data?: { error?: string } } })
                        ?.response?.data?.error || "Failed to send reminder",
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                className="text-sm px-3 py-2 rounded-lg border border-stone-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700"
              >
                🔔 Send Reminder Now
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-red-400 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-red-800 dark:hover:bg-red-900/50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-400 transition disabled:opacity-60"
            >
              {loading ? "Saving..." : job ? "Update Job" : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
