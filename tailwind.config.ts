import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const fluidSpacing = {
  "section-sm": "clamp(1.47rem, 1.68vw + 1.05rem, 2.1rem)",
  "section-md": "clamp(2.1rem, 2.52vw + 1.26rem, 2.94rem)",
  "section-lg": "clamp(2.73rem, 3.36vw + 1.47rem, 3.78rem)",
  "stack-2xs": "clamp(0.21rem, 0.504vw + 0.042rem, 0.378rem)",
  "stack-xs": "clamp(0.294rem, 0.63vw + 0.084rem, 0.504rem)",
  "stack-sm": "clamp(0.504rem, 0.84vw + 0.168rem, 0.84rem)",
  "stack-md": "clamp(0.756rem, 1.092vw + 0.294rem, 1.26rem)",
  "stack-lg": "clamp(1.05rem, 1.344vw + 0.42rem, 1.68rem)",
  "stack-xl": "clamp(1.47rem, 1.848vw + 0.504rem, 2.31rem)",
};

const fluidFontSizes = {
  "fluid-h1": [
    "clamp(1.89rem, 3.36vw + 0.84rem, 2.94rem)",
    { lineHeight: "clamp(2.31rem, 3.36vw + 1.26rem, 3.15rem)", letterSpacing: "-0.02em" },
  ],
  "fluid-h2": [
    "clamp(1.47rem, 2.52vw + 0.756rem, 2.31rem)",
    { lineHeight: "clamp(1.89rem, 2.52vw + 1.176rem, 2.73rem)", letterSpacing: "-0.015em" },
  ],
  "fluid-lead": ["clamp(0.84rem, 1.512vw + 0.42rem, 1.05rem)", { lineHeight: "1.65" }],
  "fluid-copy": ["clamp(0.819rem, 0.378vw + 0.714rem, 0.924rem)", { lineHeight: "1.7" }],
  "fluid-caption": ["clamp(0.588rem, 0.2352vw + 0.504rem, 0.688rem)", { lineHeight: "1.45" }],
  "fluid-eyebrow": [
    "clamp(0.571rem, 0.294vw + 0.487rem, 0.655rem)",
    { letterSpacing: "clamp(0.151em, 0.050em + 0.185vw, 0.252em)", textTransform: "uppercase" },
  ],
};

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        lg: "1.5rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        none: "0",
        sm: "calc(var(--radius) - 6px)",
        md: "calc(var(--radius) - 4px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
        full: "9999px",
      },
      boxShadow: {
        glass: "0 20px 45px -25px hsl(var(--shadow-soft) / 0.4), inset 0 0 0.5px hsl(var(--border) / 0.4)",
        soft: "0 28px 60px -40px hsl(var(--shadow-soft) / 0.32), 0 12px 32px -32px hsl(var(--shadow-soft) / 0.24)",
        premium: "0 32px 70px -38px hsl(var(--shadow-strong) / 0.38), 0 14px 34px -30px hsl(var(--shadow-soft) / 0.28)",
        "premium-lg": "0 42px 90px -32px hsl(var(--shadow-strong) / 0.42), 0 20px 46px -24px hsl(var(--shadow-soft) / 0.34)",
      },
      spacing: {
        ...Object.fromEntries(
          Object.entries(fluidSpacing).map(([key, value]) => [
            `fluid-${key}`,
            value,
          ]),
        ),
      },
      fontSize: {
        ...fluidFontSizes,
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
