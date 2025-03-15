import { ThemeProvider } from "@/providers/theme";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";
//${sfProTH.variable} ${sfProDisplaySemiBold.variable} ${sfProDisplayBold.variable} ${sfProDisplayRegular.variable} ${sfProTextThin.variable} ${sfProTextSemiBold.variable} ${sfProTextBold.variable} ${sfProTextRegular.variable} ${sfProIconsBold.variable} ${sfProIconsRegular.variable}
const sfProTH = localFont({
  src: [
    {
      path: "./fonts/SFProTH.woff2",
      weight: "1 1000",
      style: "normal",
    },
  ],
  variable: "--font-SFProTH",
});

const sfProText = localFont({
  src: [
    { path: "./../font/SFProText-Ultralight.woff2", weight: "100", style: "normal" },
    { path: "./../font/SFProText-UltralightItalic.woff2", weight: "100", style: "italic" },
    { path: "./../font/SFProText-Thin.woff2", weight: "200", style: "normal" },
    { path: "./../font/SFProText-ThinItalic.woff2", weight: "200", style: "italic" },
    { path: "./../font/SFProText-Light.woff2", weight: "300", style: "normal" },
    { path: "./../font/SFProText-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "./../font/SFProText-Regular.woff2", weight: "400", style: "normal" },
    { path: "./../font/SFProText-RegularItalic.woff2", weight: "400", style: "italic" },
    { path: "./../font/SFProText-Medium.woff2", weight: "500", style: "normal" },
    { path: "./../font/SFProText-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "./../font/SFProText-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./../font/SFProText-SemiboldItalic.woff2", weight: "600", style: "italic" },
    { path: "./../font/SFProText-Bold.woff2", weight: "700", style: "normal" },
    { path: "./../font/SFProText-BoldItalic.woff2", weight: "700", style: "italic" },
    { path: "./../font/SFProText-Heavy.woff2", weight: "800", style: "normal" },
    { path: "./../font/SFProText-HeavyItalic.woff2", weight: "800", style: "italic" },
    { path: "./../font/SFProText-Black.woff2", weight: "900", style: "normal" },
    { path: "./../font/SFProText-BlackItalic.woff2", weight: "900", style: "italic" },
  ],
  variable: "--font-SFProText",
});



export default function App({ Component, pageProps }: AppProps) {
  return <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <main className={`${sfProTH.variable} ${sfProText.variable} font-sanFrancisco`}>
          <Component {...pageProps} />
      </main>
</ThemeProvider>
}
