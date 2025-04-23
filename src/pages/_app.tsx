import "@/styles/globals.css";

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import LoadingApp from '@/components/loading'
import { BackendProvider } from '@/components/backend-url-provider';

export default function App({ Component, pageProps }: AppProps) {
    // Add a state to track if we're on the client
    const [isClient, setIsClient] = useState(false);

    // Use effect runs only on the client after the component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // If not on client yet, return a minimal placeholder or null
    // This prevents the server from trying to render client-only hooks
    if (!isClient) {
        return (
            <main className="font-noto">
                <LoadingApp />
            </main>
        )
    }

    // Only render the full app when on the client
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