"use client";

import { Building2, MapPin, Calendar, Shield, Award, Users, ExternalLink } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getCompareColor } from "@/lib/compare";
import type { CompanyWithDetails } from "@/lib/types";

interface CompanyProfileProps {
  companies: CompanyWithDetails[];
}

export function CompanyProfile({ companies }: CompanyProfileProps) {
  const getCompanyColor = (index: number) => getCompareColor(index);

  return (
    <div className="space-y-[clamp(1.5rem,2.2vw,2.25rem)]">
      <div className="space-y-[clamp(0.6rem,0.9vw,0.85rem)]">
        <h2 className="fluid-h2 font-bold">Profile Firm</h2>
        <p className="fluid-copy text-muted-foreground">
          Szczegółowe informacje o każdej firmie
        </p>
      </div>

      {/* Main Company Cards */}
      <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company, idx) => (
          <Card
            key={company.id}
            className="border-l-4 rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs border-[var(--border-color)]"
            style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
          >
            <CardHeader className="pb-[clamp(0.75rem,1.1vw,1rem)]">
              <div className="flex items-start gap-[clamp(0.85rem,1.2vw,1.1rem)]">
                {company.logoUrl ? (
                  <Avatar className="h-[clamp(3.25rem,3vw+2.5rem,4.25rem)] w-[clamp(3.25rem,3vw+2.5rem,4.25rem)] rounded-[1rem]">
                    <AvatarImage src={company.logoUrl} alt={company.name} />
                    <AvatarFallback className="rounded-[1rem] bg-linear-to-br from-primary/20 to-primary/10">
                      <Building2 className="h-[clamp(1.6rem,0.6vw+1.4rem,1.9rem)] w-[clamp(1.6rem,0.6vw+1.4rem,1.9rem)] text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-[clamp(3.25rem,3vw+2.5rem,4.25rem)] w-[clamp(3.25rem,3vw+2.5rem,4.25rem)] rounded-[1rem]">
                    <AvatarFallback className="rounded-[1rem] bg-linear-to-br from-primary/20 to-primary/10">
                      <Building2 className="h-[clamp(1.6rem,0.6vw+1.4rem,1.9rem)] w-[clamp(1.6rem,0.6vw+1.4rem,1.9rem)] text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 space-y-[clamp(0.35rem,0.5vw,0.45rem)]">
                  <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
                    {company.name}
                  </CardTitle>
                  {company.headline && (
                    <CardDescription className="fluid-caption">
                      {company.headline}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
              {company.shortDescription && (
                <p className="fluid-copy text-muted-foreground">
                  {company.shortDescription}
                </p>
              )}

              {/* Basic Info */}
              <div className="space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
                {company.country && (
                  <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                    <MapPin className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                    <span className="text-foreground">{company.country}</span>
                  </div>
                )}
                
                {company.foundedYear && (
                  <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                    <Calendar className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                    <span className="text-foreground">Założona: {company.foundedYear}</span>
                  </div>
                )}

                {company.regulation && (
                  <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                    <Shield className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                    <span className="text-foreground">{company.regulation}</span>
                  </div>
                )}

                {company.ceo && (
                  <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                    <Users className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                    <span className="text-foreground">CEO: {company.ceo}</span>
                  </div>
                )}
              </div>

              {/* Website */}
              {company.websiteUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full fluid-button rounded-full"
                  asChild
                >
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                    Odwiedź stronę
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Regulation & Licensing */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-[clamp(0.65rem,0.95vw,0.9rem)] text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
            <Shield className="h-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)]" />
            Regulacje i Licencje
          </CardTitle>
          <CardDescription className="fluid-caption">
            Status prawny i licencje regulacyjne
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-[clamp(1rem,1.4vw,1.3rem)] border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-[clamp(0.65rem,1vw,0.9rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                  {company.name}
                </h4>
                
                <div className="space-y-[clamp(0.65rem,1vw,0.9rem)]">
                  {company.regulation && (
                    <div>
                      <p className="text-muted-foreground fluid-caption">Regulacja</p>
                      <p className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-medium text-foreground">
                        {company.regulation}
                      </p>
                    </div>
                  )}

                  {company.verificationStatus && (
                    <div>
                      <p className="text-muted-foreground fluid-caption">Status weryfikacji</p>
                      <Badge variant="default" className="mt-[clamp(0.35rem,0.5vw,0.45rem)] fluid-badge font-semibold">
                        {company.verificationStatus}
                      </Badge>
                    </div>
                  )}

                  {company.licenses && company.licenses.length > 0 && (
                    <div>
                      <p className="mb-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">Licencje</p>
                      <div className="flex flex-wrap gap-[clamp(0.35rem,0.55vw,0.5rem)]">
                        {company.licenses.map((license, licIdx) => (
                          <Badge key={licIdx} variant="outline" className="fluid-badge font-medium">
                            {license}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {company.kycRequired && (
                    <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-primary fluid-caption">
                      <Shield className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
                      <span>Wymaga KYC</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Details */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Szczegóły Firmy
          </CardTitle>
          <CardDescription>
            Dodatkowe informacje o firmach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-4 border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-3 font-semibold">{company.name}</h4>
                
                <div className="space-y-2 text-sm">
                  {company.legalName && (
                    <div>
                      <p className="text-xs text-muted-foreground">Nazwa prawna</p>
                      <p className="font-medium">{company.legalName}</p>
                    </div>
                  )}

                  {company.headquartersAddress && (
                    <div>
                      <p className="text-xs text-muted-foreground">Siedziba</p>
                      <p className="font-medium">{company.headquartersAddress}</p>
                    </div>
                  )}

                  {company.foundersInfo && (
                    <div>
                      <p className="text-xs text-muted-foreground">Założyciele</p>
                      <p className="font-medium">{company.foundersInfo}</p>
                    </div>
                  )}

                  {company.supportContact && (
                    <div>
                      <p className="text-xs text-muted-foreground">Kontakt</p>
                      <p className="font-medium">{company.supportContact}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      {companies.some((c) => c.certifications && c.certifications.length > 0) && (
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-[clamp(0.65rem,0.95vw,0.9rem)] text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
              <Award className="h-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)]" />
              Certyfikaty
            </CardTitle>
            <CardDescription className="fluid-caption">
              Certyfikaty i nagrody
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
              {companies.map((company, idx) => (
                <div
                  key={company.id}
                  className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-[clamp(1rem,1.4vw,1.3rem)]"
                  style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
                >
                  <h4 className="mb-[clamp(0.65rem,1vw,0.9rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                    {company.name}
                  </h4>
                  
                  {company.certifications && company.certifications.length > 0 ? (
                    <div className="space-y-[clamp(0.65rem,1vw,0.9rem)]">
                      {company.certifications.map((cert) => (
                        <div key={cert.id} className="space-y-[clamp(0.35rem,0.5vw,0.45rem)]">
                          <p className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-medium text-foreground">
                            {cert.name}
                          </p>
                          {cert.issuer && (
                            <p className="text-muted-foreground fluid-caption">
                              Wydawca: {cert.issuer}
                            </p>
                          )}
                          {cert.issuedDate && (
                            <p className="text-muted-foreground/80 fluid-caption">
                              Data: {new Date(cert.issuedDate).toLocaleDateString("pl-PL")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="fluid-copy text-muted-foreground">
                      Brak certyfikatów
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team */}
      {companies.some((c) => c.teamMembers && c.teamMembers.length > 0) && (
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-[clamp(0.65rem,0.95vw,0.9rem)] text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
              <Users className="h-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] w-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)]" />
              Zespół
            </CardTitle>
            <CardDescription className="fluid-caption">
              Kluczowi członkowie zespołu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
              {companies.map((company, idx) => (
                <div
                  key={company.id}
                  className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-[clamp(1rem,1.4vw,1.3rem)]"
                  style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
                >
                  <h4 className="mb-[clamp(0.65rem,1vw,0.9rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                    {company.name}
                  </h4>
                  
                  {company.teamMembers && company.teamMembers.length > 0 ? (
                    <div className="space-y-[clamp(0.65rem,1vw,0.9rem)]">
                      {company.teamMembers.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-start gap-[clamp(0.55rem,0.85vw,0.8rem)]">
                          {member.profileImageUrl ? (
                            <Avatar className="h-[clamp(2.25rem,1vw+2rem,2.75rem)] w-[clamp(2.25rem,1vw+2rem,2.75rem)]">
                              <AvatarImage src={member.profileImageUrl} alt={member.name} />
                              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10">
                                <Users className="h-[clamp(1.1rem,0.4vw+1rem,1.25rem)] w-[clamp(1.1rem,0.4vw+1rem,1.25rem)] text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar className="h-[clamp(2.25rem,1vw+2rem,2.75rem)] w-[clamp(2.25rem,1vw+2rem,2.75rem)]">
                              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10">
                                <Users className="h-[clamp(1.1rem,0.4vw+1rem,1.25rem)] w-[clamp(1.1rem,0.4vw+1rem,1.25rem)] text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1 space-y-[clamp(0.25rem,0.4vw,0.35rem)]">
                            <p className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-medium text-foreground">
                              {member.name}
                            </p>
                            <p className="text-muted-foreground/80 fluid-caption">{member.role}</p>
                          </div>
                        </div>
                      ))}
                      {company.teamMembers.length > 5 && (
                        <p className="text-muted-foreground fluid-caption">
                          +{company.teamMembers.length - 5} więcej
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="fluid-copy text-muted-foreground">
                      Brak informacji o zespole
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader>
          <CardTitle className="text-[clamp(1rem,0.45vw+0.9rem,1.2rem)] font-semibold text-foreground">
            Metody Płatności
          </CardTitle>
          <CardDescription className="fluid-caption">
            Dostępne metody płatności
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-[clamp(1rem,1.6vw,1.5rem)] md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-[clamp(1rem,1.4vw,1.3rem)] border-[var(--border-color)]"
                style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
              >
                <h4 className="mb-[clamp(0.65rem,1vw,0.9rem)] text-[clamp(0.95rem,0.45vw+0.85rem,1.1rem)] font-semibold text-foreground">
                  {company.name}
                </h4>
                
                {company.paymentMethods && company.paymentMethods.length > 0 ? (
                  <div className="flex flex-wrap gap-[clamp(0.45rem,0.7vw,0.65rem)]">
                    {company.paymentMethods.map((method, methodIdx) => (
                      <Badge key={methodIdx} variant="outline" className="fluid-badge font-medium">
                        {method}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="fluid-copy text-muted-foreground">
                    Brak informacji o metodach płatności
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

