// /* eslint-disable @typescript-eslint/no-unused-vars */
 
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardImage, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PassengerTicket, searchSelectedRoutes, ticketBaggageUpdatorType } from '@/types/type'
import { ArrowRight } from 'lucide-react'
import React, { useState } from 'react'

const BaggageAdditionCard = ({
    onInteract
}:{
    onInteract: ()=> void
}) => {
    return (
        <Card className="p-0 flex-col md:flex-row overflow-hidden gap-0">
            <CardImage 
                src="./baggage.jpg" 
                alt="Pick Your Seat" 
                aspectRatio="video"
                position="top"
                className="w-full md:hidden h-42"
            />
            <div className="flex flex-col w-full py-6 md:w-2/3">
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
                className="w-1/3 rounded-l-none hidden md:block"
            />
        </Card>
    )
}

const BaggageAdditionForm = ({
    onClose,
    selectedRoute,
    updatePassenger,
    defaultValue = [],
    setDefaultValue
}:{
    onClose: ()=> void
    selectedRoute: searchSelectedRoutes,
    updatePassenger: (update: { passengerIndex: number, ticketIndex: number, fields: Partial<PassengerTicket>}[]) => void
    defaultValue?: ticketBaggageUpdatorType[]
    setDefaultValue?: React.Dispatch<React.SetStateAction<ticketBaggageUpdatorType[]>>
}) =>{
    const [baggageSelection, setBaggageSelection] = useState<ticketBaggageUpdatorType[]>(defaultValue); 
    
    // Function to handle baggage selection
    const handleBaggageSelection = (segmentIndex: number, passengerIndex: number, weightValue: string) => {
        const weight = parseInt(weightValue);
        const price = weight * 30; // Calculate price based on weight
        
        // Check if selection for this passenger and segment already exists
        const existingSelectionIndex = baggageSelection.findIndex(
            item => item.ticketIndex === segmentIndex && item.passengerIndex === passengerIndex
        );
        
        if (existingSelectionIndex !== -1) {
            // Update existing selection
            const updatedSelection = [...baggageSelection];
            
            if (weight === 0) {
                // Remove the selection if weight is 0
                updatedSelection.splice(existingSelectionIndex, 1);
            } else {
                // Update the existing selection
                updatedSelection[existingSelectionIndex] = {
                    passengerIndex,
                    ticketIndex: segmentIndex,
                    weight,
                    price
                };
            }
            
            setBaggageSelection(updatedSelection);
        } else if (weight > 0) {
            // Add new selection only if weight is greater than 0
            setBaggageSelection([
                ...baggageSelection,
                {
                    passengerIndex,
                    ticketIndex: segmentIndex,
                    weight,
                    price
                }
            ]);
        }
    };
    const handleCompleted = () => {
        // Update all selected baggage items
        if(setDefaultValue){
            setDefaultValue(baggageSelection);
        }
        baggageSelection.forEach(item => {
            console.log("Update for", item);
            updatePassenger(
                baggageSelection.map(item => ({
                    passengerIndex: item.passengerIndex,
                    ticketIndex: item.ticketIndex,
                    fields: {
                        baggageAllowanceWeight: item.weight,
                        baggageAllowancePrice: item.price
                    }
                }))
            );
        });
        
        // Close the baggage selection modal
        onClose();
    };
    // Calculate total price from all selections
    const totalPrice = baggageSelection.reduce((sum, item) => sum + item.price, 0);
    
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
                        [...selectedRoute.selectedDepartRoute.flight.segments, ...(selectedRoute?.selectedReturnRoute?.flight.segments ?? [])].map((segment, segmentIndex) => (
                            <AccordionItem key={segmentIndex} value={`baggage-${segmentIndex}`} className="w-full">
                                <AccordionTrigger className="w-full flex justify-between items-center">
                                    <div className='flex flex-row items-center'>
                                        (Flight: {segment.airlineCode} {segment.flightNum.split("-")[0]}) [{segment.departureAirport} <ArrowRight className='h-4 w-4' /> {segment.arrivalAirport}]
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="w-full flex flex-col gap-2">
                                    {
                                        selectedRoute.passenger?.map((passenger, passengerIndex) => {
                                            if(passenger.ageRange == "Infant"){
                                                return (
                                                    <div key={`segment-baggage-${segmentIndex}-passenger-${passengerIndex}`} className='flex flex-row justify-between'>
                                                         <span className='text-destructive'>*Additional Baggage Weight is not available for <span className='italic'>infant passenger</span> <span className='font-semibold'>{passenger.firstName} {passenger.lastName[0].toUpperCase()}.</span></span>
                                                    </div>    
                                                )
                                            }
                                            
                                            // Find current selection for this passenger and segment
                                            const currentSelection = baggageSelection.find(
                                                item => item.ticketIndex === segmentIndex && item.passengerIndex === passengerIndex
                                            );
                                            
                                            const currentValue = currentSelection ? `${currentSelection.weight}` : '0';
                                            
                                            return (
                                                <div key={`segment-baggage-${segmentIndex}-passenger-${passengerIndex}`} className='flex flex-row justify-between'>
                                                    <span>Additional Baggage Weight For <span className='font-semibold'>{passenger.firstName} {passenger.lastName[0].toUpperCase()}.</span></span>
                                                    <Select 
                                                        value={currentValue}
                                                        onValueChange={(value) => handleBaggageSelection(segmentIndex, passengerIndex, value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="0kg - free of charge">
                                                                {currentValue === '0' ? 
                                                                    '0kg - free of charge' : 
                                                                    `${currentValue}kg - $${parseInt(currentValue) * 30}.00`
                                                                }
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='0'>0kg - free of charge</SelectItem>
                                                            {
                                                                [5,10,15,20,25,30,35,40,45,50].map((weight, wIndex) => {
                                                                    return (
                                                                        <SelectItem 
                                                                            key={`segment-b-${segmentIndex}-p-${passengerIndex}-w-${wIndex}`} 
                                                                            value={`${weight}`}>{weight}kg - ${weight * 30}.00</SelectItem>
                                                                    )
                                                                })
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )
                                        })
                                    }
                                </AccordionContent>
                            </AccordionItem>
                        ))
                    }
                </Accordion>
                <div className='flex flex-row justify-between'>
                    <div>Total: $ {totalPrice.toFixed(2)}</div>
                    <Button variant={"default"} onClick={handleCompleted} className='rounded-lg'>Completed</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export {
    BaggageAdditionCard,
    BaggageAdditionForm
}