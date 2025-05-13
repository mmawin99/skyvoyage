/* eslint-disable @typescript-eslint/no-unused-vars */
import { BackendURLType, useBackendURL } from "@/components/backend-url-provider";
import { FlightSearchPanel } from "@/components/flightSearchPanel";
import { AppFooter } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon, Clock, Globe, Shield, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
export default function Home() {
  const { backend, setBackend, status }: BackendURLType = useBackendURL();
  if(status === 'loading') return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if(status === 'error') return <div className="flex justify-center items-center h-screen">Error loading backend URL</div>;
  return (
    <main className="min-h-screen bg-white">
    <Navbar />
    {/* <TawkWidget /> */}
    {/* Hero Section with Carousel and Overlapping Panel */}
    <div className="relative">
      <section className="w-full relative">
          <Carousel opts={{loop: true}} plugins={[  Autoplay({delay: 5000}) ]} className="w-full h-[30vh] sm:h-[40vh] md:h-[50vh] lg:h-[60vh]">
              <CarouselContent className="h-[30vh] sm:h-[40vh] md:h-[50vh] lg:h-[60vh]">
                <CarouselItem>
                    <div className="relative w-full h-full">
                        <Image
                            src={"./carousel_1.jpeg"}
                            width={1920}
                            height={1080}
                            unoptimized
                            placeholder='empty'
                            alt={"Explore the world"}
                            className="w-full h-full object-cover rounded-b-4xl" />
                        <div className="rounded-b-4xl absolute inset-0 bg-gradient-to-t from-gray-700 via-gray-600/90 via-30% to-transparent p-8 md:p-12 lg:p-16">
                            <div className={`flex flex-col h-full justify-end md:pb-10 -translate-y-20 lg:-translate-y-20 xl:-translate-y-32 text-white`}>
                                <div className={`text-3xl lg:text-7xl font-semibold mb-5`}>Explore the world</div>
                                <div className={`text-xl lg:text-3xl font-medium`}> Discover new destinations, enjoy seamless travel experiences!</div>
                            </div>
                        </div>
                    </div>
                </CarouselItem>
                <CarouselItem>
                    <div className="relative w-full h-full">
                        <Image
                            src={"./8338.jpg"}
                            width={1920}
                            height={1080}
                            unoptimized
                            placeholder='empty'
                            alt={"Explore the world"}
                            className="w-full h-full object-cover rounded-b-4xl" />
                        <div className="rounded-b-4xl absolute inset-0 bg-gradient-to-t from-gray-700 via-gray-600/90 via-30% to-transparent p-8 md:p-12 lg:p-16">
                            <div className={`flex flex-col h-full justify-end md:pb-10 -translate-y-20 lg:-translate-y-20 xl:-translate-y-32 text-white`}>
                                <div className={`text-3xl lg:text-7xl font-semibold mb-5`}>Enjoy wonderful journey</div>
                                <div className={`text-xl lg:text-3xl font-medium`}> Discover new destinations!</div>
                            </div>
                        </div>
                    </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex md:absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <ChevronLeftIcon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
              </CarouselPrevious>
              <CarouselNext className="hidden md:flex md:absolute right-4 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRightIcon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
              </CarouselNext>
          </Carousel>
      </section>
      {/* Overlapping Flight Search Panel */}
      <div className="relative z-30 container mx-auto px-4 -mt-14 md:-mt-32">
        <FlightSearchPanel />
      </div>
    </div>

    {/* Spacer for overlapping panel */}
    <div className="h-12 bg-white"></div>

    <AppFooter />
  </main>
  );
}
