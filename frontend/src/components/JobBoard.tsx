import { useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import type { Job, JobStatus } from "../types";

interface JobBoardProps {
  jobs: Job[];
  onStatusChange: (jobId: string, newStatus: JobStatus) => Promise<void>;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

const columns: { status: JobStatus; label: string; borderColor: string }[] = [
  { status: "applied", label: "Applied", borderColor: "border-t-blue-500" },
  {
    status: "interviewing",
    label: "Interviewing",
    borderColor: "border-t-yellow-500",
  },
  { status: "offered", label: "Offered", borderColor: "border-t-green-500" },
  { status: "rejected", label: "Rejected", borderColor: "border-t-red-500" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSalary(salary: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(salary);
}

export default function JobBoard({
  jobs,
  onStatusChange,
  onEdit,
  onDelete,
}: JobBoardProps) {
  const grouped = useMemo(() => {
    const map: Record<JobStatus, Job[]> = {
      applied: [],
      interviewing: [],
      offered: [],
      rejected: [],
    };
    for (const job of jobs) {
      map[job.status].push(job);
    }
    return map;
  }, [jobs]);

  async function handleDragEnd(result: DropResult) {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as JobStatus;
    const job = jobs.find((j) => j._id === draggableId);
    if (!job || job.status === newStatus) return;

    await onStatusChange(job._id, newStatus);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
        {columns.map((col) => (
          <div
            key={col.status}
            className={`flex-shrink-0 min-w-[280px] flex-1 bg-blue-300 dark:bg-gray-800 rounded-lg border-t-4 ${col.borderColor}`}
          >
            <div className="px-3 py-2.5 border-b border-blue-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                {col.label}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {grouped[col.status].length}
              </span>
            </div>

            <Droppable droppableId={col.status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-2 min-h-[200px] transition-colors ${
                    snapshot.isDraggingOver
                      ? "bg-blue-200 dark:bg-gray-700"
                      : ""
                  }`}
                >
                  {grouped[col.status].length === 0 && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-500 py-8">
                      No jobs
                    </p>
                  )}

                  {grouped[col.status].map((job, index) => (
                    <Draggable
                      key={job._id}
                      draggableId={job._id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-blue-100 dark:bg-gray-700 rounded-md border border-stone-200 dark:border-gray-600 p-3 mb-2 shadow-sm transition-shadow ${
                            snapshot.isDragging
                              ? "shadow-lg ring-2 ring-blue-200 dark:ring-blue-500"
                              : "hover:shadow-md"
                          }`}
                        >
                          <div className="mb-1">
                            {job.jobUrl ? (
                              <a
                                href={job.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {job.company}
                              </a>
                            ) : (
                              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                {job.company}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1.5">
                            {job.role}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                            {formatDate(job.appliedDate)}
                          </p>

                          {job.salary != null && (
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                              {formatSalary(job.salary)}
                            </p>
                          )}

                          <div className="flex gap-1.5 pt-1 border-t border-gray-300 dark:border-gray-600">
                            <button
                              onClick={() => onEdit(job)}
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-1.5 py-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDelete(job._id)}
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
