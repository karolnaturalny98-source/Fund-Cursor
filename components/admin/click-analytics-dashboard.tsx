import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ClickAnalyticsResult,
  CompanyClickSummary,
} from "@/lib/queries/analytics";

interface ClickAnalyticsDashboardProps {
  data: ClickAnalyticsResult;
}

export function ClickAnalyticsDashboard({
  data,
}: ClickAnalyticsDashboardProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Analityka kliknięć</h2>
        <p className="text-sm text-muted-foreground">
          Monitoruj łączną liczbę przekierowań „Zakup z kodem” oraz aktywność
          w ostatnich dniach.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Łącznie"
          value={data.summary.total}
          description="Wszystkie kliknięcia zarejestrowane w systemie"
        />
        <SummaryCard
          label="Ostatnie 30 dni"
          value={data.summary.last30Days}
          description="Kliknięcia z ostatnich 30 dni"
        />
        <SummaryCard
          label="Ostatnie 7 dni"
          value={data.summary.last7Days}
          description="Kliknięcia z ostatniego tygodnia"
        />
      </div>

      <CompanyTable companies={data.companies} />
    </section>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">
          {value.toLocaleString("pl-PL")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function CompanyTable({ companies }: { companies: CompanyClickSummary[] }) {
  if (companies.length === 0) {
    return (
      <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardContent className="pt-6">
          <div className="rounded-lg border border-dashed border-border/50 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Brak zarejestrowanych kliknięć – panel wypełni się po pierwszych
            przekierowaniach.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <CardHeader>
        <CardTitle>Top firmy</CardTitle>
        <CardDescription>
          Zestawienie obejmuje maksymalnie 20 firm z największą liczbą kliknięć.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firma</TableHead>
              <TableHead className="text-right">Łącznie</TableHead>
              <TableHead className="text-right">30 dni</TableHead>
              <TableHead className="text-right">7 dni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((entry) => (
              <TableRow key={entry.company.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {entry.company.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /{entry.company.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="font-mono">
                    {entry.total.toLocaleString("pl-PL")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {entry.last30Days.toLocaleString("pl-PL")}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {entry.last7Days.toLocaleString("pl-PL")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
