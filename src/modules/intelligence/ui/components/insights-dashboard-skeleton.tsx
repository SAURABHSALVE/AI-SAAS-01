import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CardSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-1/3" />
    </CardHeader>
    <CardContent className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </CardContent>
  </Card>
);

export const InsightsDashboardSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <CardSkeleton lines={4} />
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
};
