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
    <div className="flex flex-col fluid-stack-2xl">
      <div className="flex flex-col fluid-stack-sm">
        <h2 className="fluid-h2 font-bold">Analiza Sentymentu</h2>
        <p className="fluid-copy text-muted-foreground">
          Najczęściej wymieniane zalety i wady w opiniach użytkowników
        </p>
      </div>

      {/* Sentiment Overview */}
      <div className="grid fluid-grid-gap-md sm:grid-cols-2 lg:grid-cols-3">
        {sentimentData.map((data) => (
          <Card key={data.companyId} className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold text-foreground fluid-copy">
                {data.companyName}
              </CardTitle>
              <CardDescription className="fluid-caption">
                {data.totalReviews} {data.totalReviews === 1 ? "opinia" : "opinii"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col fluid-stack-sm">
              <div className="flex flex-col fluid-stack-xs">
                <div className="flex items-center justify-between gap-2 text-muted-foreground fluid-caption">
                  <span>Wskaźnik sentymentu</span>
                  <span className="font-semibold text-foreground">{data.sentimentScore.toFixed(0)}%</span>
                </div>
                <Progress value={data.sentimentScore} className="h-2" />
              </div>

              <div className="flex justify-between fluid-copy">
                <div className="flex items-center gap-2 text-green-600">
                  <ThumbsUp className="fluid-icon-sm" />
                  <span>{data.positiveCount}</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <ThumbsDown className="fluid-icon-sm" />
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
          <CardHeader className="pb-3">
            <CardTitle className="font-semibold text-foreground fluid-copy">
              {data.companyName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid fluid-grid-gap-md md:grid-cols-2">
              {/* Pros */}
              <div className="flex flex-col fluid-stack-sm">
                <h4 className="flex items-center gap-2 font-semibold text-green-600 fluid-copy">
                  <ThumbsUp className="fluid-icon-sm" />
                  Top Zalety
                </h4>
                {data.topPros.length > 0 ? (
                  <ul className="flex flex-col fluid-stack-xs">
                    {data.topPros.map((pro, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <span className="fluid-copy">{pro.text}</span>
                        <Badge variant="secondary" className="shrink-0 inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full font-semibold">
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
              <div className="flex flex-col fluid-stack-sm">
                <h4 className="flex items-center gap-2 font-semibold text-red-600 fluid-copy">
                  <ThumbsDown className="fluid-icon-sm" />
                  Top Wady
                </h4>
                {data.topCons.length > 0 ? (
                  <ul className="flex flex-col fluid-stack-xs">
                    {data.topCons.map((con, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <span className="fluid-copy">{con.text}</span>
                        <Badge variant="secondary" className="shrink-0 inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full font-semibold">
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
      <div className="grid fluid-grid-gap-md md:grid-cols-2 lg:grid-cols-3">
        {recentHighlights.map((company) => (
          <Card key={`recent-${company.companyId}`} className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold text-foreground fluid-copy">
                {company.companyName}
              </CardTitle>
              <CardDescription className="fluid-caption">Ostatnie opinie</CardDescription>
            </CardHeader>
            <CardContent>
              {company.recentReviews.length > 0 ? (
                <div className="flex flex-col fluid-stack-sm">
                  {company.recentReviews.map((review, idx) => (
                    <div key={idx} className="flex flex-col fluid-stack-xs border-b pb-4 last:border-0">
                      <div className="flex items-center gap-1 text-yellow-500">
                        {Array.from({ length: Math.round(review.rating) }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-yellow-500" />
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
