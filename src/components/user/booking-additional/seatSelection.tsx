/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardImage, CardTitle } from '@/components/ui/card'
import { PassengerTicket, searchSelectedRoutes } from '@/types/type'
import React from 'react'

const SeatSelectionCard = ({onInteract}:{
    onInteract: ()=> void
}) => {
    return (
        <Card className="p-0 flex-row overflow-hidden gap-0">
            <div className="flex flex-col w-2/3 py-6">
                <CardHeader>
                    <CardTitle className={`text-lg font-semibold`}>Seat Selection</CardTitle>
                    <CardDescription>Find your perfect spot onboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Select the seat that suits you best &mdash; whether you prefer extra legroom, a window view, or quick access to the aisle. Secure your comfort and enjoy a more personalized flying experience.</p>
                </CardContent>
                <CardFooter>
                    <Button variant={"default"} onClick={onInteract} className="cursor-pointer">Pick Your Seat</Button>
                </CardFooter>
            </div>
            <CardImage
                src="./seat.jpg" 
                alt="Pick Your Seat" 
                aspectRatio="wide"
                position="left"
                className="w-1/3 rounded-l-none"
            />
        </Card>
    )
}
const SeatSelectionForm = ({
    onClose,
    selectedRoute,
    updatePassenger,
    defaultValue = [],
    setDefaultValue
}:{
    onClose: ()=> void
    selectedRoute: searchSelectedRoutes,
    updatePassenger: (update: { passengerIndex: number, ticketIndex: number, fields: Partial<PassengerTicket>}[]) => void
    defaultValue?: string[]
    setDefaultValue?: React.Dispatch<React.SetStateAction<string[]>>
}) =>{
    // const [baggageSelection, setBaggageSelection] = useState<ticketBaggageUpdatorType[]>(defaultValue); 
    
    // Function to handle baggage selection
    // const handleBaggageSelection = (segmentIndex: number, passengerIndex: number, weightValue: string) => {
    //     const weight = parseInt(weightValue);
    //     const price = weight * 30; // Calculate price based on weight
        
    //     // Check if selection for this passenger and segment already exists
    //     const existingSelectionIndex = baggageSelection.findIndex(
    //         item => item.ticketIndex === segmentIndex && item.passengerIndex === passengerIndex
    //     );
        
    //     if (existingSelectionIndex !== -1) {
    //         // Update existing selection
    //         const updatedSelection = [...baggageSelection];
            
    //         if (weight === 0) {
    //             // Remove the selection if weight is 0
    //             updatedSelection.splice(existingSelectionIndex, 1);
    //         } else {
    //             // Update the existing selection
    //             updatedSelection[existingSelectionIndex] = {
    //                 passengerIndex,
    //                 ticketIndex: segmentIndex,
    //                 weight,
    //                 price
    //             };
    //         }
            
    //         setBaggageSelection(updatedSelection);
    //     } else if (weight > 0) {
    //         // Add new selection only if weight is greater than 0
    //         setBaggageSelection([
    //             ...baggageSelection,
    //             {
    //                 passengerIndex,
    //                 ticketIndex: segmentIndex,
    //                 weight,
    //                 price
    //             }
    //         ]);
    //     }
    // };
    // const handleCompleted = () => {
    //     // Update all selected baggage items
    //     if(setDefaultValue){
    //         setDefaultValue(baggageSelection);
    //     }
    //     baggageSelection.forEach(item => {
    //         console.log("Update for", item);
    //         updatePassenger(
    //             baggageSelection.map(item => ({
    //                 passengerIndex: item.passengerIndex,
    //                 ticketIndex: item.ticketIndex,
    //                 fields: {
    //                     baggageAllowanceWeight: item.weight,
    //                     baggageAllowancePrice: item.price
    //                 }
    //             }))
    //         );
    //     });
        
    //     // Close the baggage selection modal
    //     onClose();
    // };
    // // Calculate total price from all selections
    // const totalPrice = baggageSelection.reduce((sum, item) => sum + item.price, 0);
    
    return (
        <Card>  
            <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                    <CardTitle className={`text-lg font-semibold`}>Seat Selection</CardTitle>
                    <CardDescription>Select perfect spot onboard</CardDescription>
                </div>
                <Button variant={"destructive"} onClick={onClose} className='rounded-lg'>X</Button>
            </CardHeader>
            <CardContent>
               
            </CardContent>
        </Card>
    )
}

export {
    SeatSelectionCard,
    SeatSelectionForm
}