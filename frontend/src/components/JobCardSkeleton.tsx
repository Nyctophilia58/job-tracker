import { Skeleton } from "./Skeleton";

export const JobCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-stone-200 p-4">
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-x-3">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-8" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </div>
);
