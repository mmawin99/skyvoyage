/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useState, useEffect, useCallback } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, addDays, set } from "date-fns"
import { CalendarIcon, Loader2, Terminal, TriangleAlert } from "lucide-react"
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { AircraftModel, AircraftRegistration, Airline, Airport, Flight, SubmitFlight, SubmitSchedule, SubmitTransit } from "@/types/type"
import { DebouncedSearch } from "../../reusable/search"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
// import { Card, CardContent, CardHeader } from "../ui/card"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface AddFlightSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddTransit: (flight: SubmitTransit, onSuccess: () => void, onError: () => void) => void
    isLoading: boolean
}

export default function AddFlightSheet({ open, onOpenChange, onAddTransit, isLoading }: AddFlightSheetProps) {
    const [scheduleType, setScheduleType] = useState("single")
    
    const { backend: backendURL }: BackendURLType = useBackendURL();

    const [flightNum, setFlightNum] = useState<string>("")

    const [departureAirport, setDepartureAirport] = useState<Airport | null>(null)
    const [departureAirports, setDepartureAirports] = useState<Airport[]>([])
    const [loadingDeparture, setLoadingDeparture] = useState<boolean>(false)
    const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null)
    const [arrivalAirports, setArrivalAirports] = useState<Airport[]>([])
    const [loadingArrival, setLoadingArrival] = useState<boolean>(false)

    const [depTime, setDepTime] = useState("00:00:00")
    const [arrTime, setArrTime] = useState("00:00:00")

    // For recurring schedules
  
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false)
    const [errorSubmit, setErrorSubmit] = useState<string>("")
    const [isError, setIsError] = useState<boolean>(false)

    const [needSubmit, setNeedSubmit] = useState<boolean>(false)

    const handleSubmit = useCallback(async ()=>{
        if(!departureAirport || !arrivalAirport) {
            toast.error("Departure and Arrival airports are required")
            return
        }
        if(!flightNum) {
            toast.error("Flight number is required")
            return
        }
        setLoadingSubmit(true)
        // onAddTransit({
        //     flightNum: flightNum,
        //     departureTime: depTime,
        //     arrivalTime: arrTime,
        //     departAirportId: departureAirport.code,
        //     arriveAirportId: arrivalAirport.code,
        //     airlineCode: carrier.code
        // }, () => {
        //     setLoadingSubmit(false)
        //     setErrorSubmit("")
        //     setIsError(false)
        //     onOpenChange(false)
        //     //Reset the form
        //     setFlightNum("")
        //     setDepartureAirport(null)
        //     setArrivalAirport(null)
        //     setDepTime("00:00:00")
        //     setArrTime("00:00:00")
        // }, () => {
        //     setLoadingSubmit(false)
        //     setErrorSubmit("Failed to add Transit")
        //     setIsError(true)
        // })
    }, [arrivalAirport, departureAirport, flightNum])
    
    useEffect(() => {
        if(needSubmit){
            handleSubmit()
            setNeedSubmit(false)
        }
        return () => setNeedSubmit(false)

    }, [needSubmit, handleSubmit])
  

    const isOvernightFlight = (depTime: string, arrTime: string) => {
        const [depHours, depMinutes] = depTime.split(":").map(Number)
        const [arrHours, arrMinutes] = arrTime.split(":").map(Number)

        const depMinutesTotal = depHours * 60 + depMinutes
        const arrMinutesTotal = arrHours * 60 + arrMinutes

        return arrMinutesTotal < depMinutesTotal
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md md:max-w-lg px-4">
            <SheetHeader className="mt-7">
                <SheetTitle>Add New Flight</SheetTitle>
                <SheetDescription>Create a new transit. <br /> Fill in the details below.</SheetDescription>
            </SheetHeader>
            {isError ? (
            <Alert variant="destructive" className="mb-4">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorSubmit}</AlertDescription>
            </Alert>
            ): null}
            <Separator className="" />
            <div className="space-y-4">
                <div className="grid gap-4 py-4">
                    We currently work with this in progress.
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline"
                        className="cursor-pointer"
                        disabled={
                            isLoading
                        }
                        onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="cursor-pointer"
                        onClick={() => setNeedSubmit(true)}
                        disabled={
                            isLoading
                        }>
                        {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                        </>
                        ) : (
                        "Add Flight"
                        )}
                    </Button>
                </div>
            </div>
            </SheetContent>
        </Sheet>
    )
}
