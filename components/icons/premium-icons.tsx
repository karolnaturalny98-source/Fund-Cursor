import * as React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export function TradingChartIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="tradingChartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(152 75% 44%)" />
          <stop offset="100%" stopColor="hsl(155 69% 38%)" />
        </linearGradient>
      </defs>
      <path
        d="M3 18L9 12L13 16L21 8"
        stroke="url(#tradingChartGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 8H15L13 10L9 6L3 12"
        stroke="url(#tradingChartGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function PremiumBadgeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="premiumBadgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(152 75% 44%)" />
          <stop offset="50%" stopColor="hsl(155 69% 38%)" />
          <stop offset="100%" stopColor="hsl(152 75% 44%)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="url(#premiumBadgeGradient)"
        stroke="url(#premiumBadgeGradient)"
        strokeWidth="1"
      />
    </svg>
  );
}

export function CashbackIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cashbackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(152 75% 44%)" />
          <stop offset="100%" stopColor="hsl(155 69% 38%)" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="url(#cashbackGradient)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 6V18M8 10H16M8 14H16"
        stroke="url(#cashbackGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 8C13.1046 8 14 8.89543 14 10C14 11.1046 13.1046 12 12 12M12 16C10.8954 16 10 15.1046 10 14C10 12.8954 10.8954 12 12 12"
        stroke="url(#cashbackGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function RankingTrophyIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(152 75% 44%)" />
          <stop offset="100%" stopColor="hsl(155 69% 38%)" />
        </linearGradient>
      </defs>
      <path
        d="M6 9H4C3.44772 9 3 9.44772 3 10V12C3 15.866 6.13401 19 10 19C13.866 19 17 15.866 17 12V10C17 9.44772 16.5523 9 16 9H14"
        stroke="url(#trophyGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M6 9V7C6 5.34315 7.34315 4 9 4H15C16.6569 4 18 5.34315 18 7V9"
        stroke="url(#trophyGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10 19V21H14V19"
        stroke="url(#trophyGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12 15V19"
        stroke="url(#trophyGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx="12"
        cy="11"
        r="2"
        fill="url(#trophyGradient)"
        opacity="0.3"
      />
    </svg>
  );
}

export function FundingIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="fundingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(152 75% 44%)" />
          <stop offset="100%" stopColor="hsl(155 69% 38%)" />
        </linearGradient>
      </defs>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="url(#fundingGradient)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M3 10H21M8 14H16"
        stroke="url(#fundingGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="10"
        r="1.5"
        fill="url(#fundingGradient)"
      />
    </svg>
  );
}

