import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardImage, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PassengerTicket, searchSelectedRoutes, ticketMealUpdatorType } from '@/types/type'
import { ArrowRight } from 'lucide-react'
import React, { useState } from 'react'
import mealList from '../../../../data/meal.json'
const MealSelectionCard = ({onInteract}:{
    onInteract: ()=> void
}) => {
    return (
        <Card className="p-0 flex-col md:flex-row overflow-hidden gap-0">
            <CardImage 
                src="./meal.jpg" 
                alt="Pick Your Meal" 
                aspectRatio="wide"
                position="top"
                className="w-full md:hidden h-42"
            />
            <div className="flex flex-col w-full md:w-2/3 py-6">
                <CardHeader>
                    <CardTitle className={`text-lg font-semibold`}>Pick your meal</CardTitle>
                    <CardDescription>Savor your journey with a meal made for you</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Pick your preferred meal from our variety of options, including special dietary menus. Enjoy delicious, thoughtfully prepared dishes that make your flight even more enjoyable.</p>
                </CardContent>
                <CardFooter>
                    <Button variant={"default"} onClick={onInteract} className="cursor-pointer">Pick Meal</Button>
                </CardFooter>
            </div>
            <CardImage 
                src="./meal.jpg" 
                alt="Pick Your Meal" 
                aspectRatio="wide"
                position="left"
                className="w-1/3 rounded-l-none hidden md:block"
            />
        </Card>

    )
}
const MealAdditionForm = ({
    onClose,
    selectedRoute,
    updatePassenger,
    defaultValue = [],
    setDefaultValue
}:{
    onClose: ()=> void
    selectedRoute: searchSelectedRoutes,
    updatePassenger: (update: { passengerIndex: number, ticketIndex: number, fields: Partial<PassengerTicket>}[]) => void
    defaultValue?: ticketMealUpdatorType[]
    setDefaultValue?: React.Dispatch<React.SetStateAction<ticketMealUpdatorType[]>>
}) =>{
    const [mealSelection, setMealSelection] = useState<ticketMealUpdatorType[]>(defaultValue); 
    
    // Function to handle meal selection
    const handleMealSelection = (segmentIndex: number, passengerIndex: number, mealIndex: string) => {
        const meal = parseInt(mealIndex);
        
        const existingSelectionIndex = mealSelection.findIndex(
            item => item.ticketIndex === segmentIndex && item.passengerIndex === passengerIndex
        );
        
        if (existingSelectionIndex !== -1) {
            // Update existing selection
            const updatedSelection = [...mealSelection];
            
            if (meal === -1) {
                // Remove the selection if meal is 0
                updatedSelection.splice(existingSelectionIndex, 1);
            } else {
                // Update the existing selection
                updatedSelection[existingSelectionIndex] = {
                    passengerIndex,
                    ticketIndex: segmentIndex,
                    mealIndex: meal,
                    mealLabel: mealList[meal].name,
                    price: mealList[meal].price,
                };
            }
            
            setMealSelection(updatedSelection);
        } else if (meal > -1) {
            // Add new selection only if meal is greater than 0
            setMealSelection([
                ...mealSelection,
                {
                    passengerIndex,
                    ticketIndex: segmentIndex,
                    mealIndex: meal,
                    mealLabel: mealList[meal].name,
                    price: mealList[meal].price,
                }
            ]);
        }
    };
    const handleCompleted = () => {
        // Update all selected meal items
        if(setDefaultValue){
            setDefaultValue(mealSelection);
        }
        mealSelection.forEach(item => {
            console.log("Update for", item);
            updatePassenger(
                mealSelection.map(item => ({
                    passengerIndex: item.passengerIndex,
                    ticketIndex: item.ticketIndex,
                    fields: {
                        mealSelection: item.mealLabel,
                        mealPrice: item.price,
                    }
                }))
            );
        });
        
        // Close the meal selection modal
        onClose();
    };
    // Calculate total price from all selections
    const totalPrice = mealSelection.reduce((sum, item) => sum + item.price, 0);
    
    return (
        <Card>  
            <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                    <CardTitle className={`text-lg font-semibold`}>Add Extra Meal</CardTitle>
                    <CardDescription>Travel with everything you need</CardDescription>
                </div>
                <Button variant={"destructive"} onClick={onClose} className='rounded-lg'>X</Button>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="my-4 w-full">
                    {
                        [...selectedRoute.selectedDepartRoute.flight.segments, ...(selectedRoute?.selectedReturnRoute?.flight.segments ?? [])].map((segment, segmentIndex) => (
                            <AccordionItem key={segmentIndex} value={`meal-${segmentIndex}`} className="w-full">
                                <AccordionTrigger className="w-full flex justify-between items-center">
                                    <div className='flex flex-row items-center'>
                                        (Flight: {segment.airlineCode} {segment.flightNum.split("-")[0]}) [{segment.departureAirport} <ArrowRight className='h-4 w-4' /> {segment.arrivalAirport}]
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="w-full flex flex-col gap-2">
                                    {
                                        selectedRoute.passenger?.map((passenger, passengerIndex) => {
                                            
                                            // Find current selection for this passenger and segment
                                            const currentSelection = mealSelection.find(
                                                item => item.ticketIndex === segmentIndex && item.passengerIndex === passengerIndex
                                            );
                                            
                                            const currentValue = currentSelection ? `${currentSelection.mealIndex}` : '-1';
                                            
                                            return (
                                                <div key={`segment-meal-${segmentIndex}-passenger-${passengerIndex}`} className='flex flex-row justify-between'>
                                                    <span>Additional Meal Weight For <span className='font-semibold'>{passenger.firstName} {passenger.lastName[0].toUpperCase()}.</span></span>
                                                    <Select 
                                                        value={currentValue}
                                                        onValueChange={(value) => handleMealSelection(segmentIndex, passengerIndex, value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Unselected meal - Free of charge">
                                                                {currentValue === '-1' ? 
                                                                    'Unselected meal - Free of charge' : 
                                                                    <div className='text-left'>
                                                                        <div>{mealList[parseInt(currentValue)].name} - ${mealList[parseInt(currentValue)].price}.00</div>
                                                                        <div className='text-xs text-muted-foreground line-clamp-3 w-40'>{mealList[parseInt(currentValue)].description}</div>
                                                                    </div>
                                                                }
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='-1'>Unselected Meal - Free of charge</SelectItem>
                                                            {
                                                                mealList.map((meal, mIndex) => {
                                                                    return (
                                                                        <SelectItem 
                                                                            key={`segment-b-${segmentIndex}-p-${passengerIndex}-w-${mIndex}`} 
                                                                            value={`${mIndex}`}>
                                                                            <div>
                                                                                <div>{meal.name} - ${meal.price}.00</div>
                                                                                <div className='text-xs text-muted-foreground line-clamp-3 w-40'>{meal.description}</div>
                                                                            </div>
                                                                        </SelectItem>
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
    MealSelectionCard,
    MealAdditionForm
}