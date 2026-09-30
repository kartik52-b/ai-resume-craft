import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Source Serif 4', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      /*
       * Radii stay small on purpose — this is a document tool, not a consumer
       * app: sm 6px (badges) · md 7px (fields) · lg/DEFAULT 8px (buttons) ·
       * xl 12px (cards, dialogs). Nothing is ever pill-shaped.
       */
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius-field)',
        lg: 'var(--radius)',
        xl: 'var(--radius-lg)',
        '2xl': '1rem',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        /* Brand accent — antique bronze, used sparingly. */
        bronze: {
          DEFAULT: 'hsl(var(--bronze))',
          hover: 'hsl(var(--bronze-hover))',
          foreground: 'hsl(var(--bronze-foreground))',
          soft: 'hsl(var(--bronze-soft))',
        },
        /* Secondary accents, for signals only (assistance ready, validation). */
        teal: {
          DEFAULT: 'hsl(var(--teal))',
          foreground: 'hsl(var(--teal-foreground))',
        },
        coral: {
          DEFAULT: 'hsl(var(--coral))',
          foreground: 'hsl(var(--coral-foreground))',
        },
        'border-strong': 'hsl(var(--border-strong))',
        /* The A4 document surface. */
        paper: 'hsl(var(--paper))',
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        workspace: 'hsl(var(--workspace))',
        canvas: 'hsl(var(--canvas))',
        'surface-raised': 'hsl(var(--surface-raised))',
        success: { DEFAULT: 'hsl(var(--success))', foreground: 'hsl(var(--success-foreground))' },
        warning: { DEFAULT: 'hsl(var(--warning))', foreground: 'hsl(var(--warning-foreground))' },
        info: { DEFAULT: 'hsl(var(--info))', foreground: 'hsl(var(--info-foreground))' },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'card': 'var(--shadow-sm)',
        'card-hover': 'var(--shadow-md)',
        'raised': 'var(--shadow-md)',
        'elevated': 'var(--shadow-lg)',
        'modal': 'var(--shadow-xl)',
        'canvas': 'var(--canvas-shadow)',
        'inset-field': 'var(--shadow-inset)',
      },
      /**
       * Motion lives in `src/index.css` (outside `@layer utilities`) so the whole
       * keyframe library always ships instead of being tree-shaken on usage.
       */
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
