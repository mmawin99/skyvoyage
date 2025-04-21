/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, addDays, set } from "date-fns"
import { CalendarIcon, ChevronDown, ChevronUp, Info, Loader2, MapPin, Plane, Search, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DateRange, DayProps } from "react-day-picker"
import { Airport, AuthSession } from "@/types/type"
import { useBackendURL } from "./backend-url-provider"
import { DebouncedSearch } from "./reusable/search"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
interface PassengerType {
  type: "adult" | "child" | "infant"
  count: number
  ageDescription: string
}

export function FlightSearchPanel() {
  const router = useRouter();
  const {backend:backendURL, setBackend, status} = useBackendURL(); 
  const { data: sessionData, status:authStatus } = useSession() as { data: AuthSession | null; status: string }
  const [tripType, setTripType] = useState("roundtrip")
  
  const [origin, setOrigin] = useState<Airport | null>(null)
  const [loadingOrigin, setLoadingOrigin] = useState<boolean>(false)
  const [originAirports, setOriginAirports] = useState<Airport[]>([])
  
  const [destination, setDestination] = useState<Airport | null>(null)
  const [loadingDestination, setLoadingDestination] = useState<boolean>(false)
  const [destinationAirports, setDestinationAirports] = useState<Airport[]>([])
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [openDepartureDate, setOpenDepartureDate] = useState(false)
  const [openReturnDate, setOpenReturnDate] = useState(false)
  const [cabinClass, setCabinClass] = useState("Y")
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const [alertCode, setAlertCode] = useState<string>("")

  // Remove the expanded state and related code
  // const [expanded, setExpanded] = useState(false)
  // const [activeField, setActiveField] = useState<string | null>(null)
  // const panelRef = useRef<HTMLDivElement>(null)

  // Passenger state with types
  const [passengers, setPassengers] = useState<PassengerType[]>([
    { type: "adult", count: 1, ageDescription: "12+ years" },
    { type: "child", count: 0, ageDescription: "2-11 years" },
    { type: "infant", count: 0, ageDescription: "0-23 months" },
  ])

  const totalPassengers = passengers.reduce((sum, passenger) => sum + passenger.count, 0)

  // Background images for carousel
  const backgroundImages = [
    "/placeholder.svg?height=1200&width=2000",
    "/placeholder.svg?height=1200&width=2000",
    "/placeholder.svg?height=1200&width=2000",
  ]

  // Add this helper function to get the current counts
  const adultCount = passengers.find((p) => p.type === "adult")?.count || 1
  const childCount = passengers.find((p) => p.type === "child")?.count || 0
  const infantCount = passengers.find((p) => p.type === "infant")?.count || 0

  const handleDepartureDateSelect = (newDateRange: DateRange | undefined) => {
    if (!newDateRange) return

    // If only selecting departure date, keep the existing return date if any
    const updatedRange = {
      from: newDateRange.from,
      to: dateRange?.to || (tripType === "roundtrip" ? addDays(newDateRange.from ?? new Date(), 7) : undefined),
    }
    setDateRange(updatedRange)
    setOpenDepartureDate(false)
  }

  // Handle return date selection
  const handleReturnDateSelect = (newDateRange: DateRange | undefined) => {
    if (!newDateRange || !newDateRange.to) return

    // When selecting return date, ensure it's after the departure date
    const updatedRange = {
      from: dateRange?.from || new Date(),
      to: newDateRange.to,
    }
    setDateRange(updatedRange)
    setOpenReturnDate(false)
  }

  // Update the handlePassengerChange function to implement the correct constraints
  const handlePassengerChange = (type: "adult" | "child" | "infant", increment: boolean) => {
    // console.log("Passenger type:", type, "Increment:", increment)
    console.log("triggered")
    setPassengers((prev) =>
          prev.map((p) => {
            let newCount = p.count;
    
            if (p.type === type) {
              if (increment) {
                newCount += 1;
              } else {
                newCount -= 1;
              }
    
              // Constraints
              if (type === "adult") {
                newCount = Math.max(1, newCount);
                const infant = prev.find((x) => x.type === "infant");
                if (!increment && infant && infant.count > newCount) {
                  // Adjust infants
                  return prev.map((x) =>
                    x.type === "infant" ? { ...x, count: newCount } : x
                  );
                }
              } else if (type === "child") {
                newCount = Math.max(0, newCount);
                const adult = prev.find((x) => x.type === "adult");
                const total = (adult?.count || 0) + newCount;
                if (total > 9) newCount = 9 - (adult?.count || 0);
              } else if (type === "infant") {
                newCount = Math.max(0, newCount);
                const adult = prev.find((x) => x.type === "adult");
                newCount = Math.min(newCount, adult?.count || 0);
              }
    
              return { ...p, count: newCount };
            }
    
            return p;
          }).flat()
        );
  }
  const [fromAirportOpen, setFromAirportOpen] = useState<boolean>(false)
  const [toAirportOpen, setToAirportOpen] = useState<boolean>(false)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!origin || !destination) {
      setAlertCode("origin-destination")
      setAlertOpen(true)
      return
    }

    if (!dateRange?.from) {
      setAlertCode("departure-date")
      setAlertOpen(true)
      return
    }

    if (tripType === "roundtrip" && !dateRange.to) {
      setAlertCode("return-date")
      setAlertOpen(true)
      return
    }

    if(tripType === "roundtrip") {
      if(dateRange?.from && dateRange?.to && dateRange.from > dateRange.to) {
        setAlertCode("return-date-invalid")
        setAlertOpen(true)
        return
      }
    }

    // Format passenger data for URL
    const adultsCount = passengers.find((p) => p.type === "adult")?.count || 1
    const childrenCount = passengers.find((p) => p.type === "child")?.count || 0
    const infantsCount = passengers.find((p) => p.type === "infant")?.count || 0

    const passengersParam = `${adultsCount},${childrenCount},${infantsCount}`

    // Navigate to search results with query params
    if (sessionData && sessionData?.user?.role === "user") {
      router.push(
        `/search-results?origin=${origin.code}&destination=${destination.code}&departDate=${dateRange.from.toISOString()}&returnDate=${
          dateRange.to ? dateRange.to.toISOString() : ""
        }&passengers=${passengersParam}&cabinClass=${cabinClass}&tripType=${tripType}`,
      )
    }else{
      setDialogOpen(true)
    }
  }
  // console.log(authStatus)
  useEffect(() => {
      if (!dateRange) {
        const today = new Date()
        const nextWeek = addDays(today, 7)
        setDateRange({
          from: today,
          to: tripType === "roundtrip" ? nextWeek : undefined,
        })
      } else if (tripType === "oneway" && dateRange.to) {
        // If switching to one-way, remove the return date
        setDateRange({
          from: dateRange.from,
          to: undefined,
        })
      } else if (tripType === "roundtrip" && !dateRange.to && dateRange.from) {
        // If switching to round-trip and no return date, set a default return date
        setDateRange({
          from: dateRange.from,
          to: addDays(dateRange.from, 7),
        })
      }
  }, [tripType, dateRange])

  const handleDialogOpenChange = (newOpen: boolean) => {
    setDialogOpen(newOpen)
  }
  const handleAlertOpenChange = (newOpen: boolean) => {
    setAlertOpen(newOpen)
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8">
      <AlertDialog open={alertOpen} onOpenChange={handleAlertOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><span className="text-red-500">Error! </span>
              {
                alertCode === "origin-destination" && (
                  <span>Origin and Destination</span>
                )  
              }
              {
                alertCode === "departure-date" && (
                  <span>Departure Date</span>
                )  
              }
              {
                alertCode === "return-date" && (
                  <span>Return Date</span>
                )  
              }
              {
                alertCode === "return-date-invalid" && (
                  <span>Return Date</span>
                )  
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {
                alertCode === "origin-destination" && (
                  <span>Please select both origin and destination airports.</span>
                )
              }
              {
                alertCode === "departure-date" && (
                  <span>Please select a departure date.</span>
                )
              }
              {
                alertCode === "return-date" && (
                  <span>Please select a return date.</span>
                )
              }
              {
                alertCode === "return-date-invalid" && (
                  <span>Please select a valid return date.</span>
                )
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Signin Required</AlertDialogTitle>
            <AlertDialogDescription>
              Please sign in to complete your journey.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={()=>{ router.push("/account/auth") }}>Sign In</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <form onSubmit={handleSearch} className="space-y-6">
        <Tabs defaultValue="roundtrip" onValueChange={setTripType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roundtrip" className="text-sm">
              <Plane className="mr-2 h-4 w-4 rotate-45" />
              Round Trip
            </TabsTrigger>
            <TabsTrigger value="oneway" className="text-sm">
              <Plane className="mr-2 h-4 w-4" />
              One Way
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin" className="text-sm font-medium">
              From
            </Label>
            <div className="relative">
              <DebouncedSearch<Airport>
                title="Airport or city"
                selected={origin}
                onSelect={setOrigin}
                results={originAirports}
                setResults={setOriginAirports}
                loading={loadingOrigin}
                setLoading={setLoadingOrigin}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="text-sm font-medium">
              To
            </Label>
            <div className="relative">
              <DebouncedSearch<Airport>
                title="Airport or city"
                selected={destination}
                onSelect={setDestination}
                results={destinationAirports}
                setResults={setDestinationAirports}
                loading={loadingDestination}
                setLoading={setLoadingDestination}
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departure-date" className="text-sm font-medium">
              Departure Date
            </Label>
            <Popover open={openDepartureDate} onOpenChange={setOpenDepartureDate}>
              <PopoverTrigger asChild>
                <Button
                  id="departure-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : "Select departure date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={(date) => {
                    if (date) {
                       handleDepartureDateSelect({ from: date, to: dateRange?.to })
                    }
                  }}
                  numberOfMonths={2}
                  pagedNavigation
                  showOutsideDays={true}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  defaultMonth={dateRange?.from || new Date()}
                  // components={{
                  //   Day: ({ day, modifiers,...props }: DayProps) => {
                  //     return (
                  //       <div
                  //         {...props}
                  //         onClick={(e)=>{
                  //           if (modifiers.disabled) return
                  //           if(modifiers.outside) return
                  //           handleDepartureDateSelect({ from: day.date, to: dateRange?.to })
                  //         }}
                  //         className={cn(
                  //           "text-[1rem] flex flex-col items-center justify-center w-12 h-12 rounded-md p-2 cursor-pointer",
                  //           !modifiers.disabled && "hover:bg-gray-300/40",
                  //           modifiers.selected && "!bg-primary !text-white cursor-pointer",
                  //           modifiers.today && "bg-blue-100 text-blue-600 cursor-pointer",
                  //           modifiers.disabled && "text-gray-400 cursor-not-allowed",
                  //           modifiers.outside && "text-gray-400 cursor-not-allowed",
                  //           modifiers.focused && "bg-green-100 text-blue-600 cursor-pointer",
                  //           modifiers.hidden && "hidden cursor-not-allowed",
                  //         )}
                  //       >
                  //         <span 
                  //         className={cn(
                  //           modifiers.outside && "hidden"
                  //         )
                  //         }
                  //         >{day.date.getDate()}</span>
                  //         <span className={cn(
                  //           "text-[.77rem]",
                  //           !modifiers.outside && !modifiers.disabled && "!text-green-400",
                  //           modifiers.outside && "text-gray-400 !hidden",
                  //           modifiers.selected && "!text-green-400 !font-black",
                  //           modifiers.today && "text-green-400",
                  //           modifiers.focused && "text-green-400",
                  //           modifiers.hidden && "text-green-400 !hidden",
                  //           modifiers.disabled && "text-gray-400 !hidden",
                  //         )}>${(Math.floor(Math.random() * 100) + 100)}</span>
                  //       </div>
                  //     )
                  //   }
                  // }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {tripType === "roundtrip" && (
            <div className="space-y-2">
              <Label htmlFor="return-date" className="text-sm font-medium">
                Return Date
              </Label>
              <Popover open={openReturnDate} onOpenChange={setOpenReturnDate}>
                <PopoverTrigger asChild>
                  <Button
                    id="return-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.to && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "Select return date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                  mode="single"
                  selected={dateRange?.to}
                  onSelect={(date) => {
                    if (date) {
                       handleReturnDateSelect({ from: dateRange?.from, to: date })
                    }
                  }}
                  numberOfMonths={2}
                  pagedNavigation
                  showOutsideDays={true}
                  disabled={(date) => date < new Date(new Date(dateRange?.from || "").setHours(0, 0, 0, 0))}
                  defaultMonth={dateRange?.to || new Date()}
                  // components={{
                  //   Day: ({ day, modifiers,...props }: DayProps) => {
                  //     return (
                  //       <div
                  //         {...props}
                  //         onClick={(e)=>{
                  //           if (modifiers.disabled) return
                  //           if(modifiers.outside) return
                  //           handleReturnDateSelect({ from: dateRange?.from, to: day.date })
                  //         }}
                  //         className={cn(
                  //           "text-[1rem] flex flex-col items-center justify-center w-12 h-12 rounded-md p-2 cursor-pointer",
                  //           !modifiers.disabled && "hover:bg-gray-300/40",
                  //           modifiers.selected && "!bg-primary !text-white cursor-pointer",
                  //           modifiers.today && "bg-blue-100 text-blue-600 cursor-pointer",
                  //           modifiers.disabled && "text-gray-400 cursor-not-allowed",
                  //           modifiers.outside && "text-gray-400 cursor-not-allowed",
                  //           modifiers.focused && "bg-green-100 text-blue-600 cursor-pointer",
                  //           modifiers.hidden && "hidden cursor-not-allowed",
                  //         )}
                  //       >
                  //         <span 
                  //         className={cn(
                  //           modifiers.outside && "hidden"
                  //         )
                  //         }
                  //         >{day.date.getDate()}</span>
                  //         <span className={cn(
                  //           "text-[.77rem]",
                  //           !modifiers.outside && !modifiers.disabled && "!text-green-400",
                  //           modifiers.outside && "text-gray-400 !hidden",
                  //           modifiers.selected && "!text-green-400 !font-black",
                  //           modifiers.today && "text-green-400",
                  //           modifiers.focused && "text-green-400",
                  //           modifiers.hidden && "text-green-400 !hidden",
                  //           modifiers.disabled && "text-gray-400 !hidden",
                  //         )}>${(Math.floor(Math.random() * 100) + 100)}</span>
                  //       </div>
                  //     )
                  //   }
                  // }}
                />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passengers" className="text-sm font-medium">
              Passengers
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between" id="passengers">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-gray-400" />
                    <span>
                      {totalPassengers} {totalPassengers === 1 ? "Passenger" : "Passengers"}
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h4 className="font-medium">Passenger Types</h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Info className="h-3 w-3 mr-1" />
                      <span>Max 9 passengers</span>
                    </div>
                  </div>

                  {passengers.map((passenger) => (
                    <div key={passenger.type} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{passenger.type}</p>
                        <p className="text-xs text-gray-500">{passenger.ageDescription}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePassengerChange(passenger.type, false)}
                          disabled={
                            (passenger.type === "adult" && passenger.count <= 1) ||
                            (passenger.type !== "adult" && passenger.count <= 0)
                          }
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{passenger.count}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePassengerChange(passenger.type, true)}
                          disabled={
                            (passenger.type === "adult" && adultCount + childCount >= 9) ||
                            (passenger.type === "child" && adultCount + childCount >= 9) ||
                            (passenger.type === "infant" &&
                              passenger.count >= (passengers.find((p) => p.type === "adult")?.count || 0))
                          }
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Info message about infant limits */}
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md flex items-start mt-2">
                    <Info className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                    <p>Maximum 9 passengers (adults + children). Infants don&apos;t count toward this limit.</p>
                  </div>

                  {(() => {
                    const infantPassenger = passengers.find((p) => p.type === "infant");
                    return infantPassenger?.count !== undefined && infantPassenger.count > 0;
                  })() && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md flex items-start mt-4">
                      <Info className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                      <p>Infants (0-23 months) must sit on an adult&apos;s lap during the flight. One infant per adult.</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cabin-class" className="text-sm font-medium">
              Cabin Class
            </Label>
            <Select value={cabinClass} onValueChange={setCabinClass}>
              <SelectTrigger id="cabin-class" className="w-full">
                <SelectValue placeholder="Select cabin class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Y">Economy</SelectItem>
                <SelectItem value="W">Premium Economy</SelectItem>
                <SelectItem value="C">Business</SelectItem>
                <SelectItem value="F">First Class</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
        >
          <Search className="mr-2 h-4 w-4" />
          Search Flights
        </Button>
      </form>
    </div>
  )
}

