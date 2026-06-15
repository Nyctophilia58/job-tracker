import type { JobStatus } from "../types";

const statusStyles: Record<JobStatus, string> = {
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  interviewing:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  offered:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const StatusBadge = ({ status }: { status: JobStatus }) => (
  <span
    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[status]}`}
  >
    {status}
  </span>
);

export default StatusBadge;
