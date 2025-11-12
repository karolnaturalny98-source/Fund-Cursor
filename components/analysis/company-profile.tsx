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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile Firm</h2>
        <p className="text-sm text-muted-foreground">
          Szczegółowe informacje o każdej firmie
        </p>
      </div>

      {/* Main Company Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company, idx) => (
          <Card
            key={company.id}
            className="border-l-4 rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs border-[var(--border-color)]"
            style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                {company.logoUrl ? (
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarImage src={company.logoUrl} alt={company.name} />
                    <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/10">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-16 w-16 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-linear-to-br from-primary/20 to-primary/10">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1">
                  <CardTitle>{company.name}</CardTitle>
                  {company.headline && (
                    <CardDescription className="mt-1">
                      {company.headline}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.shortDescription && (
                <p className="text-sm text-muted-foreground">
                  {company.shortDescription}
                </p>
              )}

              {/* Basic Info */}
              <div className="space-y-2">
                {company.country && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{company.country}</span>
                  </div>
                )}
                
                {company.foundedYear && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Założona: {company.foundedYear}</span>
                  </div>
                )}

                {company.regulation && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{company.regulation}</span>
                  </div>
                )}

                {company.ceo && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>CEO: {company.ceo}</span>
                  </div>
                )}
              </div>

              {/* Website */}
              {company.websiteUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Regulacje i Licencje
          </CardTitle>
          <CardDescription>
            Status prawny i licencje regulacyjne
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
                
                <div className="space-y-3">
                  {company.regulation && (
                    <div>
                      <p className="text-xs text-muted-foreground">Regulacja</p>
                      <p className="text-sm font-medium">{company.regulation}</p>
                    </div>
                  )}

                  {company.verificationStatus && (
                    <div>
                      <p className="text-xs text-muted-foreground">Status weryfikacji</p>
                      <Badge variant="default" className="mt-1">
                        {company.verificationStatus}
                      </Badge>
                    </div>
                  )}

                  {company.licenses && company.licenses.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs text-muted-foreground">Licencje</p>
                      <div className="flex flex-wrap gap-1">
                      {company.licenses.map((license, licIdx) => (
                        <Badge key={licIdx} variant="outline" className="text-xs">
                          {license}
                        </Badge>
                      ))}
                      </div>
                    </div>
                  )}

                  {company.kycRequired && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-primary" />
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
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certyfikaty
            </CardTitle>
            <CardDescription>
              Certyfikaty i nagrody
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companies.map((company, idx) => (
                <div
                  key={company.id}
                  className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-4"
                  style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
                >
                  <h4 className="mb-3 font-semibold">{company.name}</h4>
                  
                  {company.certifications && company.certifications.length > 0 ? (
                    <div className="space-y-3">
                      {company.certifications.map((cert) => (
                        <div key={cert.id} className="space-y-1">
                          <p className="text-sm font-medium">{cert.name}</p>
                          {cert.issuer && (
                            <p className="text-xs text-muted-foreground">
                              Wydawca: {cert.issuer}
                            </p>
                          )}
                          {cert.issuedDate && (
                            <p className="text-xs text-muted-foreground">
                              Data: {new Date(cert.issuedDate).toLocaleDateString("pl-PL")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
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
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Zespół
            </CardTitle>
            <CardDescription>
              Kluczowi członkowie zespołu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companies.map((company, idx) => (
                <div
                  key={company.id}
                  className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-4"
                  style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
                >
                  <h4 className="mb-3 font-semibold">{company.name}</h4>
                  
                  {company.teamMembers && company.teamMembers.length > 0 ? (
                    <div className="space-y-3">
                      {company.teamMembers.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-start gap-2">
                          {member.profileImageUrl ? (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.profileImageUrl} alt={member.name} />
                              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10">
                                <Users className="h-5 w-5 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10">
                                <Users className="h-5 w-5 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                      ))}
                      {company.teamMembers.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{company.teamMembers.length - 5} więcej
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
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
          <CardTitle>Metody Płatności</CardTitle>
          <CardDescription>
            Dostępne metody płatności
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, idx) => (
              <div
                key={company.id}
              className="rounded-lg border-l-4 bg-card/72 backdrop-blur-[36px]! p-4"
              style={{ "--border-color": getCompanyColor(idx) } as React.CSSProperties}
            className="border-l-4 rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs border-[var(--border-color)]"
              >
                <h4 className="mb-3 font-semibold">{company.name}</h4>
                
                {company.paymentMethods && company.paymentMethods.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {company.paymentMethods.map((method, methodIdx) => (
                      <Badge key={methodIdx} variant="outline">
                        {method}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
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

