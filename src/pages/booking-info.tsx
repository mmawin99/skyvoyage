/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppFooter } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CabinClassType, FarePackage, FareType, searchSelectedFlight, searchSelectedRoutes, UniversalFlightSchedule } from '@/types/type'
import { useSessionStorage } from '@uidotdev/usehooks'
import { ArrowRight, Calendar, Clock, Plane, SearchX } from 'lucide-react'
import { NextRouter, useRouter } from 'next/router'
import React from 'react'
import { format } from "date-fns"
import { FarePackageList } from '@/lib/farePackage'

  // Format flight time
const formatFlightTime = (duration: number) => {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return `${hours}h ${minutes}m`
}

const timeDifference = (timeString1: string, timeString2: string) => {
    return (new Date(timeString2).getTime() - new Date(timeString1).getTime()) / (1000 * 60)
}

//   // Format date
const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "EEE, MMM d")
}

const PassengerInfo = () => {
    const router:NextRouter = useRouter()
    const [selectedRoute, setSelectedRoute] = useSessionStorage<searchSelectedRoutes>("selectedRoute", {
        departRoute: [],
        selectedDepartRoute: {
            selectedFare: "SUPER_SAVER",
            flightId: "",
            flight: {} as UniversalFlightSchedule,
            price: 0,
        },
        returnRoute: [],
        selectedReturnRoute: undefined,
        queryString: {
            origin: "",
            destination: "",
            departDateStr: "",
            returnDateStr: "",
            passengersStr: "",
            cabinClass: "Y" as CabinClassType,
            tripType: "",
        },
        totalFare: 0,
        passenger: []
    })

    const PrintSegmentFlight = (title:string, flightSegment: searchSelectedFlight)=>{
        return (
            <>
                <div className='font-bold text-lg'>{title} {flightSegment.flight.departureAirport} → {flightSegment.flight.arrivalAirport}</div>
                    {flightSegment.flight.segments.map((segment, index) => (
                        <div key={"segment_"+segment .flightId} className='w-full'>
                            {index > 0 && (
                            <div className="my-4 px-4 bg-muted/30 rounded-md">
                                <div className="flex items-center justify-center text-md text-muted-foreground">
                                <span>Layover in {flightSegment.flight.segments[index - 1].arrivalAirport}</span>
                                <Badge variant={"outline"} className="font-medium ml-1">
                                    {formatFlightTime(timeDifference(flightSegment.flight.segments[index - 1].arrivalTime, segment.departureTime))}
                                </Badge>
                                </div>
                            </div>
                            )}
                            <div className='flex flex-row gap-1 text-muted-foreground items-center mb-2'>
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(segment.departureTime)}
                            </div>
                            <div className='flex flex-row gap-2 items-center w-full'>
                                <Plane />
                                <div className="border-l-2 border-gray-200 pl-3 ml-1 w-full">
                                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>{formatFlightTime(timeDifference(segment.departureTime, segment.arrivalTime))}</span>
                                        <span className="mx-2">•</span>
                                        <span>Flight {segment.airlineCode} {segment.flightNum.split("-")[0]}</span>
                                        <span className="mx-2">•</span>
                                        <Badge variant={"outline"}>{formatFareType(flightSegment.selectedFare)} Fare</Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium">{segment.departureAirport}</div>
                                        <div className="flex items-center text-muted-foreground">
                                        <ArrowRight className="h-4 w-4" />
                                        </div>
                                        <div className="font-medium">{segment.arrivalAirport}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </>
        )
    }
    const formatFareType = (type: FareType) => {
        return type
          .split("_")
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" ")
      }
    const PrintDetails = (dTitle:string, dDetails:string)=>{
        return (
            <div className='flex flex-row gap-2 text-sm justify-between'>
                <span className='font-bold tracking-tighter'>{dTitle}</span>
                <span>{dDetails}</span>
            </div>
        )
    }
    const PrintFareIncluded = (title: string, flightSegment: searchSelectedFlight, cabinClass: CabinClassType) => {
        const FareChoose:FarePackage = FarePackageList(selectedRoute.selectedDepartRoute.flight, cabinClass, flightSegment.selectedFare)[0];
        return (
            <div>
                <div className="font-semibold text-sm">{title} <Badge variant={"outline"}>{formatFareType(FareChoose.type)} Fare</Badge></div>
                <div className='grid grid-cols-2 mt-2 gap-2'>
                    <div className='flex flex-col gap-1'>
                        {PrintDetails("Luggage", FareChoose.baggage)}
                        {PrintDetails("Cancellation", FareChoose.cancellation)}
                        {PrintDetails("Carry on", FareChoose.carryOn)}
                        {PrintDetails("Change Flight", FareChoose.changes)}
                        {PrintDetails("Lounge", FareChoose.loungeAccess ? "Included" : "Fee applies")}
                    </div>
                    <div className='flex flex-col gap-1'>
                        {PrintDetails("Mileage", FareChoose?.mileage || "0 - 25%")}
                        {PrintDetails("Boarding Priority", FareChoose.priorityBoarding ? "Elible" : "Not Eligible")}
                        {PrintDetails("Refund", FareChoose.refundable ? "Elible" : "Not Elible")}
                        {PrintDetails("Seat Selection", FareChoose.seatSelection ? "Elible" : "Not Eligible")}
                    </div>
                </div>
            </div>
        )
    }
    if(selectedRoute.passenger === undefined || selectedRoute.passenger.length === 0){   
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <SearchX className="h-16 w-16 mb-4 text-red-600" />
                <span className="text-3xl font-bold mb-4">booking not found</span>
                <p className="text-lg text-gray-600">Find your perfect journey before booking.</p>
                <div className="flex flex-row gap-2">
                    <Button variant={"outline"} onClick={() => router.push("/")}>Go to Home</Button>
                </div>
            </div>
        )
    }
    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>
                <div className="flex flex-col lg:flex-row gap-6 w-full">
                    <div className='w-full lg:w-14/20'>
                        {/* <FormPassenger /> */}
                    </div>
                    <div className="w-full lg:w-6/20 lg:sticky lg:top-20 self-start h-fit">
                        <Card className="overflow-auto">
                            <CardHeader className="text-lg font-semibold">
                                <CardTitle>Your Booking Summary</CardTitle>
                                <CardDescription>0% Complete</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='flex flex-col gap-2'>
                                    <Separator />
                                    {
                                        PrintSegmentFlight("Departure Flight", selectedRoute.selectedDepartRoute)
                                    }
                                    { selectedRoute.selectedReturnRoute && <Separator className='mt-2 mb-1' /> }
                                    {
                                        selectedRoute.selectedReturnRoute && PrintSegmentFlight("Return Flight", selectedRoute.selectedReturnRoute)
                                    }
                                    <Separator />
                                    <div className='text-lg font-bold'>Included Fare</div>
                                    { 
                                        PrintFareIncluded("Departure Flight", selectedRoute.selectedDepartRoute, selectedRoute.queryString.cabinClass as CabinClassType)
                                    }
                                    { selectedRoute.selectedReturnRoute && <Separator className='mt-2 mb-1' /> }
                                    {
                                        selectedRoute.selectedReturnRoute && PrintFareIncluded("Return Flight", selectedRoute.selectedReturnRoute, selectedRoute.queryString.cabinClass as CabinClassType)
                                    }
                                    <Separator />
                                    <div className='text-lg font-bold'>Passenger</div>
                                    <div className='grid grid-cols-3'>
                                        {
                                            selectedRoute.queryString.passengersStr.split(",").map((passenger, index) => (  
                                                <div key={index} className='flex flex-row gap-2 text-sm place-self-center'>
                                                    <span className='text-base font-normal'>{passenger}</span>
                                                    <span className='font-semibold tracking-tighter text-base'>{["Adult","Children","Infant"][index]}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <Separator />
                                    <div className='text-lg font-bold'>Pricing Details</div>
                                    <div className='flex flex-col gap-2'>
                                        <div>
                                            <div className='flex flex-row gap-2 text-sm justify-between'>
                                                <span className='font-bold tracking-tighter'>Base Fare</span>
                                                <span>$ {selectedRoute.totalFare}</span>
                                            </div>
                                            <div className='flex flex-row gap-2 text-sm justify-between'>
                                                <span className='font-bold tracking-tighter'>Tax & Fees</span>
                                                <span>$ 0.00</span>
                                            </div>
                                            <div className='flex flex-row gap-2 text-sm justify-between'>
                                                <span className='font-bold tracking-tighter'>Additional Service</span>
                                                <span>$ 0.00</span>
                                            </div>
                                            <Separator className='my-2' />
                                            <div className='flex flex-row gap-2 text-sm justify-between'>
                                                <span className='font-bold tracking-tighter'>Total Price</span>
                                                <span>$ {selectedRoute.totalFare}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Button variant={"default"} className="w-full mt-4 cursor-pointer" onClick={() => {
                            // router.push("/complete-booking")
                        }}>
                            <div className="flex items-center gap-2">   
                                <span>Continue to Payment</span>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
            <AppFooter />
        </main>
    )
}

export default PassengerInfo