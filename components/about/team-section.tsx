"use client";

import { Linkedin, Github, Mail } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { useFadeIn, useScrollAnimation, useStaggerAnimation } from "@/lib/animations";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  socialLinks?: { platform: "linkedin" | "github" | "email"; url: string }[];
}

const teamMembers: TeamMember[] = [
  {
    name: "Jan Kowalski",
    role: "CEO & Founder",
    bio: "Trader z 8-letnim doświadczeniem w prop tradingu. Założyciel FundedRank i wizjoner ekosystemu cashback dla społeczności.",
    initials: "JK",
    socialLinks: [
      { platform: "linkedin", url: "#" },
      { platform: "email", url: "#" },
    ],
  },
  {
    name: "Anna Nowak",
    role: "Head of Community",
    bio: "Specjalistka od budowania społeczności i zarządzania programami partnerskimi. Odpowiedzialna za relacje z influencerami.",
    initials: "AN",
    socialLinks: [
      { platform: "linkedin", url: "#" },
    ],
  },
  {
    name: "Piotr Wiśniewski",
    role: "Lead Developer",
    bio: "Full-stack developer z pasją do czystego kodu. Architekt platformy FundedRank i systemu cashback.",
    initials: "PW",
    socialLinks: [
      { platform: "github", url: "#" },
      { platform: "linkedin", url: "#" },
    ],
  },
  {
    name: "Maria Zielińska",
    role: "Content Manager",
    bio: "Ekspertka w tworzeniu wartościowych treści edukacyjnych. Zarządza bazą wiedzy i rankingami firm.",
    initials: "MZ",
    socialLinks: [
      { platform: "linkedin", url: "#" },
      { platform: "email", url: "#" },
    ],
  },
];

const iconMap = {
  linkedin: Linkedin,
  github: Github,
  email: Mail,
};

export function TeamSection() {
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const sectionVisible = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(teamMembers.length, 100);
  const visibleStaggerItems = sectionVisible.isVisible ? staggerItems : new Array(teamMembers.length).fill(false);

  return (
    <section ref={sectionVisible.ref} className="container space-y-8 py-12">
      <div ref={sectionAnim.ref} className={`space-y-3 ${sectionAnim.className}`}>
        <PremiumBadge variant="glow" className="rounded-full px-4 py-1 text-xs font-semibold">
          Poznaj nas
        </PremiumBadge>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Nasz zespół
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Zespół pasjonatów tradingu i technologii, którzy codziennie pracują nad 
          tym, aby FundedRank był najlepszą platformą dla prop traderów.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {teamMembers.map((member, index) => (
          <Card
            key={member.name}
            className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md hover:scale-[1.02] ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDelay: `${index * 100}ms`, transitionDuration: "700ms" }}
          >
            <CardHeader className="flex flex-row items-start gap-4 pb-4">
              <Avatar className="h-16 w-16 border-2 border-primary/30">
                <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              {member.socialLinks && member.socialLinks.length > 0 && (
                <div className="flex gap-2">
                  {member.socialLinks.map((link) => {
                    const Icon = iconMap[link.platform];
                    return (
                      <a
                        key={link.platform}
                        href={link.url}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-primary transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-xs"
                        target="_blank"
                        rel="noreferrer"
                        aria-label={link.platform}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

