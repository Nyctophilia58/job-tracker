import { Skeleton } from "./Skeleton";

export const JobRowSkeleton = () => (
  <tr className="h-14">
    <td className="px-5 py-4 w-24">
      <Skeleton className="h-4 w-full" />
    </td>
    <td className="px-5 py-4 w-32">
      <Skeleton className="h-4 w-full" />
    </td>
    <td className="px-5 py-4 w-20">
      <Skeleton className="h-4 w-full" />
    </td>
    <td className="px-5 py-4 w-24">
      <Skeleton className="h-4 w-full" />
    </td>
    <td className="px-5 py-4 w-20">
      <Skeleton className="h-4 w-full" />
    </td>
    <td className="px-5 py-4 w-20">
      <Skeleton className="h-4 w-full" />
    </td>
    <td className="px-5 py-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-8" />
      </div>
    </td>
  </tr>
);
