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
import { CabinClassType, FareType, PassengerFillOut, PassengerTicket, searchSelectedFlight, searchSelectedBookingRoutes, UniversalFlightSchedule, UniversalFlightSegmentSchedule, BookingRefundAndCancelType } from "@/types/type"
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
import { BookingDetails } from "@/components/booking-list/booking"
import { toast } from "sonner"


export default function SearchResults() {
    const router:NextRouter = useRouter()
    const {data:sessionData, status:sessionStatus} = useSession()
    const isBookingLoaded = useRef<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [bookingList, setBookingList] = useState<searchSelectedBookingRoutes[]>([])
    useEffect(()=>{
        const fetchBooking = async () => {
            if(isBookingLoaded.current) return
            if(!sessionData) return
            if(!sessionData?.user) return
            if(!sessionData?.user.uuid) return
            if(sessionData?.user.uuid == "") return
            setIsLoading(true)
            isBookingLoaded.current = true
            const response = await fetch(`/api/booking/mybookings/${sessionData?.user.uuid}`, {
                
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const data = await response.json()
            if(data.booking){
                setIsLoading(false)
                setBookingList(data.booking)
            }else{
                setIsLoading(false)
                setBookingList([])
            }
        }
        fetchBooking()
    },[isBookingLoaded, sessionData])


      // User action handlers
    const handleRefund = async (bookingId: string) => {
        if(!sessionData) {
            toast.error("Session data not found, cannot process refund request.");
            return
        }
        if(!sessionData?.user) {
            toast.error("Session data not found, cannot process refund request.");
            return
        }
        if(!sessionData?.user.uuid) {
            toast.error("Session data not found, cannot process refund request.");
            return
        }
        if(sessionData?.user.uuid == "") {
            toast.error("Session data not found, cannot process refund request.");
            return
        }
        if(bookingId === "") toast.error("Booking ID is empty")
        try{
            const result = await fetch(`/api/booking/refund/${sessionData?.user.uuid}/${bookingId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data:BookingRefundAndCancelType = await result.json()
            if(data.status){
                console.log("Refund Data: ", data)
                toast.success("Refund successfully.")
            }else{
                toast.error("Refund failed: " + data.message)
            }
        }catch(error){
            toast.error("Error processing refund request: " + error)
        }
    }
    const handleCancel = async (bookingId: string) => {
        if(!sessionData) {
            toast.error("Session data not found, cannot process refund request.");
            return
        }
        if(!sessionData?.user) {
            toast.error("Session data not found, cannot process refund request.");
            return
        }
        if(!sessionData?.user.uuid) {
            toast.error("Session data not found, cannot process refund request.");
            return
        }
        if(sessionData?.user.uuid == "") {
            toast.error("Session data not found, cannot process refund request.");
            return
        }
        if(bookingId === "") toast.error("Booking ID is empty")
        try{
            const result = await fetch(`/api/booking/cancel/${sessionData?.user.uuid}/${bookingId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data:BookingRefundAndCancelType = await result.json()
            if(data.status){
                console.log("Cancel Data: ", data)
                toast.success("Cancel successfully.")
            }else{
                toast.error("Cancel failed: " + data.message)
            }
        }catch(error){
            toast.error("Error processing cancel request: " + error)
        }
    }

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
                <div className="py-8 flex flex-col gap-4">
                    {
                        isLoading ?
                        <div className="flex flex-row items-center justify-center gap-2 mb-4">
                            <Loader2 className="animate-spin h-5 w-5 text-gray-500" />
                            <span className="text-gray-500">Loading...</span>
                        </div> : null
                    }
                    {
                        !isLoading && bookingList.length === 0 ?
                        <Alert className="mb-4" variant="destructive">
                            <AlertTitle>No Booking Found</AlertTitle>
                            <AlertDescription>You have no booking yet.</AlertDescription>
                        </Alert> : null
                    }
                    {
                        !isLoading && bookingList.length > 0 ? bookingList.map((booking, index) => {
                            return (
                            <BookingDetails isAdmin={false} key={"booking-" + index} 
                                item={booking} onRefund={handleRefund} onCancel={handleCancel}
                            />
                            )
                        }) : null
                    }
                </div>
            </div>
            <AppFooter />
        </main>
    )
}
