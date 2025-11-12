import { SignIn } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";

export default function SignInPage() {
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold">Logowanie</CardTitle>
              <PremiumBadge variant="glow" className="mt-2 rounded-full text-xs">
                FundedRank
              </PremiumBadge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SignIn routing="path" path="/sign-in" />
        </CardContent>
      </Card>
    </div>
  );
}

