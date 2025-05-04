/* eslint-disable @typescript-eslint/no-unused-vars */
"use-client"
import { useSearchParams } from "next/navigation"
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Clock, Filter, Loader2, Plane, TriangleAlert } from "lucide-react"
import { CabinClassType, FareType, PassengerFillOut, PassengerTicket, searchSelectedFlight, searchSelectedBookingRoutes, UniversalFlightSchedule, UniversalFlightSegmentSchedule } from "@/types/type"
import { NextRouter, useRouter } from "next/router"
import { useBackendURL } from "@/components/backend-url-provider"
import { useSession } from "next-auth/react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Navbar } from "@/components/navbar"
import { AppFooter } from "@/components/footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import FlightCard from "@/components/flight-card"
import { Badge } from "@/components/ui/badge"

import { useSessionStorage } from "@uidotdev/usehooks"
import LoadingApp from "@/components/loading"


export default function SearchResults() {
    const router:NextRouter = useRouter()
    const {data:sessionData, status:sessionStatus} = useSession()
    const isBookingLoaded = useRef<boolean>(false)
    const [bookingList, setBookingList] = useState<searchSelectedBookingRoutes[]>([])
    useEffect(()=>{
        const fetchBooking = async () => {
            if(isBookingLoaded.current) return
            if(!sessionData) return
            if(!sessionData?.user) return
            if(!sessionData?.user.uuid) return
            if(sessionData?.user.uuid == "") return
            isBookingLoaded.current = true
            const response = await fetch(`/api/booking/mybookings/${sessionData?.user.uuid}`, {
                
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const data = await response.json()
            if(data.booking){
                setBookingList(data.booking)
            }else{
                setBookingList([])
            }
        }
        fetchBooking()
    },[isBookingLoaded, sessionData])


    if(sessionStatus === "loading") return <LoadingApp />

    if(!sessionData || !sessionData.user || (sessionData?.user.role !== "user" && sessionStatus === "authenticated")) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
        <TriangleAlert className="h-16 w-16 mb-4 text-red-600" />
        <span className="text-3xl font-bold mb-4">Access Denied</span>
        <p className="text-lg text-gray-600 mb-6">This page required you to sign in.</p>
        <div className="flex flex-row gap-2">
            <Button variant={"outline"} onClick={() => router.push("/")}>Go to Home</Button>
            <Button variant={"default"} onClick={() => router.push("/account/auth")}>Sign in</Button>
        </div>
        </div>
    )

    return (
        <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">
                My Booking
            </h1>


        </div>
        <AppFooter />
        </main>
    )
}
