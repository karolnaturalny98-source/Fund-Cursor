"use client";

import { Award, Calendar, ExternalLink, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import Link from "next/link";
import type { CompanyCertification } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompanyCertificationsProps {
  certifications: CompanyCertification[];
  withoutCard?: boolean;
}

export function CompanyCertifications({ certifications, withoutCard = false }: CompanyCertificationsProps) {
  if (certifications.length === 0) {
    return null;
  }

  const content = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {certifications.map((cert) => {
            const issuedDate = cert.issuedDate
              ? new Date(cert.issuedDate).toLocaleDateString("pl-PL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : null;

            const expiryDate = cert.expiryDate
              ? new Date(cert.expiryDate).toLocaleDateString("pl-PL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : null;

            const isExpired = cert.expiryDate
              ? new Date(cert.expiryDate) < new Date()
              : false;

            return (
              <Card
                key={cert.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border-gradient bg-gradient-card p-4 shadow-premium transition-all",
                  "hover:border-gradient-premium hover:shadow-premium-lg",
                )}
              >
                {cert.imageUrl ? (
                  <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-muted/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cert.imageUrl}
                      alt={cert.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex aspect-video w-full items-center justify-center rounded-lg border border-border/40 bg-muted/20">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground leading-tight">
                      {cert.name}
                    </h3>
                    {isExpired && (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-xs font-medium text-amber-500 border-amber-500/30 bg-amber-500/10"
                      >
                        Wygasł
                      </Badge>
                    )}
                  </div>

                  {cert.issuer ? (
                    <p className="text-xs text-muted-foreground">
                      Wydawca: {cert.issuer}
                    </p>
                  ) : null}

                  {(issuedDate || expiryDate) && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {issuedDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Wydano: {issuedDate}</span>
                        </div>
                      )}
                      {expiryDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Ważny do: {expiryDate}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {cert.description ? (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {cert.description}
                    </p>
                  ) : null}

                  {cert.url ? (
                    <Link
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Zobacz certyfikat
                      <PremiumIcon icon={ExternalLink} variant="glow" size="sm" />
                    </Link>
                  ) : null}
                </div>
              </Card>
            );
          })}
    </div>
  );

  if (withoutCard) {
    return content;
  }

  return (
    <Card className="rounded-2xl border-gradient bg-gradient-card shadow-premium !backdrop-blur-[36px]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold sm:text-2xl">
            Akredytacje i certyfikaty
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Oficjalne certyfikaty i akredytacje potwierdzające wiarygodność firmy.
        </p>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

