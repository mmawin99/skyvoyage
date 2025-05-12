import CollapsibleFilter from '@/components/ui-blocks/collapsibleFilter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FarePackageList } from '@/lib/farePackage'
import { CabinClassType, FarePackage, FareType, searchSelectedFlight, searchSelectedRoutes } from '@/types/type'
import { format } from "date-fns"
import { ArrowRight, Boxes, Calendar, Clock, Plane } from 'lucide-react'

// Format flight time
const formatFlightTime = (duration: number) => {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return `${hours}h ${minutes}m`
}

const timeDifference = (timeString1: string, timeString2: string) => {
    return (new Date(timeString2).getTime() - new Date(timeString1).getTime()) / (1000 * 60)
}

const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "EEE, MMM d")
}

const PrintSegmentFlight = (title:string, flightSegment: searchSelectedFlight)=>{
    return (
        <>
            {/*<div className='font-bold text-lg'>{title} {flightSegment.flight.departureAirport} → {flightSegment.flight.arrivalAirport}</div> */}
            <CollapsibleFilter icon={Plane} title={title} className="ml-2">
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
                            <div className="border-l-2 border-gray-200 pl-3 ml-1 w-full">
                                <div className="flex items-center flex-wrap gap-y-2 text-sm text-muted-foreground mb-1">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span className='tracking-tight'>{formatFlightTime(timeDifference(segment.departureTime, segment.arrivalTime))}</span>
                                    <span className="mx-2">•</span>
                                    <span className='tracking-tight'>{segment.airlineCode} {segment.flightNum.split("-")[0]}</span>
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
            </CollapsibleFilter>
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
const PrintFareIncluded = (selectedRoute:searchSelectedRoutes, title: string, flightSegment: searchSelectedFlight, cabinClass: CabinClassType) => {
    const FareChoose:FarePackage = FarePackageList(selectedRoute.selectedDepartRoute.flight, cabinClass, flightSegment.selectedFare)[0];
    return (
        <CollapsibleFilter title={title} className='ml-2'>
            <div className='grid grid-cols-2 mt-2 gap-2'>
                <div className='flex flex-col gap-1'>
                    {PrintDetails("Luggage", FareChoose.baggage)}
                    {PrintDetails("Cancellation", FareChoose.cancellation + "*")}
                    {PrintDetails("Carry on", FareChoose.carryOn)}
                    {PrintDetails("Change Flight", FareChoose.changes + "*")}
                    {PrintDetails("Lounge", FareChoose.loungeAccess ? "Included" : "Fee applies")}
                </div>
                <div className='flex flex-col gap-1'>
                    {PrintDetails("Mileage", FareChoose?.mileage || "0 - 25%")}
                    {PrintDetails("Boarding Priority", FareChoose.priorityBoarding ? "Eligible" : "Not Eligible")}
                    {PrintDetails("Refund", FareChoose.refundable ? "Eligible" : "Fee applies")}
                    {PrintDetails("Seat Selection", FareChoose.seatSelection ? "Eligible" : "Fee applies")}
                    {PrintDetails("Meal Selection", FareChoose.mealSelection ? "Eligible" : "Fee applies")}
                </div>
            </div>
        </CollapsibleFilter>
        // <div>
        //     <div className="font-semibold text-base">{title} <Badge variant={"outline"}>{formatFareType(FareChoose.type)} Fare</Badge></div>
            
        // </div>
    )
}
const BookingSummary = ({
    percentageComplete,
    selectedRoute, 
    onClickNext, 
    isEnableButton,
    flightOpen = true,
    customText,
    customButton = true,
    additionalFare
}: {
    percentageComplete:number,
    selectedRoute: searchSelectedRoutes, 
    onClickNext: ()=>void, 
    isEnableButton:boolean,
    flightOpen?: boolean,
    customText?: string,
    customButton?: boolean,
    additionalFare: number
}) => {
    return (
        <Card className="overflow-auto">
            <CardHeader className="text-lg font-semibold">
                <CardTitle>Your Booking Summary</CardTitle>
                <CardDescription>{percentageComplete.toFixed(2) == "100.00" ? "Completed" : percentageComplete.toFixed(2) + '% Complete'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col gap-2'>
                    <Separator />
                    <CollapsibleFilter icon={Calendar} title="Your Flight" defaultOpen={flightOpen}>
                        {
                            PrintSegmentFlight("Departure Flight", selectedRoute.selectedDepartRoute)
                        }
                        { selectedRoute.selectedReturnRoute && <Separator className='mt-2 mb-1' /> }
                        {
                            selectedRoute.selectedReturnRoute && PrintSegmentFlight("Return Flight", selectedRoute.selectedReturnRoute)
                        }
                    </CollapsibleFilter>
                    <Separator />
                    <CollapsibleFilter icon={Boxes} title="Included Fare">
                        { 
                            PrintFareIncluded(selectedRoute, "Departure Flight", selectedRoute.selectedDepartRoute, selectedRoute.queryString.cabinClass as CabinClassType)
                        }
                        {/* { selectedRoute.selectedReturnRoute && <Separator className='mt-2 mb-1' /> } */}
                        {
                            selectedRoute.selectedReturnRoute && PrintFareIncluded(selectedRoute, "Return Flight", selectedRoute.selectedReturnRoute, selectedRoute.queryString.cabinClass as CabinClassType)
                        }
                        <span className="text-sm font-medium text-red-500">*contact airlines manually.</span>
                    </CollapsibleFilter>
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
                            <div className='flex flex-row gap-2 text-base justify-between'>
                                <span className='font-bold tracking-tighter'>Base Fare</span>
                                <span>$ {selectedRoute.totalFare.toFixed(2)}</span>
                            </div>
                            <div className='flex flex-row gap-2 text-base justify-between'>
                                <span className='font-bold tracking-tighter'>Additional Service</span>
                                <span>$ {additionalFare.toFixed(2)}*</span>
                            </div>
                            <div className='flex flex-row gap-2 text-base justify-between'>
                                <span className='font-bold tracking-tighter'>Tax & Fees</span>
                                <span>$ {((selectedRoute.totalFare + additionalFare) * 0.07).toFixed(2)}*</span>
                            </div>
                            <Separator className='my-2' />
                            <div className='flex flex-row gap-2 text-base justify-between'>
                                <span className='font-bold tracking-tighter'>Total Price</span>
                                <span>$ {((selectedRoute.totalFare + additionalFare) * 1.07).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {customButton && <Button variant={"default"} className="w-full mt-4 cursor-pointer" disabled={!isEnableButton} onClick={!isEnableButton ? undefined : onClickNext}>
                    <div className="flex items-center gap-2">   
                        <span>{customText ? customText : "Confirm Your booking"}</span>
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </Button>}
            </CardContent>
        </Card>
    )
}

export default BookingSummary