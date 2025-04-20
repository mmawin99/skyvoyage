import { BackendProvider } from "@/components/backend-url-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";



export default function App({ Component, pageProps }: AppProps) {
    return (
        <SessionProvider session={pageProps.session} refetchInterval={0}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <BackendProvider>
                    <main className={`font-noto`}>
                        <Component {...pageProps} />
                    </main>
                </BackendProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
