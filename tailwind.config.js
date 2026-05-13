/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2D5A27",
        "primary-container": "#A9DFBF",
        "on-primary-container": "#002107",
        "on-primary-fixed": "#002107",
        "on-primary-fixed-variant": "#2D5A27",
        "primary-fixed-dim": "#A9DFBF",
        "primary-fixed": "#C7E8D1",
        "on-primary": "#FFFFFF",
        "inverse-primary": "#FFB4A9",

        "secondary": "#3E6341",
        "secondary-container": "#C0E9C0",
        "on-secondary-container": "#002108",
        "secondary-fixed-dim": "#A4CDB0",
        "secondary-fixed": "#BFE9CC",
        "on-secondary-fixed": "#002108",
        "on-secondary-fixed-variant": "#274E2D",
        "on-secondary": "#FFFFFF",

        "tertiary": "#1C1C19",
        "tertiary-container": "#474746",
        "on-tertiary-container": "#F7F4F3",
        "tertiary-fixed": "#E5E2E1",
        "tertiary-fixed-dim": "#C8C6C5",
        "on-tertiary-fixed": "#1C1B1B",
        "on-tertiary-fixed-variant": "#474746",
        "on-tertiary": "#FFFFFF",

        "surface": "#F8F6F6",
        "surface-bright": "#FCF9F4",
        "surface-dim": "#E5E2DD",
        "surface-container": "#F0EDE8",
        "surface-container-low": "rgba(255, 218, 213, 0.15)",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-highest": "#E5E2DD",
        "surface-container-high": "#EBE8E3",
        "surface-variant": "#E5E2DD",
        "on-surface": "#1C1C19",
        "on-surface-variant": "#5B403D",
        "surface-tint": "#D32F2F",

        "inverse-surface": "#31302D",
        "inverse-on-surface": "#F3F0EB",
        
        "background": "#F8F6F6",
        "on-background": "#1C1C19",
        
        "error": "#BA1A1A",
        "error-container": "#FFDAD6",
        "on-error": "#FFFFFF",
        "on-error-container": "#93000A",

        "outline": "#8F6F6C",
        "outline-variant": "#E4BEBA",

        "background-light": "#f8f6f6",
        "background-dark": "#201212",
        "surface-dim-alpha": "rgba(0, 0, 0, 0.4)", // renamed to avoid conflict with surface-dim hex color
      },
      fontFamily: {
        "display": ["Newsreader", "serif"],
        "headline": ["Newsreader", "serif"],
        "body": ["Work Sans", "sans-serif"],
        "label": ["Work Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem", 
        "lg": "0.25rem", 
        "xl": "0.5rem", 
        "full": "9999px" // changed from 0.75rem to match standard, but wait in HTML it says 9999px in main and 0.75rem in focus/awards.
      },
      transitionProperty: {
        'width': 'width, flex',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
