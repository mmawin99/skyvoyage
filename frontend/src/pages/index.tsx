/* eslint-disable @typescript-eslint/no-unused-vars */
import { FlightSearchPanel } from "@/components/flightSearchPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon, Clock, FacebookIcon, Globe, LinkedinIcon, LucidePlane, Shield, Star, TrendingUp } from "lucide-react";
import { NextSeo } from "next-seo";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay"
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
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
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div
              className="h-full bg-cover bg-center"
              style={{ backgroundImage: "url('/placeholder.svg?height=400&width=600')" }}
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

        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div
              className="h-full bg-cover bg-center"
              style={{ backgroundImage: "url('/placeholder.svg?height=400&width=600')" }}
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

        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div
              className="h-full bg-cover bg-center"
              style={{ backgroundImage: "url('/placeholder.svg?height=400&width=600')" }}
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
              style={{ backgroundImage: "url('/placeholder.svg?height=500&width=400')" }}
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
              style={{ backgroundImage: "url('/placeholder.svg?height=500&width=400')" }}
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
              style={{ backgroundImage: "url('/placeholder.svg?height=500&width=400')" }}
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
              style={{ backgroundImage: "url('/placeholder.svg?height=500&width=400')" }}
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

    {/* Rest of the content remains the same */}
    <div className="container mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Fly With SkyWings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-blue-100 rounded-full p-4 inline-flex mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Safety First</h3>
          <p className="text-gray-600">
            Your safety is our top priority. Our fleet is regularly maintained to the highest standards, and our crew
            undergoes rigorous training.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-blue-100 rounded-full p-4 inline-flex mb-4">
            <Star className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Award-Winning Service</h3>
          <p className="text-gray-600">
            Experience our internationally recognized service, with personalized attention and comfort at every step
            of your journey.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-blue-100 rounded-full p-4 inline-flex mb-4">
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-3">Global Network</h3>
          <p className="text-gray-600">
            With flights to over 150 destinations worldwide and partnerships with leading airlines, we connect you to
            anywhere you want to go.
          </p>
        </div>
      </div>
    </div>

    {/* Testimonials */}
    <div className="bg-blue-900 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">What Our Passengers Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 mb-6">
                &ldquo;The best flying experience I&apos;ve ever had. The crew was attentive, the seats were comfortable, and the
                food was actually delicious!&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 mr-3 flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <p className="font-medium text-white">John Doe</p>
                  <p className="text-white/70 text-sm">New York to London</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 mb-6">
                &ldquo;I was impressed by how smooth the entire process was, from booking to landing. The in-flight
                entertainment options were excellent too!&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 mr-3 flex items-center justify-center text-white font-bold">
                  JS
                </div>
                <div>
                  <p className="font-medium text-white">Jane Smith</p>
                  <p className="text-white/70 text-sm">Paris to Tokyo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 mb-6">
                &ldquo;As a frequent business traveler, I appreciate the punctuality and efficiency of SkyWings. Their
                business class service is worth every penny.&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 mr-3 flex items-center justify-center text-white font-bold">
                  RJ
                </div>
                <div>
                  <p className="font-medium text-white">Robert Johnson</p>
                  <p className="text-white/70 text-sm">London to Singapore</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    {/* Download App */}
    <div className="container mx-auto py-16 px-4">
      <div className="bg-blue-50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Download Our Mobile App</h2>
          <p className="text-gray-600 mb-6">
            Get exclusive mobile-only deals, manage your bookings on the go, and receive real-time flight updates with
            our award-winning app.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-black text-white hover:bg-black/90">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5,2H8.5C8.2,2,8,2.2,8,2.5v19C8,21.8,8.2,22,8.5,22h9c0.3,0,0.5-0.2,0.5-0.5v-19C18,2.2,17.8,2,17.5,2z M13,20.5c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S13.8,20.5,13,20.5z M17,17H9V5h8V17z" />
              </svg>
              App Store
            </Button>
            <Button className="bg-black text-white hover:bg-black/90">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.5,20.5c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1v-17c0-0.6-0.4-1-1-1h-1c-0.6,0-1,0.4-1,1V20.5z M19.5,12L8,4.5v15L19.5,12z" />
              </svg>
              Google Play
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative w-64 h-96">
            <div className="absolute top-0 right-0 w-56 h-80 bg-blue-200 rounded-xl transform rotate-6"></div>
            <div className="absolute top-0 left-0 w-56 h-80 bg-blue-600 rounded-xl transform -rotate-6"></div>
            <div className="absolute inset-0 bg-white rounded-xl shadow-xl overflow-hidden">
              <div
                className="h-full bg-cover bg-center"
                style={{ backgroundImage: "url('/placeholder.svg?height=600&width=300')" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <footer className="bg-primary text-white pt-10 pb-6">
      <div className="container mx-auto px-6">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 text-sm text-gray-300">
          {/* Logo */}
          <div className="justify-center col-span-2 lg:col-span-1 flex items-center gap-10 lg:flex-col lg:items-start">
            <LucidePlane className="w-20 h-20" />
            <div className="text-4xl font-bold">SkyVoyage</div>
          </div>

          {/* Company
          <div>
            <h4 className="text-blue-400 font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-100">How it works</a></li>
              <li><a href="#" className="hover:text-blue-100">Newsletter</a></li>
              <li><a href="#" className="hover:text-blue-100">Careers</a></li>
              <li><a href="#" className="hover:text-blue-100">Investors</a></li>
              <li><a href="#" className="hover:text-blue-100">Blogs</a></li>
              <li><a href="#" className="hover:text-blue-100">Destinations</a></li>
            </ul>
          </div>

          Services 
          <div>
            <h4 className="text-blue-400 font-semibold mb-3">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-100">Airport Transfer</a></li>
              <li><a href="#" className="hover:text-blue-100">Limousine Service</a></li>
              <li><a href="#" className="hover:text-blue-100">Private Taxi</a></li>
              <li><a href="#" className="hover:text-blue-100">Chauffeur Service</a></li>
              <li><a href="#" className="hover:text-blue-100">City tour</a></li>
            </ul>
          </div> */}

          {/* About us */}
          <div>
            <h4 className="text-blue-400 font-semibold mb-3">About us</h4>
            <p>Created by SkyVoyage group</p>
            <p className="mt-2">1002, 1011, 1018, 1020, 1029</p>
            <p>&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;</p>
          </div>

          {/* Partnership */}
          <div>
            <h4 className="text-blue-400 font-semibold mb-3">Partnership</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-100">Business Solutions</a></li>
              <li><a href="#" className="hover:text-blue-100">Travel Agencies</a></li>
              <li><a href="#" className="hover:text-blue-100">Affiliate & Webmasters</a></li>
              <li><a href="#" className="hover:text-blue-100">Drive with Us</a></li>
              <li><a href="#" className="hover:text-blue-100">Become A Partner</a></li>
              <li><a href="#" className="hover:text-blue-100">Register as Guide</a></li>
            </ul>
          </div>

          {/* Legal + Help */}
          <div>
            <h4 className="text-blue-400 font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-100">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-100">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-blue-100">Cookie Policy</a></li>
            </ul>
            <h4 className="text-blue-400 font-semibold mt-4 mb-2">Help</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-100">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-100">Get Support</a></li>
              <li><a href="/admin" className="text-white font-semibold hover:text-blue-100">Admin Panel</a></li>
            </ul>
          </div>
          <div className="border-t-[1px] border-white pt-8 col-span-2 md:col-span-3 lg:col-span-4 flex flex-col items-center">
            <h2 className="text-white font-semibold mb-4 text-lg">Subscribe to Our Newsletter</h2>
            <p className="mb-4 text-gray-400">
              Get the latest deals, travel tips, and updates delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white mt-8 pt-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} SkyVoyage, All rights reserved.</p>

          {/* Social Icons */}

          {/* Payment Icons */}
          <div className="flex gap-2 mt-4 md:mt-0">
            <Image width={100} height={70} src="https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/logo/paypal.svg" alt="Paypal" className="h-6" />
            <Image width={100} height={70} src="https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/logo/amex.svg" alt="Amex" className="h-6" />
            <Image width={100} height={70} src="https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/logo/mastercard.svg" alt="MasterCard" className="h-6" />
            <Image width={100} height={70} src="https://github.com/aaronfagan/svg-credit-card-payment-icons/raw/main/logo/visa.svg" alt="Visa" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  </main>
  );
}
