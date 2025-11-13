"use client";

import { ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFadeIn, useScrollAnimation, useStaggerAnimation } from "@/lib/animations";
import { useRef } from "react";

interface TeamTreeProps {
  teamMembers: TeamMember[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function groupByLevel(members: TeamMember[]): Map<number, TeamMember[]> {
  const grouped = new Map<number, TeamMember[]>();
  for (const member of members) {
    const level = member.level;
    if (!grouped.has(level)) {
      grouped.set(level, []);
    }
    grouped.get(level)!.push(member);
  }
  return grouped;
}

function sortMembersByPosition(members: TeamMember[]): TeamMember[] {
  const positionOrder: Record<string, number> = { left: 0, center: 1, right: 2 };
  return [...members].sort((a, b) => {
    const posA = a.position ? positionOrder[a.position] ?? 999 : 999;
    const posB = b.position ? positionOrder[b.position] ?? 999 : 999;
    if (posA !== posB) return posA - posB;
    return a.order - b.order;
  });
}

interface TeamMemberNodeProps {
  member: TeamMember;
  isTopLevel?: boolean;
  index: number;
  totalInLevel: number;
  isVisible: boolean;
}

function TeamMemberNode({ member, isTopLevel, index, totalInLevel: _totalInLevel, isVisible }: TeamMemberNodeProps) {
  const avatarSize = isTopLevel
    ? "h-[clamp(4.5rem,5vw,5.5rem)] w-[clamp(4.5rem,5vw,5.5rem)]"
    : "h-[clamp(3.5rem,4.2vw,4.5rem)] w-[clamp(3.5rem,4.2vw,4.5rem)]";
  const nameClass = isTopLevel ? "font-semibold text-foreground fluid-copy" : "font-medium text-foreground fluid-caption";
  
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Avatar with LinkedIn icon */}
      <div className="relative">
        <Avatar className={cn(
          avatarSize,
          "rounded-full border-2 border-primary/30 ring-2 ring-primary/10 transition-all duration-300",
          "group-hover:border-primary/50 group-hover:ring-primary/20 group-hover:scale-105"
        )}>
          <AvatarImage src={member.profileImageUrl || undefined} alt={member.name} />
          <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-[clamp(1rem,0.6vw+0.9rem,1.4rem)] font-semibold">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        {member.linkedInUrl && (
          <a
            href={member.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -bottom-1 -right-1 flex h-[clamp(1.5rem,1.8vw,1.75rem)] w-[clamp(1.5rem,1.8vw,1.75rem)] items-center justify-center rounded-full border-2 border-background bg-primary/90 text-primary-foreground transition-all hover:bg-primary hover:scale-110 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`LinkedIn profil ${member.name}`}
          >
            <ExternalLink className="h-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)] w-[clamp(0.75rem,0.45vw+0.6rem,0.9rem)]" />
          </a>
        )}
      </div>

      {/* Name and Role */}
      <div className="mt-[clamp(0.65rem,0.9vw,0.85rem)] space-y-[clamp(0.3rem,0.45vw,0.4rem)] text-center">
        <p className={cn(nameClass)}>{member.name}</p>
        <p className="text-muted-foreground fluid-caption">{member.role}</p>
      </div>
    </div>
  );
}

