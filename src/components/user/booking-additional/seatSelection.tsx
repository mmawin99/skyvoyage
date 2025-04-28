import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardImage, CardTitle } from '@/components/ui/card'
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
export default SeatSelectionCard