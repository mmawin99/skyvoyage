import "@/styles/globals.css";
import SEO from "@/lib/seo";
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import LoadingApp from '@/components/loading'
import { BackendProvider } from '@/components/backend-url-provider';
import { DefaultSeo } from "next-seo";
// import { Elements } from '@stripe/react-stripe-js';
// import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Toaster } from "@/components/ui/sonner";

export default function App({ Component, pageProps }: AppProps) {
    // Add a state to track if we're on the client
    const [isClient, setIsClient] = useState(false);
    // const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

    // useEffect(() => {
    //   const initializeStripe = async () => {
    //     console.log("Publishable Key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    //     const stripe = await loadStripe(
    //       process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
    //     );
    //     setStripePromise(Promise.resolve(stripe));
    //   };
  
    //   initializeStripe();
    // }, []);
    // Use effect runs only on the client after the component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // If not on client yet, return a minimal placeholder or null
    // This prevents the server from trying to render client-only hooks
    if (!isClient) {
        return (
            <main className="font-noto">
                <DefaultSeo {...SEO} />
                <LoadingApp />
            </main>
        )
    }

    // Only render the full app when on the client
    return ( 
        // stripePromise && (
        //     <Elements stripe={stripePromise}>
                <SessionProvider session={pageProps.session} refetchInterval={0}>
                    <DefaultSeo {...SEO} />
                    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                        <BackendProvider>
                            <main className={`font-noto`}>
                                <Toaster />
                                <Component {...pageProps} />
                            </main>
                        </BackendProvider>
                    </ThemeProvider>
                </SessionProvider>
            // </Elements>
        // )
    );
}