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
  const avatarSize = isTopLevel ? "h-20 w-20 md:h-24 md:w-24" : "h-16 w-16 md:h-20 md:w-20";
  const textSize = isTopLevel ? "text-base md:text-lg" : "text-sm md:text-base";
  
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
          <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-lg font-semibold md:text-xl">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        {member.linkedInUrl && (
          <a
            href={member.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary/90 text-primary-foreground transition-all hover:bg-primary hover:scale-110 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`LinkedIn profil ${member.name}`}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Name and Role */}
      <div className="mt-3 text-center space-y-1">
        <p className={cn("font-semibold text-foreground", textSize)}>{member.name}</p>
        <p className="text-xs md:text-sm text-muted-foreground">{member.role}</p>
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
        "relative space-y-12 md:space-y-16 py-4",
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
              "flex flex-wrap items-start justify-center gap-6 md:gap-8 lg:gap-12",
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
              <div className="relative h-12 md:h-16 -mt-6 md:-mt-8">
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
