/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppFooter } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { CabinClassType, searchSelectedRoutes, UniversalFlightSchedule } from '@/types/type'
import { useSessionStorage } from '@uidotdev/usehooks'
import { Link, SearchX } from 'lucide-react'
import { NextRouter, useRouter } from 'next/router'
import React, { useState } from 'react'
import BookingSummary from '@/components/user/booking/booking-summary'
import { useSession } from 'next-auth/react'
import PolicyDialogs from '@/components/user/booking-passenger/policy'
import SeatSelectionCard from '@/components/user/booking-additional/seatSelection'
import MealSelectionCard from '@/components/user/booking-additional/mealSelection'
import { BaggageAdditionCard, BaggageAdditionForm } from '@/components/user/booking-additional/BaggageSelection'
type PolicyDialogsType = "foreign" | "purchase" | "refund" | null;
type InteractCardType = "seat" | "meal" | "baggage" | null;
const PassengerInfo = () => {
    const router:NextRouter = useRouter()
    const {data:sessionData} = useSession()
    const [policyOpen, setPolicyOpen] = useState<PolicyDialogsType>(null)
    const [interactOpen, setInteractOpen] = useState<InteractCardType>(null)
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
            <PolicyDialogs setOpenDialog={setPolicyOpen} openDialog={policyOpen} />
            <Navbar />
            <div className="container mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">Additional Package</h1>
                <div className="flex flex-col lg:flex-row gap-6 w-full">
                    <div className='w-full lg:w-14/20 flex flex-col gap-6'>
                        {
                            interactOpen === "baggage" && (
                                <BaggageAdditionForm 
                                    selectedRoute={selectedRoute}
                                    onClose={()=>{ setInteractOpen(null); }} 
                                />
                            )
                        }
                        {
                            !(interactOpen === "baggage") &&
                            <BaggageAdditionCard onInteract={()=>{ setInteractOpen("baggage") }} />
                        }
                        <SeatSelectionCard onInteract={()=>{  }} />
                        <MealSelectionCard onInteract={()=>{  }} />
                        <div className='flex flex-row w-full justify-end gap-2'>
                            <Button variant={"ghost"} onClick={()=>{ setPolicyOpen("foreign") }} className='flex flex-row gap-2 border-2 border-slate-300 rounded-full cursor-pointer'><Link /><span>Foreign Items</span></Button>
                            <Button variant={"ghost"} onClick={()=>{ setPolicyOpen("purchase") }} className='flex flex-row gap-2 border-2 border-slate-300 rounded-full cursor-pointer'><Link /><span>Purchase Policy</span></Button>
                            <Button variant={"ghost"} onClick={()=>{ setPolicyOpen("refund") }} className='flex flex-row gap-2 border-2 border-slate-300 rounded-full cursor-pointer'><Link /><span>Refund Policy</span></Button>
                        </div>
                    </div>
                    <div className="w-full lg:w-6/20 lg:sticky lg:top-20 self-start h-fit">
                        <BookingSummary
                        flightOpen={false}
                        percentageComplete={100}
                        selectedRoute={selectedRoute} 
                        onClickNext={()=>{ }} 
                        isEnableButton={true} />
                    </div>
                </div>
            </div>
            <AppFooter />
        </main>
    )
}

export default PassengerInfo