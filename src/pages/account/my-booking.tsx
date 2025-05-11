/* eslint-disable @typescript-eslint/no-unused-vars */
"use-client"
import { useSearchParams } from "next/navigation"
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"


export default function SearchResults() {
    const router:NextRouter = useRouter()
    const {data:sessionData, status:sessionStatus} = useSession()
    const isBookingLoaded = useRef<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [bookingList, setBookingList] = useState<searchSelectedBookingRoutes[]>([])
    
    const [refunding, setRefunding] = useState<boolean>(false)
    const [refundingBookingId, setRefundingBookingId] = useState<string>("")
    
    const [cancelling, setCancelling] = useState<boolean>(false)
    const [cancellingBookingId, setCancellingBookingId] = useState<string>("")

    const fetchBooking = useCallback(
    async () => {
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
    }, [sessionData])
    
    useEffect(()=>{
        fetchBooking()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[isBookingLoaded, sessionData])


      // User action handlers
    const handleRefund = async (bookingId: string) => {
        setRefunding(true)
        setRefundingBookingId(bookingId)
    }
    const handleRefundConfirm = async () => {
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
        if(refundingBookingId === "") toast.error("Booking ID is empty")
        try{
            const result = await fetch(`/api/booking/refund/${sessionData?.user.uuid}/${refundingBookingId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data:BookingRefundAndCancelType = await result.json()
            if(data.status){
                console.log("Refund Data: ", data)
                toast.success("Refund successfully.")
                fetchBooking()
            }else{
                // console.log("Refund Data: ", data)
                toast.error("Refund failed: " + (data.message || data.error))
            }
        }catch(error){
            toast.error("Error processing refund request: " + error)
        }
    }
    const handleRefundCancel = async () => {
        setRefunding(false)
        setRefundingBookingId("")
    }
    const handleCancel = async (bookingId: string) => {
        setCancelling(true)
        setCancellingBookingId(bookingId)
    }
    const handleCancelConfirm = async () => {
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
        if(cancellingBookingId === "") toast.error("Booking ID is empty")
        try{
            const result = await fetch(`/api/booking/cancel/${sessionData?.user.uuid}/${cancellingBookingId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data:BookingRefundAndCancelType = await result.json()
            if(data.status){
                console.log("Cancel Data: ", data)
                toast.success("Cancel successfully.")
                fetchBooking()
            }else{
                toast.error("Cancel failed: " + (data.message || data.error))
            }
        }catch(error){
            toast.error("Error processing cancel request: " + error)
        }
    }
    const handleCancelCancel = async () => {
        setCancelling(false)
        setCancellingBookingId("")
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
            <AlertDialog open={refunding} onOpenChange={handleRefundCancel}>
                <AlertDialogContent>
                    <AlertDialogHeader className="items-center">
                        <AlertDialogTitle>
                            <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                            <TriangleAlert className="h-7 w-7 text-destructive" />
                            </div>
                            Are you sure to request a refund?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[15px] text-center">
                            This action can not be undone. This will request a refund for your booking.
                            <span className="text-destructive">(Only 75% of the total will be refunded, 45% if some flight will depart in less than 12 hours)</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-2 sm:justify-center">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRefundConfirm}
                            className={buttonVariants({ variant: "destructive" })}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={cancelling} onOpenChange={handleCancelCancel}>
                <AlertDialogContent>
                    <AlertDialogHeader className="items-center">
                        <AlertDialogTitle>
                            <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                            <TriangleAlert className="h-7 w-7 text-destructive" />
                            </div>
                            Are you sure to request a refund?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[15px] text-center">
                            This action can not be undone. This will cancel your booking. 
                            <br />
                            (Refund will be not process through this action)
                            <br />
                            If you looking for a refund, please request a refund instead.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-2 sm:justify-center">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelConfirm}
                            className={buttonVariants({ variant: "destructive" })}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Navbar />
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">
                    My Booking
                </h1>
                <div className="py-8 flex flex-col gap-4">
                    {
                        isLoading ?
                        <div className="flex flex-row items-center justify-center gap-2 mb-4 h-60">
                            <Loader2 className="animate-spin h-14 w-14 text-gray-500" />
                            <span className="text-gray-500 text-xl">Loading...</span>
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
                            <BookingDetails defaultOpen={index === 0} isAdmin={false} key={"booking-" + index} 
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
