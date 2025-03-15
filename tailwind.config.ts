import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import defaultTheme from "tailwindcss/defaultTheme";
const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	screens: {
		"xxs":            "375px",
		"xs":             "576px",
		'sm':             '640px',
		'md':             '768px',
		"medium_large":   "960px",
		'lg':             '1024px',
		'large_extra':    '1120px',
		'xl':             '1280px',
		'xl_extra':       '1340px',
		"2xl":            "1536px",
    'xxs-dpr-2': {            'raw': '(min-width: 375px)  and (min-resolution: 2dppx), (min-width: 375px)  and (-webkit-min-device-pixel-ratio: 2)',},
    'xs-dpr-2': {             'raw': '(min-width: 576px)  and (min-resolution: 2dppx), (min-width: 576px)  and (-webkit-min-device-pixel-ratio: 2)',},
    'sm-dpr-2': {             'raw': '(min-width: 640px)  and (min-resolution: 2dppx), (min-width: 640px)  and (-webkit-min-device-pixel-ratio: 2)',},
    'md-dpr-2': {             'raw': '(min-width: 768px)  and (min-resolution: 2dppx), (min-width: 768px)  and (-webkit-min-device-pixel-ratio: 2)',},
    'medium_large-dpr-2': {   'raw': '(min-width: 960px)  and (min-resolution: 2dppx), (min-width: 960px)  and (-webkit-min-device-pixel-ratio: 2)',},
    'lg-dpr-2': {             'raw': '(min-width: 1024px) and (min-resolution: 2dppx), (min-width: 1024px) and (-webkit-min-device-pixel-ratio: 2)',},
    'large_extra-dpr-2': {    'raw': '(min-width: 1120px) and (min-resolution: 2dppx), (min-width: 1120px) and (-webkit-min-device-pixel-ratio: 2)',},
    'xl-dpr-2': {             'raw': '(min-width: 1280px) and (min-resolution: 2dppx), (min-width: 1280px) and (-webkit-min-device-pixel-ratio: 2)',},
    'xl_extra-dpr-2': {       'raw': '(min-width: 1340px) and (min-resolution: 2dppx), (min-width: 1340px) and (-webkit-min-device-pixel-ratio: 2)',},
    '2xl-dpr-2': {            'raw': '(min-width: 1536px) and (min-resolution: 2dppx), (min-width: 1536px) and (-webkit-min-device-pixel-ratio: 2)',},
    
    'xxs-dpr-3': {            'raw': '(min-width: 375px)  and (min-resolution: 3dppx), (min-width: 576px)  and (-webkit-min-device-pixel-ratio: 3)',},
    'xs-dpr-3': {             'raw': '(min-width: 576px)  and (min-resolution: 3dppx), (min-width: 576px)  and (-webkit-min-device-pixel-ratio: 3)',},
    'sm-dpr-3': {             'raw': '(min-width: 640px)  and (min-resolution: 3dppx), (min-width: 640px)  and (-webkit-min-device-pixel-ratio: 3)',},
    'md-dpr-3': {             'raw': '(min-width: 768px)  and (min-resolution: 3dppx), (min-width: 768px)  and (-webkit-min-device-pixel-ratio: 3)',},
    'medium_large-dpr-3': {   'raw': '(min-width: 960px)  and (min-resolution: 3dppx), (min-width: 960px)  and (-webkit-min-device-pixel-ratio: 3)',},
    'lg-dpr-3': {             'raw': '(min-width: 1024px) and (min-resolution: 3dppx), (min-width: 1024px) and (-webkit-min-device-pixel-ratio: 3)',},
    'large_extra-dpr-3': {    'raw': '(min-width: 1120px) and (min-resolution: 3dppx), (min-width: 1120px) and (-webkit-min-device-pixel-ratio: 3)',},
    'xl-dpr-3': {             'raw': '(min-width: 1280px) and (min-resolution: 3dppx), (min-width: 1280px) and (-webkit-min-device-pixel-ratio: 3)',},
    'xl_extra-dpr-3': {       'raw': '(min-width: 1340px) and (min-resolution: 3dppx), (min-width: 1340px) and (-webkit-min-device-pixel-ratio: 3)',},
    '2xl-dpr-3': {            'raw': '(min-width: 1536px) and (min-resolution: 3dppx), (min-width: 1536px) and (-webkit-min-device-pixel-ratio: 3)',},
	},
    extend: {
	  fontFamily: {
		// sans: ["Inter", "sans-serif"],
		sanFrancisco: ["var(--font-SFProTH)","var(--font-SFProText)", "Roboto", ...defaultTheme.fontFamily.sans],
	  },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
  plugins: [tailwindcssAnimate],
};

export default config;