interface ConnectorLinesProps {
  fromLevel: number;
  toLevel: number;
  fromMembers: TeamMember[];
  toMembers: TeamMember[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function ConnectorLines({ fromLevel: _fromLevel, toLevel: _toLevel, fromMembers, toMembers, containerRef: _containerRef }: ConnectorLinesProps) {
  if (fromMembers.length === 0 || toMembers.length === 0) return null;

  // Calculate positions for connectors
  // This is a simplified version - in a real implementation, you'd measure actual DOM positions
  const fromCount = fromMembers.length;
  const toCount = toMembers.length;
  
  // Calculate approximate positions (assuming equal spacing)
  const fromPositions = Array.from({ length: fromCount }, (_, i) => (i + 0.5) / fromCount);
  const toPositions = Array.from({ length: toCount }, (_, i) => (i + 0.5) / toCount);

  return (
    <svg
      className="absolute inset-0 pointer-events-none w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <pattern id="dash" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="4" y2="4" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        </pattern>
      </defs>
      {fromPositions.map((fromPos, fromIdx) => {
        // Connect each from member to all to members (or distribute evenly)
        const connectionsPerFrom = Math.ceil(toCount / fromCount);
        const startToIdx = Math.floor(fromIdx * (toCount / fromCount));
        const endToIdx = Math.min(startToIdx + connectionsPerFrom, toCount);

        return Array.from({ length: endToIdx - startToIdx }, (_, i) => {
          const toIdx = startToIdx + i;
          const toPos = toPositions[toIdx];
          
          // Calculate line coordinates (percentage-based)
          const fromX = fromPos * 100;
          const toX = toPos * 100;
          const fromY = 0; // Top of connector area
          const toY = 100; // Bottom of connector area

          return (
            <g key={`${fromIdx}-${toIdx}`}>
              {/* Vertical line from top level */}
              <line
                x1={`${fromX}%`}
                y1={`${fromY}%`}
                x2={`${fromX}%`}
                y2="50%"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
                className="transition-opacity duration-500"
              />
              {/* Horizontal connector */}
              {fromX !== toX && (
                <line
                  x1={`${fromX}%`}
                  y1="50%"
                  x2={`${toX}%`}
                  y2="50%"
                  stroke="hsl(var(--border))"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.4"
                  className="transition-opacity duration-500"
                />
              )}
              {/* Vertical line to bottom level */}
              <line
                x1={`${toX}%`}
                y1="50%"
                y2={`${toY}%`}
                x2={`${toX}%`}
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.4"
                className="transition-opacity duration-500"
              />
            </g>
          );
        });
      })}
    </svg>
  );
}

export function TeamTree({ teamMembers }: TeamTreeProps) {
  const sectionAnim = useFadeIn({ threshold: 0.1 });
  const sectionScrollAnim = useScrollAnimation({ threshold: 0.1 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Hooks must be called before any early returns
  const totalMembers = teamMembers.length;
  const staggerItems = useStaggerAnimation(totalMembers, 80);
  // Show items immediately if section is visible, otherwise use stagger animation
  const visibleStaggerItems = sectionScrollAnim.isVisible ? staggerItems : new Array(totalMembers).fill(true);

  if (teamMembers.length === 0) {
    return null;
  }

  const grouped = groupByLevel(teamMembers);
  const levels = Array.from(grouped.keys()).sort((a, b) => a - b);

  // Calculate member indices for stagger animation
  let memberIndex = 0;

  return (
    <div
      ref={(node) => {
        sectionAnim.ref.current = node;
        sectionScrollAnim.ref.current = node;
        containerRef.current = node;
      }}
      className={cn(
        "relative space-y-[clamp(2rem,3vw,3.25rem)] md:space-y-[clamp(2.5rem,3.5vw,3.75rem)] py-[clamp(1rem,1.6vw,1.4rem)]",
        sectionAnim.className
      )}
      role="tree"
      aria-label="Struktura organizacyjna zespołu"
    >
      {levels.map((level, levelIdx) => {
        const members = sortMembersByPosition(grouped.get(level) || []);
        const isTopLevel = level === 0;
        const nextLevel = levels[levelIdx + 1];
        const nextLevelMembers = nextLevel !== undefined ? sortMembersByPosition(grouped.get(nextLevel) || []) : [];

        return (
          <div key={level} className="relative">
            {/* Level container */}
            <div className={cn(
              "flex flex-wrap items-start justify-center gap-[clamp(1.25rem,1.8vw,1.6rem)] md:gap-[clamp(1.5rem,2vw,1.9rem)] lg:gap-[clamp(2rem,2.8vw,2.5rem)]",
              isTopLevel && "justify-center"
            )}>
              {members.map((member) => {
                const currentIndex = memberIndex++;
                const isVisible = visibleStaggerItems[currentIndex] || false;
                
                return (
                  <TeamMemberNode
                    key={member.id}
                    member={member}
                    isTopLevel={isTopLevel}
                    index={currentIndex}
                    totalInLevel={members.length}
                    isVisible={isVisible}
                  />
                );
              })}
            </div>

            {/* Connector lines between levels */}
            {nextLevel !== undefined && (
              <div className="relative h-[clamp(2.5rem,3vw,3rem)] md:h-[clamp(3.5rem,4vw,4rem)] -mt-[clamp(1.25rem,1.8vw,1.6rem)] md:-mt-[clamp(1.75rem,2.2vw,2rem)]">
                <ConnectorLines
                  fromLevel={level}
                  toLevel={nextLevel}
                  fromMembers={members}
                  toMembers={nextLevelMembers}
                  containerRef={containerRef}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
