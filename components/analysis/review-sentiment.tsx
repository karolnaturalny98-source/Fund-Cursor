"use client";

import { useMemo } from "react";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { CompanyWithDetails } from "@/lib/types";

interface ReviewSentimentProps {
  companies: CompanyWithDetails[];
}

export function ReviewSentiment({ companies }: ReviewSentimentProps) {
  // Analyze pros and cons from reviews
  const sentimentData = useMemo(() => {
    return companies.map((company) => {
      const reviews = company.reviews || [];
      const allPros: string[] = [];
      const allCons: string[] = [];

      reviews.forEach((review) => {
        allPros.push(...(review.pros || []));
        allCons.push(...(review.cons || []));
      });

      // Count word frequencies
      const prosCount = new Map<string, number>();
      const consCount = new Map<string, number>();

      allPros.forEach((pro) => {
        const normalized = pro.toLowerCase().trim();
        prosCount.set(normalized, (prosCount.get(normalized) || 0) + 1);
      });

      allCons.forEach((con) => {
        const normalized = con.toLowerCase().trim();
        consCount.set(normalized, (consCount.get(normalized) || 0) + 1);
      });

      // Get top 5 most mentioned
      const topPros = Array.from(prosCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([text, count]) => ({ text, count }));

      const topCons = Array.from(consCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([text, count]) => ({ text, count }));

      // Calculate sentiment score
      const positiveCount = allPros.length;
      const negativeCount = allCons.length;
      const total = positiveCount + negativeCount;
      const sentimentScore = total > 0 ? (positiveCount / total) * 100 : 0;

      return {
        companyName: company.name,
        companyId: company.id,
        topPros,
        topCons,
        positiveCount,
        negativeCount,
        sentimentScore,
        totalReviews: reviews.length,
      };
    });
  }, [companies]);

  // Calculate recent review highlights
  const recentHighlights = useMemo(() => {
    return companies.map((company) => {
      const reviews = company.reviews || [];
      const recent = reviews
        .sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt).getTime();
          return dateB - dateA;
        })
        .slice(0, 3);

      return {
        companyName: company.name,
        companyId: company.id,
        recentReviews: recent.map((r) => ({
          rating: r.rating,
          body: r.body,
          publishedAt: r.publishedAt || r.createdAt,
        })),
      };
    });
  }, [companies]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analiza Sentymentu</h2>
        <p className="text-sm text-muted-foreground">
          Najczęściej wymieniane zalety i wady w opiniach użytkowników
        </p>
      </div>

      {/* Sentiment Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sentimentData.map((data) => (
          <Card key={data.companyId} className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardHeader>
              <CardTitle className="text-base">{data.companyName}</CardTitle>
              <CardDescription>
                {data.totalReviews} {data.totalReviews === 1 ? "opinia" : "opinii"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Wskaźnik sentymentu</span>
                  <span className="font-semibold">{data.sentimentScore.toFixed(0)}%</span>
                </div>
                <Progress value={data.sentimentScore} className="h-2" />
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{data.positiveCount}</span>
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <ThumbsDown className="h-4 w-4" />
                  <span>{data.negativeCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Pros and Cons */}
      {sentimentData.map((data) => (
        <Card key={`detail-${data.companyId}`} className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">{data.companyName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Pros */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  Top Zalety
                </h4>
                {data.topPros.length > 0 ? (
                  <ul className="space-y-2">
                    {data.topPros.map((pro, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <span className="text-sm">{pro.text}</span>
                        <Badge variant="secondary" className="shrink-0">
                          {pro.count}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Brak danych</p>
                )}
              </div>

              {/* Cons */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-red-600">
                  <ThumbsDown className="h-4 w-4" />
                  Top Wady
                </h4>
                {data.topCons.length > 0 ? (
                  <ul className="space-y-2">
                    {data.topCons.map((con, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <span className="text-sm">{con.text}</span>
                        <Badge variant="secondary" className="shrink-0">
                          {con.count}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Brak danych</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Recent Reviews */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentHighlights.map((company) => (
          <Card key={`recent-${company.companyId}`} className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardHeader>
              <CardTitle className="text-base">{company.companyName}</CardTitle>
              <CardDescription>Ostatnie opinie</CardDescription>
            </CardHeader>
            <CardContent>
              {company.recentReviews.length > 0 ? (
                <div className="space-y-3">
                  {company.recentReviews.map((review, idx) => (
                    <div key={idx} className="space-y-1 border-b pb-2 last:border-0">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      {review.body && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {review.body}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.publishedAt).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak ostatnich opinii</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

