"use client";

import { Linkedin, Github, Mail } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Section } from "@/components/layout/section";
import { useFadeIn, useScrollAnimation, useStaggerAnimation } from "@/lib/animations";
import { cn } from "@/lib/utils";

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
    <Section
      ref={sectionVisible.ref}
      size="lg"
      className="flex flex-col fluid-stack-xl"
    >
      <div
        ref={sectionAnim.ref}
        className={cn("flex flex-col fluid-stack-sm", sectionAnim.className)}
      >
        <PremiumBadge variant="glow" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] rounded-full font-semibold">
          Poznaj nas
        </PremiumBadge>
        <h2 className="fluid-h2 font-semibold text-foreground">
          Nasz zespół
        </h2>
        <p className="max-w-3xl fluid-copy text-muted-foreground">
          Zespół pasjonatów tradingu i technologii, którzy codziennie pracują nad 
          tym, aby FundedRank był najlepszą platformą dla prop traderów.
        </p>
      </div>

      <div className="grid fluid-stack-lg md:grid-cols-2 lg:grid-cols-2">
        {teamMembers.map((member, index) => (
          <Card
            key={member.name}
            className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all duration-700 hover:border-primary/50 hover:shadow-md hover:scale-[1.02] delay-[var(--delay)] ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
          >
            <CardHeader className="flex flex-row items-start fluid-stack-sm pb-[clamp(0.75rem,1vw,1rem)]">
              <Avatar className="h-[clamp(3.5rem,2vw+3rem,4rem)] w-[clamp(3.5rem,2vw+3rem,4rem)] border-2 border-primary/30">
                <AvatarFallback className="bg-primary/20 text-primary fluid-copy font-semibold">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col fluid-stack-xs">
                <h3 className="fluid-copy font-semibold text-foreground">{member.name}</h3>
                <p className="fluid-caption text-primary font-medium">{member.role}</p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col fluid-stack-md">
              <p className="fluid-copy text-muted-foreground leading-relaxed">{member.bio}</p>
              {member.socialLinks && member.socialLinks.length > 0 && (
                <div className="flex fluid-stack-xs">
                  {member.socialLinks.map((link) => {
                    const Icon = iconMap[link.platform];
                    return (
                      <a
                        key={link.platform}
                        href={link.url}
                        className="flex h-[clamp(1.75rem,1vw+1.5rem,2rem)] w-[clamp(1.75rem,1vw+1.5rem,2rem)] items-center justify-center rounded-full border border-primary/30 text-primary transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-xs"
                        target="_blank"
                        rel="noreferrer"
                        aria-label={link.platform}
                      >
                        <Icon className="h-[clamp(0.9rem,0.5vw+0.8rem,1rem)] w-[clamp(0.9rem,0.5vw+0.8rem,1rem)]" />
                      </a>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

