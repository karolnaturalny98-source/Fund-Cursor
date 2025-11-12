"use client";

import dynamic from "next/dynamic";

const Aurora = dynamic(() => import("./Aurora"), { ssr: false });

interface AuroraWrapperProps {
  colorStops: string[];
  blend?: number;
  amplitude?: number;
  speed?: number;
}

export function AuroraWrapper(props: AuroraWrapperProps) {
  return <Aurora {...props} />;
}

