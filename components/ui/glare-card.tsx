"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

export const GlareCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const isPointerInside = useRef(false);
  const refElement = useRef<HTMLDivElement>(null);
  const state = useRef({
    glare: {
      x: 50,
      y: 50,
    },
    background: {
      x: 50,
      y: 50,
    },
    rotate: {
      x: 0,
      y: 0,
    },
  });
  const containerStyle = {
    "--m-x": "50%",
    "--m-y": "50%",
    "--r-x": "0deg",
    "--r-y": "0deg",
    "--bg-x": "50%",
    "--bg-y": "50%",
    "--duration": "300ms",
    "--foil-size": "140%",
    "--opacity": "0",
    "--radius": "32px",
    "--easing": "ease",
    "--transition": "var(--duration) var(--easing)",
  } as React.CSSProperties;

  const backgroundStyle = {
    "--step": "5%",
    "--pattern": "none",
    "--rainbow":
      "repeating-linear-gradient(0deg,rgba(0,0,0,1) 0%,rgba(10,10,10,1) 20%,rgba(0,0,0,1) 40%) 0% var(--bg-y)/200% 400% no-repeat",
    "--diagonal":
      "repeating-linear-gradient(135deg,rgba(0,0,0,1) 0%,rgba(8,8,8,1) 4%,rgba(0,0,0,1) 8%) var(--bg-x) var(--bg-y)/320% no-repeat",
    "--shade":
      "radial-gradient(farthest-corner circle at var(--m-x) var(--m-y),rgba(255,255,255,0.05) 3%,rgba(0,0,0,0.95) 80%) var(--bg-x) var(--bg-y)/320% no-repeat",
    backgroundBlendMode: "normal",
  };

  const updateStyles = () => {
    if (!refElement.current) {
      return;
    }
    const { background, rotate, glare } = state.current;
    refElement.current.style.setProperty("--m-x", `${glare.x}%`);
    refElement.current.style.setProperty("--m-y", `${glare.y}%`);
    refElement.current.style.setProperty("--r-x", `${rotate.x}deg`);
    refElement.current.style.setProperty("--r-y", `${rotate.y}deg`);
    refElement.current.style.setProperty("--bg-x", `${background.x}%`);
    refElement.current.style.setProperty("--bg-y", `${background.y}%`);
  };

  return (
    <div
      style={containerStyle}
      className="relative isolate w-full [contain:layout_style] [perspective:800px]"
      ref={refElement}
      onPointerMove={(event) => {
        const rotateFactor = 0.4;
        const rect = event.currentTarget.getBoundingClientRect();
        const position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const percentage = {
          x: (100 / rect.width) * position.x,
          y: (100 / rect.height) * position.y,
        };
        const delta = {
          x: percentage.x - 50,
          y: percentage.y - 50,
        };

        const { background, rotate, glare } = state.current;
        background.x = 50 + percentage.x / 4 - 12.5;
        background.y = 50 + percentage.y / 3 - 16.67;
        rotate.x = -(delta.x / 3.5);
        rotate.y = delta.y / 2;
        rotate.x *= rotateFactor;
        rotate.y *= rotateFactor;
        glare.x = percentage.x;
        glare.y = percentage.y;

        updateStyles();
      }}
      onPointerEnter={() => {
        isPointerInside.current = true;
        if (refElement.current) {
          setTimeout(() => {
            if (isPointerInside.current) {
              refElement.current?.style.setProperty("--duration", "0s");
            }
          }, 300);
        }
      }}
      onPointerLeave={() => {
        isPointerInside.current = false;
        if (refElement.current) {
          refElement.current.style.removeProperty("--duration");
          refElement.current?.style.setProperty("--r-x", `0deg`);
          refElement.current?.style.setProperty("--r-y", `0deg`);
        }
      }}
    >
      <div className="grid h-full w-full origin-center overflow-hidden rounded-[var(--radius)] border border-white/20 [grid-area:1/1] [transform:rotateY(var(--r-x))_rotateX(var(--r-y))] transition-transform duration-[var(--duration)] ease-[var(--easing)] hover:[--opacity:0.35] hover:[--duration:180ms] hover:[--easing:linear]">
        <div className="grid h-full w-full [grid-area:1/1] [clip-path:inset(0_0_0_0_round_var(--radius))] pointer-events-auto">
          <div className={cn("h-full w-full bg-black", className)}>{children}</div>
        </div>
        <div className="pointer-events-none grid h-full w-full opacity-[var(--opacity)] [clip-path:inset(0_0_1px_0_round_var(--radius))] [grid-area:1/1] [background:radial-gradient(farthest-corner_circle_at_var(--m-x)_var(--m-y),_rgba(255,255,255,0.45)_10%,_rgba(0,0,0,0)_90%)] transition-[opacity,background] duration-[var(--duration)] ease-[var(--easing)]" />
        <div
          className="pointer-events-none relative grid h-full w-full opacity-[var(--opacity)] [background:var(--pattern),_var(--rainbow),_var(--diagonal),_var(--shade)] [background-blend-mode:normal] [clip-path:inset(0_0_1px_0_round_var(--radius))] [grid-area:1/1] transition-[opacity,background] duration-[var(--duration)] ease-[var(--easing)]"
          style={backgroundStyle}
        />
      </div>
    </div>
  );
};
