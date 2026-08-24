import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        sharp: "2px",
      },
      colors: {
        // BJR marketing-page tokens (landing only) — additive, do not
        // replace the semantic tokens above used by the internal CRM app.
        oleo: "var(--oleo)",
        concreto: "var(--concreto)",
        bjr: "var(--bjr)",
        ambar: "var(--ambar)",
        aco: {
          DEFAULT: "var(--aco)",
          claro: "var(--aco-claro)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        "unit-sp1": "var(--sp1-color)",
        "unit-sp2": "var(--sp2-color)",
        "unit-sor": "var(--sor-color)",
        "unit-global": "var(--global-color)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        // BJR marketing-page type roles
        display: ["'Archivo'", "sans-serif"],
        "display-expanded": ["'Archivo Expanded'", "'Archivo'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        data: ["'IBM Plex Mono'", "monospace"],
      },
      fontSize: {
        // BJR marketing-page type scale — named, additive to Tailwind's
        // default scale (base 16px, irregular ratio on purpose).
        legenda: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.04em" }],
        nota: ["0.875rem", { lineHeight: "1.5" }],
        corpo: ["1rem", { lineHeight: "1.6" }],
        "corpo-lg": ["1.125rem", { lineHeight: "1.6" }],
        rotulo: ["1.375rem", { lineHeight: "1.3" }],
        subtitulo: ["1.75rem", { lineHeight: "1.25" }],
        titulo: ["2.25rem", { lineHeight: "1.15" }],
        "titulo-lg": ["3rem", { lineHeight: "1.05" }],
        display: ["clamp(2.5rem, 1.5rem + 4.5vw, 5.5rem)", { lineHeight: "1" }],
        dado: ["0.8125rem", { lineHeight: "1.4" }],
        "dado-lg": ["1.125rem", { lineHeight: "1.3" }],
        "dado-xl": ["2.5rem", { lineHeight: "1" }],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
