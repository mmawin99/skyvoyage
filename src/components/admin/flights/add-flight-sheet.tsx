/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Loader2, TriangleAlert } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Airport, SubmitFlight } from "@/types/type"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { DebouncedSearch } from "../../reusable/search"
// import { Card, CardContent, CardHeader } from "../ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"

interface AddFlightSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddFlight: (flight: SubmitFlight, onSuccess: () => void, onError: () => void) => void
    isLoading: boolean
    carrier: {name:string, code:string}
}

export default function AddFlightSheet({ open, onOpenChange, onAddFlight, isLoading, carrier }: AddFlightSheetProps) {
    
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
        onAddFlight({
            flightNum: flightNum,
            departureTime: depTime,
            arrivalTime: arrTime,
            departAirportId: departureAirport.code,
            arriveAirportId: arrivalAirport.code,
            airlineCode: carrier.code
        }, () => {
            setLoadingSubmit(false)
            setErrorSubmit("")
            setIsError(false)
            onOpenChange(false)
            //Reset the form
            setFlightNum("")
            setDepartureAirport(null)
            setArrivalAirport(null)
            setDepTime("00:00:00")
            setArrTime("00:00:00")
        }, () => {
            setLoadingSubmit(false)
            setErrorSubmit("Failed to add flight")
            setIsError(true)
        })
    }, [arrTime, arrivalAirport, carrier.code, depTime, departureAirport, flightNum, onAddFlight, onOpenChange])
    
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
                <SheetDescription>Create a new flight for {carrier.name} ({carrier.code}). <br /> Fill in the details below.</SheetDescription>
            </SheetHeader>
            {isError || !carrier.name || !carrier.code ? (
            <Alert variant="destructive" className="mb-4">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{!carrier.name || !carrier.code ? "Airline carrier isn't selected" : errorSubmit}</AlertDescription>
            </Alert>
            ): null}
            <Separator className="" />
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="dep_time">Flight number</Label>
                    <span className="text-muted-foreground text-xs">(e.g. 243, 244-1, 244-2)</span>
                    <Input id="dep_time" type="text" placeholder="Enter flight number (e.g. 243, 244-1, 244-2)" value={flightNum} onChange={(e) => setFlightNum(e.target.value)} />
                </div>

                    {/* Departure */}
                    <div className="space-y-2">
                    <Label>Departure Airport</Label>
                    <DebouncedSearch<Airport>
                        title="Airport or city"
                        selected={departureAirport}
                        onSelect={setDepartureAirport}
                        requestMethod="GET"
                        results={departureAirports}
                        setResults={setDepartureAirports}
                        loading={loadingDeparture}
                        setLoading={setLoadingDeparture}
                        fetchUrl={(q) => `${backendURL}/autocomplete/airport/${q}`}
                        renderItem={(airport) => (
                            <div className="flex flex-col">
                            <span className="font-medium">{airport.name} ({airport.code})</span>
                            <span className="text-xs text-gray-500">{airport.city}, {airport.country}</span>
                            </div>
                        )}
                        renderSelectedItem={(airport) => <span className="font-medium">{airport.name} ({airport.code})</span>}
                    />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dep_time">UTC Departure Time</Label>
                        <Input id="dep_time" type="time" lang="en-GB" value={depTime} onChange={(e) => setDepTime(e.target.value)} />
                    </div>

                    {/* Arrival */}
                    <div className="space-y-2">
                        <Label>Arrival Airport</Label>
                        <DebouncedSearch<Airport>
                            title="Airport or city"
                            selected={arrivalAirport}
                            onSelect={setArrivalAirport}
                            requestMethod="GET"
                            results={arrivalAirports}
                            setResults={setArrivalAirports}
                            loading={loadingArrival}
                            setLoading={setLoadingArrival}
                            fetchUrl={(q) => `${backendURL}/autocomplete/airport/${q}`}
                            renderItem={(airport) => (
                                <div className="flex flex-col">
                                <span className="font-medium">{airport.name} ({airport.code})</span>
                                <span className="text-xs text-gray-500">{airport.city}, {airport.country}</span>
                                </div>
                            )}
                            renderSelectedItem={(airport) => <span className="font-medium">{airport.name} ({airport.code})</span>}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="arr_time">UTC Arrival Time</Label>
                        <Input id="arr_time" type="time" lang="en-GB" value={arrTime} onChange={(e) => setArrTime(e.target.value)} />
                    </div>

                    {isOvernightFlight(depTime, arrTime) && <div className="space-y-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Overnight Flight (+1 day)
                      </Badge>
                    </div> }

                    <div className="flex justify-end gap-2">
                        <Button variant="outline"
                            className="cursor-pointer"
                            disabled={
                                 isLoading // ||
                                // !carrier.name ||
                                // !carrier.code
                            }
                            onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="cursor-pointer"
                            onClick={() => setNeedSubmit(true)}
                            disabled={
                                isLoading ||
                                !carrier.name ||
                                !carrier.code ||
                                !flightNum ||
                                !departureAirport ||
                                !arrivalAirport
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
