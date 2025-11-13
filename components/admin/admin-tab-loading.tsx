import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface AdminTabLoadingProps {
  message?: string;
}

export function AdminTabLoading({ message = "Ładowanie..." }: AdminTabLoadingProps) {
  return (
    <div className="flex flex-col fluid-stack-md" role="status" aria-live="polite" aria-label="Ładowanie zawartości">
      <div className="flex flex-col fluid-stack-xs">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col fluid-stack-sm">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </CardContent>
      </Card>
      <div className="rounded-xl border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
        {message}
      </div>
    </div>
  );
}

