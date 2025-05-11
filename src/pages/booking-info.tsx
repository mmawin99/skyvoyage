/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppFooter } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CabinClassType, FarePackage, FareType, loadExistPassengerType, PassengerFillOut, searchSelectedFlight, searchSelectedRoutes, UniversalFlightSchedule } from '@/types/type'
import { useSessionStorage } from '@uidotdev/usehooks'
import { ArrowRight, Calendar, Clock, Plane, SearchX } from 'lucide-react'
import { NextRouter, useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { format } from "date-fns"
import { FarePackageList } from '@/lib/farePackage'
import BookingSummary from '@/components/user/booking/booking-summary'
import PassengerFilling from '@/components/user/booking-passenger/passenger-filling'
import PassengerSummary from '@/components/user/booking-passenger/passenger-summary'
import { useSession } from 'next-auth/react'

const PassengerInfo = () => {
    const router:NextRouter = useRouter()
    const {data:sessionData} = useSession();
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
    const [currentPassenger, setCurrentPassenger] = useState<number>(0)
    const updatePassengerFields = (index: number, fields: Record<string, string>): boolean => {
        setSelectedRoute((prev) => {
            if (!prev.passenger?.[index]) return prev;
            return {
                ...prev,
                passenger: prev.passenger.map((p, i) =>
                    i === index ? { ...p, ...fields } : p
                ),
            };
        });
        return true;
    };
    const [isAllComplete, setIsAllComplete] = useState<boolean>(false)
    const onComplete = () => {
        router.push("/booking-confirmation")
    }
    const [wantToEdit, setWantToEdit] = useState<boolean>(false)
    const [editId, setEditId] = useState<number>(-1)
    const [passengerInformation, setPassengerInformation] = useState<PassengerFillOut | null>(null)
    const [existPassenger, setExistPassenger] = useState<loadExistPassengerType[]>([])
    const [isPassengerExistLoading, setIsPassengerExistLoading] = useState<boolean>(false)
    useEffect(()=>{
        if(wantToEdit && editId != -1){
            setCurrentPassenger(editId)
            setPassengerInformation(selectedRoute.passenger?.[editId] ?? null)
            setIsAllComplete(false)
            setWantToEdit(false)
            setEditId(-1)
        }
    },[wantToEdit, editId, selectedRoute])

    useEffect(()=>{
        const fetchPassenger = async () => {
            if(isPassengerExistLoading) return
            if(!sessionData) return
            if(!sessionData?.user) return
            if(!sessionData?.user.uuid) return
            if(sessionData?.user.uuid == "") return
            setIsPassengerExistLoading(true)
            const response = await fetch(`/api/booking/passenger/${sessionData?.user.uuid}?seldate=${selectedRoute.queryString.returnDateStr || selectedRoute.queryString.departDateStr || new Date().toISOString()}`, {
                
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const data = await response.json()
            if(data.status){
                setExistPassenger(data.passengers)
            }else{
                setExistPassenger([])
            }
        }
        fetchPassenger()
    },[isPassengerExistLoading, selectedRoute.queryString.departDateStr, selectedRoute.queryString.returnDateStr, sessionData])

    const editPassenger = (index:number) => {
        setEditId(index)
        setTimeout(()=>{
            setWantToEdit(true)
        }, 100);
    }
    const totalAddtionalServicesFare = selectedRoute.passenger?.reduce((acc, passenger) => {
        const ticketTotal = passenger.ticket.reduce((ticketAcc, ticket) => {
            return ticketAcc + ticket.mealPrice + ticket.seatPrice + ticket.baggageAllowancePrice;
        }, 0);

        return acc + ticketTotal;
    }, 0) ?? 0; 
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
                        {
                            isAllComplete ?
                            <>
                                <PassengerSummary selectedRoute={selectedRoute} 
                                    onEdit={(index:number)=>{
                                        editPassenger(index)
                                    }}
                                    onPrevious={()=>{ 
                                        const passengerLength:number = (selectedRoute?.passenger?.length ?? 0) - 1
                                        editPassenger(passengerLength == -1 ? 0 : passengerLength)
                                    }}
                                    onComplete={onComplete}
                                />
                            </> :
                            <PassengerFilling
                                existPassenger={existPassenger}
                                selectedRoute={selectedRoute} 
                                currentPassenger={currentPassenger} 
                                setCurrentPassenger={setCurrentPassenger} 
                                updatePassengerFields={updatePassengerFields}
                                setAllComplete={setIsAllComplete}
                                firstPasssenger={passengerInformation || selectedRoute.passenger?.[0]}
                            />
                        }
                    </div>
                    <div className="w-full lg:w-6/20 lg:sticky lg:top-20 self-start h-fit">
                        <BookingSummary 
                            percentageComplete={isAllComplete ? 100 : (selectedRoute.passenger?.filter(i=>i.status == "FILLED" ? true: null).filter(i=>i!=null).length) / selectedRoute.passenger?.length * 100}
                            selectedRoute={selectedRoute} onClickNext={onComplete} 
                            isEnableButton={isAllComplete && currentPassenger == selectedRoute.passenger?.length - 1}
                            additionalFare={totalAddtionalServicesFare}
                            customText={"Customize your journey"}
                        />
                    </div>
                </div>
            </div>
            <AppFooter />
        </main>
    )
}

export default PassengerInfo