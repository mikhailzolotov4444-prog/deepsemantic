import { IBM_Plex_Mono, Playfair_Display_SC, Poiret_One, Raleway } from "next/font/google";

/*
 * Fonts are downloaded at build time and served from our own domain: visitors' browsers never
 * talk to Google. All four have Cyrillic. The CSS variables are wired to Tailwind in globals.css.
 */
const display = Playfair_Display_SC({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--ff-display",
  display: "swap",
});

const body = Raleway({
  subsets: ["latin", "cyrillic"],
  variable: "--ff-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--ff-mono",
  display: "swap",
});

const accent = Poiret_One({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--ff-accent",
  display: "swap",
});

/** Put this on <html> so every page (public site and admin) gets the same fonts. */
export const fontVariables = [display, body, mono, accent].map((font) => font.variable).join(" ");
