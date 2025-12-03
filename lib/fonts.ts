import {
  Inter,
  Roboto,
  Poppins,
  Montserrat,
  Lato,
  Open_Sans,
  Raleway,
  Nunito,
} from "next/font/google";
import { type FontFamily as FontFamilyType } from "@/stores/settings-store";

// Re-export FontFamily type
export type FontFamily = FontFamilyType;

// Configure fonts
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
  display: "swap",
});

export const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

// Font mapping
export const FONT_MAP = {
  inter: inter,
  roboto: roboto,
  poppins: poppins,
  montserrat: montserrat,
  lato: lato,
  opensans: openSans,
  raleway: raleway,
  nunito: nunito,
} as const;

// Font display names
export const FONT_NAMES: Record<FontFamilyType, string> = {
  inter: "Inter",
  roboto: "Roboto",
  poppins: "Poppins",
  montserrat: "Montserrat",
  lato: "Lato",
  opensans: "Open Sans",
  raleway: "Raleway",
  nunito: "Nunito",
};

// Get font class name
export function getFontClassName(fontFamily: FontFamilyType): string {
  return FONT_MAP[fontFamily].className;
}
