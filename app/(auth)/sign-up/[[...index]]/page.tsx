import { SignUp } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-gradient bg-gradient-card shadow-premium">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold">Rejestracja</CardTitle>
              <PremiumBadge variant="glow" className="mt-2 rounded-full text-xs">
                FundedRank
              </PremiumBadge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SignUp routing="path" path="/sign-up" />
        </CardContent>
      </Card>
    </div>
  );
}

