/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Loader2, TriangleAlert } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Airline, Flight, SubmitTransit } from "@/types/type"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { DebouncedSearch } from "../../reusable/search"
// import { Card, CardContent, CardHeader } from "../ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"

interface AddFlightSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddTransit: (flight: SubmitTransit, onSuccess: () => void, onError: () => void) => void
    isLoading: boolean
}

export default function AddFlightSheet({ open, onOpenChange, onAddTransit, isLoading }: AddFlightSheetProps) {
    
    const { backend: backendURL }: BackendURLType = useBackendURL();

    const [selectedCarrier1, setSelectedCarrier1] = useState<Airline>()
    const [carriers1, setCarriers1] = useState<Airline[]>([])
    const [loadingCarrier1, setLoadingCarrier1] = useState<boolean>(false)

    const [selectedFlight1, setSelectedFlight1] = useState<Flight>()
    const [carrierFlights1, setCarrierFlights1] = useState<Flight[]>([])
    const [loadingFlight1, setLoadingFlight1] = useState<boolean>(false)
    
    const [selectedCarrier2, setSelectedCarrier2] = useState<Airline>()
    const [carriers2, setCarriers2] = useState<Airline[]>([])
    const [loadingCarrier2, setLoadingCarrier2] = useState<boolean>(false)

    const [selectedFlight2, setSelectedFlight2] = useState<Flight>()
    const [carrierFlights2, setCarrierFlights2] = useState<Flight[]>([])
    const [loadingFlight2, setLoadingFlight2] = useState<boolean>(false)

  
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false)
    const [errorSubmit, setErrorSubmit] = useState<string>("")
    const [isError, setIsError] = useState<boolean>(false)

    const [needSubmit, setNeedSubmit] = useState<boolean>(false)

    const handleSubmit = useCallback(async ()=>{
        if(!selectedCarrier1 || !selectedFlight1 || !selectedCarrier2 || !selectedFlight2){
            toast.error("Please fill out all fields")
            return
        }
        setLoadingSubmit(true)
        setErrorSubmit("")
        setIsError(false)
        if(!backendURL || backendURL == "") return
        onAddTransit({
            airlineCodeFrom: selectedCarrier1.code,
            flightNumFrom: selectedFlight1.flight_number,
            airlineCodeTo: selectedCarrier2.code,
            flightNumTo: selectedFlight2.flight_number,
        }, () => {
            setLoadingSubmit(false)
            setErrorSubmit("")
            setIsError(false)
            onOpenChange(false)
        }, () => {
            setLoadingSubmit(false)
            setErrorSubmit("Failed to add flight")
            setIsError(true)
        })
    }, [backendURL, onAddTransit, onOpenChange, selectedCarrier1, selectedCarrier2, selectedFlight1, selectedFlight2])
    
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
                    <SheetTitle>Add New Transit</SheetTitle>
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
                    <div className="space-y-2">
                        <Label>Airlines Carrier Segment 1</Label>
                        <span className="text-xs text-muted-foreground">(e.g. CX, SQ, Thai Airways, or operated airport in format ap:&#10100;code&#10101;)</span>
                        <DebouncedSearch<Airline>
                            title="Airlines Carrier"
                            selected={selectedCarrier1 ?? null}
                            onSelect={setSelectedCarrier1}
                            results={carriers1}
                            requestMethod="GET"
                            setResults={setCarriers1}
                            loading={loadingCarrier1}
                            setLoading={setLoadingCarrier1}
                            fetchUrl={(q) => `${backendURL}/autocomplete/airline/${q}`}
                            renderItem={(airline) => (
                                <div>
                                {airline.name}, ({airline.code})
                                </div>
                            )}
                            renderSelectedItem={(airline) => (
                                <div>
                                {airline.name}, ({airline.code})
                                </div>
                            )}
                        />
                    </div>

                    {selectedCarrier1 && (
                        <div className="space-y-2">
                            <Label>Flight Number Segment 1</Label>
                            <DebouncedSearch<Flight>
                                title="Search for flight number (e.g. cnx, 123, or bkk,cnx)"
                                selected={selectedFlight1 ?? null}
                                onSelect={setSelectedFlight1}
                                requestMethod="GET"
                                results={carrierFlights1}
                                setResults={setCarrierFlights1}
                                loading={loadingFlight1}
                                setLoading={setLoadingFlight1}
                                fetchUrl={(q) => `${backendURL}/autocomplete/flight/${selectedCarrier1?.code}/${q}`}
                                renderItem={(flight) => (
                                <div className="flex flex-col">
                                    <span className="text-base font-medium">{flight.airlineCode} {flight.flight_number}</span>
                                    <span className="text-xs text-gray-500">{flight.depart_airport} → {flight.arrive_airport}</span>
                                    <span className="text-xs text-gray-500">{flight.departure_time} UTC → {flight.arrival_time} UTC</span>
                                </div>
                                )}
                                renderSelectedItem={(flight) => (
                                <div>
                                    <span className="text-base font-medium">{flight.airlineCode} {flight.flight_number} ({flight.depart_airport} → {flight.arrive_airport})</span>
                                </div>
                                )}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Airlines Carrier Segment 2</Label>
                        <span className="text-xs text-muted-foreground">(e.g. CX, SQ, Thai Airways, or operated airport in format ap:&#10100;code&#10101;)</span>
                        <DebouncedSearch<Airline>
                            title="Airlines Carrier"
                            selected={selectedCarrier2 ?? null}
                            onSelect={setSelectedCarrier2}
                            results={carriers2}
                            requestMethod="GET"
                            setResults={setCarriers2}
                            loading={loadingCarrier2}
                            setLoading={setLoadingCarrier2}
                            fetchUrl={(q) => `${backendURL}/autocomplete/airline/${q}`}
                            renderItem={(airline) => (
                                <div>
                                {airline.name}, ({airline.code})
                                </div>
                            )}
                            renderSelectedItem={(airline) => (
                                <div>
                                {airline.name}, ({airline.code})
                                </div>
                            )}
                        />
                    </div>

                    {selectedCarrier2 && (
                        <div className="space-y-2">
                            <Label>Flight Number Segment 2</Label>
                            <DebouncedSearch<Flight>
                                title="Search for flight number (e.g. cnx, 123, or bkk,cnx)"
                                selected={selectedFlight2 ?? null}
                                onSelect={setSelectedFlight2}
                                requestMethod="GET"
                                results={carrierFlights2}
                                setResults={setCarrierFlights2}
                                loading={loadingFlight2}
                                setLoading={setLoadingFlight2}
                                fetchUrl={(q) => `${backendURL}/autocomplete/flight/${selectedCarrier2?.code}/${q}`}
                                renderItem={(flight) => (
                                <div className="flex flex-col">
                                    <span className="text-base font-medium">{flight.airlineCode} {flight.flight_number}</span>
                                    <span className="text-xs text-gray-500">{flight.depart_airport} → {flight.arrive_airport}</span>
                                    <span className="text-xs text-gray-500">{flight.departure_time} UTC → {flight.arrival_time} UTC</span>
                                </div>
                                )}
                                renderSelectedItem={(flight) => (
                                <div>
                                    <span className="text-base font-medium">{flight.airlineCode} {flight.flight_number} ({flight.depart_airport} → {flight.arrive_airport})</span>
                                </div>
                                )}
                            />
                        </div>
                    )}

                    
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
                                isLoading ||
                                !selectedCarrier1 ||
                                !selectedFlight1 ||
                                !selectedCarrier2 ||
                                !selectedFlight2
                            }>
                            {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                            ) : (
                            "Add Transit"
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
