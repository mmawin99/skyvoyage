 
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardImage, CardTitle } from '@/components/ui/card'
import { searchSelectedRoutes } from '@/types/type'
import { ArrowRight } from 'lucide-react'
import React from 'react'

const BaggageAdditionCard = ({
    onInteract
}:{
    onInteract: ()=> void
}) => {
    return (
        <Card className="p-0 flex-row overflow-hidden gap-0">
            <div className="flex flex-col w-2/3 py-6">
                <CardHeader>
                    <CardTitle className={`text-lg font-semibold`}>Add Extra Baggage</CardTitle>
                    <CardDescription>Travel with everything you need</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Your fare includes limited baggage. Add extra weight easily to bring more of what matters. Choose the right baggage allowance for a smoother check-in and a worry-free journey.</p>
                </CardContent>
                <CardFooter>
                    <Button variant={"default"} onClick={onInteract} className="cursor-pointer">Purchase Baggage Allowance</Button>
                </CardFooter>
            </div>
            <CardImage 
                src="./baggage.jpg" 
                alt="Pick Your Seat" 
                aspectRatio="wide"
                position="left"
                className="w-1/3 rounded-l-none"
            />
        </Card>
    )
}

const BaggageAdditionForm = ({
    onClose,
    selectedRoute
}:{
    onClose: ()=> void
    selectedRoute: searchSelectedRoutes
}) =>{
    console.log(selectedRoute)
    return (
        <Card>  
            <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                    <CardTitle className={`text-lg font-semibold`}>Add Extra Baggage</CardTitle>
                    <CardDescription>Travel with everything you need</CardDescription>
                </div>
                <Button variant={"destructive"} onClick={onClose} className='rounded-lg'>X</Button>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="my-4 w-full">
                    {
                        [...selectedRoute.selectedDepartRoute.flight.segments, ...(selectedRoute?.selectedReturnRoute?.flight.segments ?? [])].map((segment, index) => (
                            <AccordionItem key={index} value={`baggage-${index}`} className="w-full">
                                <AccordionTrigger className="w-full flex justify-between items-center">
                                    {/* <div className='flex flex-row gap-2'>
                                        <img src={`https://www.gstatic.com/flights/airline_logos/70px/${segment.carrier}.png`} alt={segment.carrier} className='h-8 w-8' />
                                        <span>{segment.carrier}</span>
                                    </div>
                                    <span>{segment.baggage}</span> */}
                                    <div className='flex flex-row items-center'>
                                        (Flight: {segment.airlineCode} {segment.flightNum.split("-")[0]}) [{segment.departureAirport} <ArrowRight className='h-4 w-4' /> {segment.arrivalAirport}]
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="w-full">
                                    <p>{segment.flightId}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))
                    }
                </Accordion>
                <div className='flex flex-row justify-between'>
                    <div>Total: $ 0.00</div>
                    <Button variant={"default"} className='rounded-lg'>Completed</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export {
    BaggageAdditionCard,
    BaggageAdditionForm
}