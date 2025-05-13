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

    {/* Special Offers */}
    <div className="container mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Special Offers</h2>
        <Button variant="ghost" className="flex items-center">
          View all offers <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow pt-0">
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div
              className="h-full bg-cover bg-center"
              style={{ backgroundImage: "url('/earlybird.jpg')" }}
            />
            <Badge className="absolute top-3 left-3 z-20 bg-blue-600">Limited Time</Badge>
          </div>
          <CardContent className="p-5">
            <h3 className="text-xl font-bold mb-2">Early Bird Summer Sale</h3>
            <p className="text-gray-600 mb-4">Book now and save up to 25% on summer flights to Europe</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="mr-1 h-4 w-4" /> Ends in 5 days
              </span>
              <Button size="sm">View Deal</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-shadow pt-0">
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div
              className="h-full bg-cover bg-center"
              style={{ backgroundImage: "url('/family.jpg')" }}
            />
            <Badge className="absolute top-3 left-3 z-20 bg-green-600">Family Deal</Badge>
          </div>
          <CardContent className="p-5">
            <h3 className="text-xl font-bold mb-2">Family Vacation Package</h3>
            <p className="text-gray-600 mb-4">
              Kids fly free on select international routes when booking 2+ adult tickets
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="mr-1 h-4 w-4" /> Ends in 12 days
              </span>
              <Button size="sm">View Deal</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-shadow pt-0">
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div
              className="h-full bg-cover bg-center"
              style={{ backgroundImage: "url('/business.jpg')" }}
            />
            <Badge className="absolute top-3 left-3 z-20 bg-purple-600">Business Class</Badge>
          </div>
          <CardContent className="p-5">
            <h3 className="text-xl font-bold mb-2">Business Class Upgrade</h3>
            <p className="text-gray-600 mb-4">Upgrade to Business Class for just $299 on long-haul flights</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="mr-1 h-4 w-4" /> Ends in 3 days
              </span>
              <Button size="sm">View Deal</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Popular Destinations */}
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Popular Destinations</h2>
          <Button variant="ghost" className="flex items-center">
            Explore all destinations <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative rounded-xl overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10" />
            <div
              className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: "url('/jfk.jpg')" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="text-xl font-bold text-white">New York</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/90 text-sm">Flights from $299</span>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  <TrendingUp className="mr-1 h-3 w-3" /> Popular
                </Badge>
              </div>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10" />
            <div
              className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: "url('/lhr.jpg')" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="text-xl font-bold text-white">London</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/90 text-sm">Flights from $449</span>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  <TrendingUp className="mr-1 h-3 w-3" /> Popular
                </Badge>
              </div>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10" />
            <div
              className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: "url('/hnd.jpg')" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="text-xl font-bold text-white">Tokyo</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/90 text-sm">Flights from $799</span>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  <TrendingUp className="mr-1 h-3 w-3" /> Popular
                </Badge>
              </div>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10" />
            <div
              className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: "url('/cdg.jpg')" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="text-xl font-bold text-white">Paris</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/90 text-sm">Flights from $399</span>
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  <TrendingUp className="mr-1 h-3 w-3" /> Popular
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AppFooter />
  </main>
  );
}
