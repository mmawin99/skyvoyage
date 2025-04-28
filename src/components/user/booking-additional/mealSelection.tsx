import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardImage, CardTitle } from '@/components/ui/card'
import React from 'react'

const MealSelectionCard = ({onInteract}:{
    onInteract: ()=> void
}) => {
    return (
        <Card className="p-0 flex-row overflow-hidden gap-0">
            <div className="flex flex-col w-2/3 py-6">
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
                className="w-1/3 rounded-l-none"
            />
        </Card>

    )
}

export default MealSelectionCard