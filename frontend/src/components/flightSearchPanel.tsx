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
import { format } from "date-fns"
import { CalendarIcon, ChevronDown, ChevronUp, Info, Loader2, MapPin, Plane, Search, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Airport } from "../../type"

interface PassengerType {
  type: "adult" | "child" | "infant"
  count: number
  ageDescription: string
}

export function FlightSearchPanel() {
  const router = useRouter()
  const [tripType, setTripType] = useState("roundtrip")
  const [origin, setOrigin] = useState<Airport | null>(null)
  const [destination, setDestination] = useState<Airport | null>(null)
  const [originSearch, setOriginSearch] = useState("")
  const [destinationSearch, setDestinationSearch] = useState("")
  const [loadingOrigin, setLoadingOrigin] = useState(false)
  const [loadingDestination, setLoadingDestination] = useState(false)
  const [originAirports, setOriginAirports] = useState<Airport[]>([])
  const [destinationAirports, setDestinationAirports] = useState<Airport[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [cabinClass, setCabinClass] = useState("economy")
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

  // Refs for fetch abort controllers
  const originAbortController = useRef<AbortController | null>(null)
  const destinationAbortController = useRef<AbortController | null>(null)

  // Debounce timers
  const originDebounceTimer = useRef<NodeJS.Timeout | null>(null)
  const destinationDebounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Mock airport search function with cancellation support
  const searchAirports = async (
    query: string,
    setLoading: (loading: boolean) => void,
    setResults: (airports: Airport[]) => void,
    abortControllerRef: React.MutableRefObject<AbortController | null>,
  ) => {
    // console.log("searchAirports triggered with query:", query); // Debug log
  
    if (query.length < 2) {
      // console.log("Query too short, clearing results.");
      // setResults([]);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setLoading(true)

    try {
      // In a real app, this would be a fetch to your API
      const response = await fetch(`http://localhost:4000/flight/autocomplete/airport/${query}`, { method:"POST", signal })
      const data = await response.json()

      // console.log("Fetched airports:", data)

      if (!signal.aborted) {
        setResults(data)
        setLoading(false)
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Error searching airports:", err)
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }
  }

  // Debounced search for origin
  const debouncedSearchOrigin = (query: string) => {
    setOriginSearch(query)

    if (originDebounceTimer.current) {
      clearTimeout(originDebounceTimer.current)
    }

    originDebounceTimer.current = setTimeout(() => {
      searchAirports(query, setLoadingOrigin, setOriginAirports, originAbortController)
      // console.log("Origin search:", query, originAirports)
    }, 300)
  }

  // Debounced search for destination
  const debouncedSearchDestination = (query: string) => {
    setDestinationSearch(query)

    if (destinationDebounceTimer.current) {
      clearTimeout(destinationDebounceTimer.current)
    }

    destinationDebounceTimer.current = setTimeout(() => {
      searchAirports(query, setLoadingDestination, setDestinationAirports, destinationAbortController)
    }, 300)
  }

  // Clean up abort controllers on unmount
  useEffect(() => {
    const originAbortControllerSnapshot = originAbortController.current;
    const destinationAbortControllerSnapshot = destinationAbortController.current;
    return () => {
      if (originAbortControllerSnapshot) {
        originAbortControllerSnapshot.abort();
      }
      if (destinationAbortControllerSnapshot) {
        destinationAbortControllerSnapshot.abort();
      }
      if (originDebounceTimer.current) {
        clearTimeout(originDebounceTimer.current);
      }
      if (destinationDebounceTimer.current) {
        clearTimeout(destinationDebounceTimer.current);
      }
    };
  }, [])

  // Update the handlePassengerChange function to implement the correct constraints
  const handlePassengerChange = (type: "adult" | "child" | "infant", increment: boolean) => {
    setPassengers((prev) => {
      const updatedPassengers = [...prev]
      const passengerToUpdate = updatedPassengers.find((p) => p.type === type)
      const adultPassenger = updatedPassengers.find((p) => p.type === "adult")
      const childPassenger = updatedPassengers.find((p) => p.type === "child")
      const infantPassenger = updatedPassengers.find((p) => p.type === "infant")

      if (!passengerToUpdate || !adultPassenger || !childPassenger || !infantPassenger) return prev

      let newCount = increment ? passengerToUpdate.count + 1 : passengerToUpdate.count - 1

      // Apply constraints based on passenger type
      if (type === "adult") {
        // At least 1 adult required
        newCount = Math.max(1, newCount)

        // If reducing adult count, ensure infant count doesn't exceed new adult count
        if (!increment && infantPassenger.count > newCount) {
          infantPassenger.count = newCount
        }
      } else if (type === "child") {
        // Can't have negative counts for children
        newCount = Math.max(0, newCount)

        // Ensure adults + children don't exceed 9
        const adultChildrenTotal = adultPassenger.count + newCount
        if (adultChildrenTotal > 9) {
          newCount = 9 - adultPassenger.count
        }
      } else if (type === "infant") {
        // Can't have negative counts for infants
        newCount = Math.max(0, newCount)

        // Infants cannot exceed adult count
        newCount = Math.min(newCount, adultPassenger.count)
      }

      passengerToUpdate.count = newCount
      return updatedPassengers
    })
  }
  const [fromAirportOpen, setFromAirportOpen] = useState<boolean>(false)
  const [toAirportOpen, setToAirportOpen] = useState<boolean>(false)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Format passenger data for URL
    const adultsCount = passengers.find((p) => p.type === "adult")?.count || 1
    const childrenCount = passengers.find((p) => p.type === "child")?.count || 0
    const infantsCount = passengers.find((p) => p.type === "infant")?.count || 0

    const passengersParam = `${adultsCount},${childrenCount},${infantsCount}`

    // Navigate to search results with query params
    router.push(
      `/search-results?origin=${origin}&destination=${destination}&departDate=${dateRange?.from?.toISOString()}&returnDate=${dateRange?.to?.toISOString()}&passengers=${passengersParam}&cabinClass=${cabinClass}&tripType=${tripType}`,
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8">
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
              <Popover open={fromAirportOpen} onOpenChange={setFromAirportOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={fromAirportOpen}
                  className="w-full justify-between"
                  onClick={() => setFromAirportOpen(true)}
                >
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                    {origin ? (
                      <span>
                        {origin.name}, {origin.short_country} ({origin.code})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Search for airport or city</span>
                    )}
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command className="md:min-w-[450px]">
                  <div className="flex items-center border-b px-3 w-full">
                    {/* <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" /> */}
                    <CommandInput
                      placeholder="City or Airport"
                      value={originSearch}
                      onValueChange={debouncedSearchOrigin}
                      className="md:min-w-[370px]"
                    />
                    {originSearch && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setOriginSearch("")
                          // setOriginAirports([])
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CommandList>
                    {loadingOrigin && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    )}
                    {!loadingOrigin && originSearch.length > 0 && originAirports.length <= 0 ? (
                      <CommandEmpty>No airports found</CommandEmpty>
                    ) : null}
                    {!loadingOrigin && originAirports.length > 0 ? (
                      <CommandGroup>
                        {originAirports.map((airport) => {
                          return (
                            <CommandItem
                            key={airport.code}
                            value={`${airport.city} ${airport.code} ${airport.name} ${airport.country}`}
                            onSelect={() => {
                              setOrigin(airport)
                              setFromAirportOpen(false)
                            }}
                            >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {airport.name} ({airport.code})
                              </span>
                              <span className="text-xs text-gray-500">
                                {airport.city}, {airport.country}
                              </span>
                            </div>
                          </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    ) : null}

                    {!loadingOrigin && originSearch.length < 2 && (
                      <div className="px-3 py-6 text-center text-sm text-gray-500">
                        Type at least 2 characters to search for airports
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="text-sm font-medium">
              To
            </Label>
            <div className="relative">
            <Popover open={toAirportOpen} onOpenChange={setToAirportOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={toAirportOpen}
                  className="w-full justify-between"
                  onClick={() => setToAirportOpen(true)}
                >
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                    {destination ? (
                      <span>
                        {destination.city} {destination.short_country} ({destination.code})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Search for airport or city</span>
                    )}
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command className='md:min-w-[450px]'>
                  <div className="flex items-center border-b px-3 w-full">
                    {/* <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" /> */}
                    <CommandInput
                      placeholder="City or Airport"
                      value={destinationSearch}
                      onValueChange={debouncedSearchDestination}
                      className="md:min-w-[370px]"
                    />
                    {destinationSearch && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setDestinationSearch("")
                          setDestinationAirports([])
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CommandList>
                    {loadingDestination && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    )}
                    {!loadingDestination && destinationSearch.length > 0 && destinationAirports.length === 0 && (
                      <CommandEmpty>No airports found</CommandEmpty>
                    )}
                    {!loadingDestination && destinationAirports.length > 0 && (
                      <CommandGroup>
                        {destinationAirports.map((airport) => (
                          <CommandItem
                            key={airport.code}
                            value={`${airport.city} ${airport.code} ${airport.name} ${airport.country}`}
                            onSelect={() => {
                              setDestination(airport)
                              setToAirportOpen(false)
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {airport.name} ({airport.code})
                              </span>
                              <span className="text-xs text-gray-500">
                                {airport.city}, {airport.country}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {!loadingDestination && destinationSearch.length < 2 && (
                      <div className="px-3 py-6 text-center text-sm text-gray-500">
                        Type at least 2 characters to search for airports
                      </div>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-range" className="text-sm font-medium">
            Travel Dates
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-range"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  tripType === "roundtrip" && dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  "Select date(s)"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {tripType === "roundtrip" ? (
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                  defaultMonth={new Date()}
                />
              ) : (
                <Calendar
                  initialFocus
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={(date) => setDateRange({ from: date, to: undefined })}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                  defaultMonth={new Date()}
                />
              )}
            </PopoverContent>
          </Popover>
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
              <SelectTrigger id="cabin-class">
                <SelectValue placeholder="Select cabin class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Economy</SelectItem>
                <SelectItem value="premium_economy">Premium Economy</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="first">First Class</SelectItem>
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

