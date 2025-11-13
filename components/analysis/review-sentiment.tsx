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
    <div className="space-y-[clamp(1.5rem,2.2vw,2.25rem)]">
      <div className="space-y-[clamp(0.6rem,0.9vw,0.85rem)]">
        <h2 className="fluid-h2 font-bold">Analiza Sentymentu</h2>
        <p className="fluid-copy text-muted-foreground">
          Najczęściej wymieniane zalety i wady w opiniach użytkowników
        </p>
      </div>

      {/* Sentiment Overview */}
      <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] sm:grid-cols-2 lg:grid-cols-3">
        {sentimentData.map((data) => (
          <Card key={data.companyId} className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardHeader className="pb-[clamp(0.75rem,1.1vw,1rem)]">
              <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
                {data.companyName}
              </CardTitle>
              <CardDescription className="fluid-caption">
                {data.totalReviews} {data.totalReviews === 1 ? "opinia" : "opinii"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
              <div className="space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
                <div className="flex items-center justify-between gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                  <span>Wskaźnik sentymentu</span>
                  <span className="font-semibold text-foreground">{data.sentimentScore.toFixed(0)}%</span>
                </div>
                <Progress value={data.sentimentScore} className="h-[clamp(0.35rem,0.5vw,0.45rem)]" />
              </div>

              <div className="flex justify-between text-[clamp(0.9rem,0.4vw+0.8rem,1rem)]">
                <div className="flex items-center gap-[clamp(0.35rem,0.55vw,0.5rem)] text-green-600">
                  <ThumbsUp className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                  <span>{data.positiveCount}</span>
                </div>
                <div className="flex items-center gap-[clamp(0.35rem,0.55vw,0.5rem)] text-red-600">
                  <ThumbsDown className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
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
          <CardHeader className="pb-[clamp(0.75rem,1.1vw,1rem)]">
            <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
              {data.companyName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2">
              {/* Pros */}
              <div className="space-y-[clamp(0.65rem,1vw,0.9rem)]">
                <h4 className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-[clamp(0.95rem,0.4vw+0.85rem,1.05rem)] font-semibold text-green-600">
                  <ThumbsUp className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                  Top Zalety
                </h4>
                {data.topPros.length > 0 ? (
                  <ul className="space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
                    {data.topPros.map((pro, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                        <span className="fluid-copy">{pro.text}</span>
                        <Badge variant="secondary" className="shrink-0 fluid-badge font-semibold">
                          {pro.count}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="fluid-copy text-muted-foreground">Brak danych</p>
                )}
              </div>

              {/* Cons */}
              <div className="space-y-[clamp(0.65rem,1vw,0.9rem)]">
                <h4 className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-[clamp(0.95rem,0.4vw+0.85rem,1.05rem)] font-semibold text-red-600">
                  <ThumbsDown className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                  Top Wady
                </h4>
                {data.topCons.length > 0 ? (
                  <ul className="space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
                    {data.topCons.map((con, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                        <span className="fluid-copy">{con.text}</span>
                        <Badge variant="secondary" className="shrink-0 fluid-badge font-semibold">
                          {con.count}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="fluid-copy text-muted-foreground">Brak danych</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Recent Reviews */}
      <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
        {recentHighlights.map((company) => (
          <Card key={`recent-${company.companyId}`} className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardHeader className="pb-[clamp(0.75rem,1.1vw,1rem)]">
              <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
                {company.companyName}
              </CardTitle>
              <CardDescription className="fluid-caption">Ostatnie opinie</CardDescription>
            </CardHeader>
            <CardContent>
              {company.recentReviews.length > 0 ? (
                <div className="space-y-[clamp(0.75rem,1.1vw,1rem)]">
                  {company.recentReviews.map((review, idx) => (
                    <div key={idx} className="space-y-[clamp(0.35rem,0.5vw,0.45rem)] border-b pb-[clamp(0.65rem,1vw,0.9rem)] last:border-0">
                      <div className="flex items-center gap-[clamp(0.25rem,0.4vw,0.35rem)] text-yellow-500">
                        {Array.from({ length: Math.round(review.rating) }).map((_, i) => (
                          <Star key={i} className="h-[clamp(0.8rem,0.3vw+0.7rem,0.95rem)] w-[clamp(0.8rem,0.3vw+0.7rem,0.95rem)] fill-yellow-500" />
                        ))}
                      </div>
                      {review.body && (
                        <p className="line-clamp-2 text-muted-foreground fluid-caption">
                          {review.body}
                        </p>
                      )}
                      <p className="text-muted-foreground/70 fluid-caption">
                        {new Date(review.publishedAt).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="fluid-copy text-muted-foreground">Brak ostatnich opinii</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

