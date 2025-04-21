/* eslint-disable @typescript-eslint/no-unused-vars */
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Clock, Filter, Loader2, Plane, TriangleAlert } from "lucide-react"
import { FareType, UniversalFlightSchedule, UniversalFlightSegmentSchedule } from "@/types/type"
import { NextRouter, useRouter } from "next/router"
import { useBackendURL } from "@/components/backend-url-provider"
import { useSession } from "next-auth/react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Navbar } from "@/components/navbar"
import { AppFooter } from "@/components/footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import FlightCard from "@/components/flight-card"
import { cabinClassPrice } from "@/lib/price"
import { Badge } from "@/components/ui/badge"

interface searchSelectedFlight {
  selectedFare:FareType, 
  flightId: string, 
  flight:UniversalFlightSchedule
  price: number
}

export default function SearchResults() {
  const router:NextRouter = useRouter()
  const {backend:backendURL} = useBackendURL()
  const {data:sessionData} = useSession()

  // const searchParams = useSearchParams()
  // const origin = searchParams.get("origin")
  // const destination = searchParams.get("destination")
  // const departDateStr = searchParams.get("departDate")
  // const returnDateStr = searchParams.get("returnDate")
  // const passengersStr = searchParams.get("passengers") || "1,0,0" // Default to 1 adult, 0 children, 0 infants
  // const cabinClass = searchParams.get("cabinClass") || "Y"
  // const tripType = searchParams.get("tripType") || "roundtrip"
  const [flightType, setFlightType] = useState("direct")
  const [queryParams, setQueryParams] = useState({
    origin: '',
    destination: '',
    departDateStr: '',
    returnDateStr: '',
    passengersStr: '1,0,0',
    cabinClass: 'Y',
    tripType: 'roundtrip'
  });
  
  // Parse passenger counts
  const [adultCount] = queryParams.passengersStr.split(",").map(Number)
  const [childCount] = queryParams.passengersStr.split(",").map(Number).slice(1)
  const [infantCount] = queryParams.passengersStr.split(",").map(Number).slice(2)
  const allTotalPassengers = adultCount + childCount + infantCount
  const totalPassengers = adultCount + childCount
  const [departFlights, setDepartFlights] = useState<UniversalFlightSchedule[]>([])
  const [departFilteredFlights, setDepartFilteredFlights] = useState<UniversalFlightSchedule[]>([])
  const [returnFlights, setReturnFlights] = useState<UniversalFlightSchedule[]>([])
  const [returnFilteredFlights, setReturnFilteredFlights] = useState<UniversalFlightSchedule[]>([])
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [airlines, setAirlines] = useState<{code:string, name:string}[]>([])
  const [selectedAirlines, setSelectedAirlines] = useState<{code:string, name:string}[]>([])
  const [loading, setLoading] = useState(true)

  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [maxPrice,setMaxPrice] = useState(0)
  const [minPrice,setMinPrice] = useState(0)
  const refSearchParams = useRef(false)
  
  
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<searchSelectedFlight>()
  const [isSelectedDepartureFlight, setIsSelectedDepartureFlight] = useState<boolean>(false)
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<searchSelectedFlight>()
  const [isSelectedReturnFlight, setIsSelectedReturnFlight] = useState<boolean>(false)
  useEffect(() => {
    const searParamsExecute = ()=>{
      console.log("searchParams Finder")
      const searchParams = new URLSearchParams(window.location.search);
      setQueryParams({
        origin: searchParams.get("origin") || '',
        destination: searchParams.get("destination") || '',
        departDateStr: searchParams.get("departDate") || '',
        returnDateStr: searchParams.get("returnDate") || '',
        passengersStr: searchParams.get("passengers") || "1,0,0",
        cabinClass: searchParams.get("cabinClass") || "Y",
        tripType: searchParams.get("tripType") || "roundtrip"
      });
      console.log("searchParams",queryParams)
    }
    if (!refSearchParams.current) {
      searParamsExecute()
      refSearchParams.current = true
    }
    return () => {
      refSearchParams.current = true;
    }
  }, [queryParams]);
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!backendURL) {
        console.log("Backend URL is not set", backendURL);
        return;
      }
      if (
        !queryParams.origin ||
        !queryParams.destination ||
        !queryParams.departDateStr) {
        console.log("Query parameters are not set", queryParams);
        return;
      }
  
      clearInterval(interval); // ✅ All checks passed, stop polling
      setLoading(true);
  
      try {
        const departData = await fetch(`${backendURL}/flight/flightList`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: queryParams.origin,
            to: queryParams.destination,
            passengerCount: totalPassengers,
            date: queryParams.departDateStr.split("T")[0],
            class: queryParams.cabinClass,
            transitCount: flightType === 'direct' ? 0 : 1,
          })
        });
  
        let returnData;
        if (queryParams.tripType !== "oneway") {
          returnData = await fetch(`${backendURL}/flight/flightList`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: queryParams.destination,
              to: queryParams.origin,
              passengerCount: totalPassengers,
              date: queryParams.returnDateStr.split("T")[0],
              class: queryParams.cabinClass,
              transitCount: flightType === 'direct' ? 0 : 1,
            })
          });
        }
  
        if (!departData.ok || (queryParams.tripType !== "oneway" && !returnData?.ok)) {
          setIsError(true);
          setErrorMessage("Failed to fetch flight data");
          return;
        }
  
        const departJSON = await departData.json();
        let returnJSON = null;
        if (queryParams.tripType !== "oneway") returnJSON = await returnData?.json();
  
        setDepartFlights(departJSON["data"] || []);
        setReturnFlights(returnJSON?.["data"] ?? []);
        setDepartFilteredFlights(departJSON["data"] || []);
        setReturnFilteredFlights(returnJSON?.["data"] ?? []);
  
        const allAirlines = [
          ...departJSON["data"].flatMap((flight: UniversalFlightSchedule) =>
            flight.segments.map((segment: UniversalFlightSegmentSchedule) => ({
              code: segment.airlineCode,
              name: segment.airlineName,
            }))
          ),
          ...(returnJSON?.["data"]?.flatMap((flight: UniversalFlightSchedule) =>
            flight.segments.map((segment: UniversalFlightSegmentSchedule) => ({
              code: segment.airlineCode,
              name: segment.airlineName,
            }))
          ) || []),
        ];
  
        const uniqueAirlines = Array.from(
          new Map(allAirlines.map(airline => [airline.code, airline])).values()
        );
        setAirlines(uniqueAirlines);
        setSelectedAirlines(uniqueAirlines);
  
        const allFlights = [...departJSON["data"], ...(returnJSON?.["data"] || [])];
        const prices = allFlights.map((flight: UniversalFlightSchedule) => flight.price.SUPER_SAVER).filter((price: number) => price !== -1);
        if (prices.length > 0) {
          setMinPrice(Math.min(...prices));
          setMaxPrice(Math.max(...prices));
        }
      } catch (error) {
        setIsError(true);
        setErrorMessage("Something went wrong while fetching flights");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 1000); // Check every second
  
    return () => clearInterval(interval); // Clean up interval on unmount
  }, [backendURL, queryParams, flightType, totalPassengers]);


  const flightInfo = (flight: searchSelectedFlight | undefined, cabinClass: "Y" | "C" | "W" | "F") => {
    if (!flight) return null
    return flight.flight.segments.map((segment: UniversalFlightSegmentSchedule, index: number) => (
      <div key={index} className="flex items-center gap-2 pl-3">
        <div className="text-sm text-gray-600 flex flex-row items-center gap-2">
          {segment.airlineName} ({segment.airlineCode} {segment.flightNum.split("-")[0]})
          <Badge variant="outline">{flight.flight.segments.length == 1 ? "Direct Flight" : "Flight Segments "+index + 1}</Badge>
          <Badge variant="default">
            {cabinClass === "Y" ? "Economy Class" : cabinClass === "C" ? "Business Class" : cabinClass === "F" ? "First Class" : cabinClass === "W" ? "Premium Economy" : ""}
          </Badge>
        </div>
      </div>
    ))
  }
  const handleAirlineChange = (airline: {code:string, name:string}, checked: boolean) => {
    if (checked) {
      setSelectedAirlines([...selectedAirlines, airline])
    } else {
      setSelectedAirlines(selectedAirlines.filter((a) => a !== airline))
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Format passenger information for display
  const calculateTotalPrice = (total_price: number) => {
    let totalPrice = 0
    if (adultCount > 0) {
      totalPrice += adultCount * total_price
    }
    if (childCount > 0) {
      totalPrice += Math.floor(childCount * (total_price * 0.75))
    }
    if (infantCount > 0) {
      totalPrice += Math.floor(infantCount * (total_price * 0.2377))
    }
    return totalPrice
  }
  const formatPassengerInfo = () => {
    const parts = []
    if (adultCount > 0) parts.push(`${adultCount} ${adultCount === 1 ? "Adult" : "Adults"}`)
    if (childCount > 0) parts.push(`${childCount} ${childCount === 1 ? "Child" : "Children"}`)
    if (infantCount > 0) parts.push(`${infantCount} ${infantCount === 1 ? "Infant" : "Infants"}`)
    return parts.join(", ")
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">
          Flights from {queryParams.origin} to {queryParams.destination}
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters */}
          <div className="w-full md:w-1/4 md:sticky md:top-20 self-start h-fit">
            <Card className="max-h-screen overflow-auto">
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  <h2 className="text-lg font-semibold">Filters</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <Slider
                    defaultValue={priceRange}
                    min={0}
                    max={maxPrice}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <Separator />
                <div>
                  <h3 className="font-medium mb-3">Transit</h3>
                  <RadioGroup defaultValue="direct" value={flightType} onValueChange={(value) => setFlightType(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="direct" id="r1" />
                      <Label htmlFor="r1">Direct Flight</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1stop" id="r2" />
                      <Label htmlFor="r2">Transit (1 Stop)</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Airlines</h3>
                  <div className="space-y-2">
                    {airlines.map((airline) => (
                      <div key={airline.code} className="flex items-center space-x-2">
                        <Checkbox
                          id={`airline-${airline.code}`}
                          checked={selectedAirlines.some(selected => selected.code === airline.code)}
                          onCheckedChange={(checked) => handleAirlineChange(airline, checked as boolean)}
                        />
                        <Label htmlFor={`airline-${airline.code}`}>{airline.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flight Results */}
          <div className="w-full md:w-3/4">
            {
            isError ? (
              <Alert variant="destructive" className="mb-4">
                <TriangleAlert className="h-6 w-6" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : 
            loading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" />
                <p className="text-lg">Searching for the best flights...</p>
              </div>
            ) : departFilteredFlights.length === 0 || (returnFilteredFlights.length === 0 && queryParams.tripType == "roundtrip") ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Plane className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No flights found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search for different dates.</p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
              </div>
            ) : (
              !isSelectedDepartureFlight ? 
              <div className="space-y-4">
                <div className="">
                  <h2 className="mb-2 font-bold">Departure Flight</h2>
                  {
                    departFilteredFlights.map((flight) => {
                      return (
                        <FlightCard
                          key={flight.id + '_flightdepart' }
                          flight={flight}
                          onSelect={({ selectedFare, flightId }: { selectedFare: FareType | null, flightId: string }) => {
                            if (selectedFare) {
                              setSelectedDepartureFlight({
                                selectedFare: selectedFare,
                                flightId,
                                flight,
                                price: cabinClassPrice(flight.price[selectedFare], queryParams.cabinClass as "Y" | "C" | "F" | "W", 
                                  selectedFare)
                              });
                              setIsSelectedDepartureFlight(true);
                            }
                          }}
                          cabinclass={queryParams.cabinClass as "Y" | "W" | "C" | "F"}
                        />
                      )
                    })
                  }
                </div>
              </div> : queryParams.tripType === "roundtrip" && !isSelectedReturnFlight ? (
              <div className="space-y-4">
                <div className="">
                  <h2 className="mb-2 font-bold">Return Flight</h2>
                  {
                    returnFilteredFlights.map((flight) => {
                      return (
                        <FlightCard
                          key={flight.id + '_flightreturn' }
                          flight={flight}
                          onSelect={({ selectedFare, flightId }: { selectedFare: FareType | null, flightId: string }) => {
                            if (selectedFare) {
                              setSelectedReturnFlight({
                                selectedFare: selectedFare,
                                flightId,
                                flight,
                                price: cabinClassPrice(flight.price[selectedFare], queryParams.cabinClass as "Y" | "C" | "F" | "W", 
                                  selectedFare)
                              });
                              setIsSelectedReturnFlight(true);
                            }
                          }}
                          cabinclass={queryParams.cabinClass as "Y" | "W" | "C" | "F"}
                        />
                      )
                    })
                  }
                </div>
              </div>) :(
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <h3 className="font-bold text-xl">Summarize your journey {queryParams.origin} → {queryParams.destination}{queryParams.tripType == "roundtrip" ? " and back!" : "!"} </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-7">
                      <div className="text-gray-500 col-span-3 flex flex-col gap-2">
                        <span>Departure Flight ({queryParams.origin} → {queryParams.destination})</span>
                        <div>{flightInfo(selectedDepartureFlight, queryParams?.cabinClass as "Y" | "C" | "W" | "F")}</div>  
                      </div>
                      <div className="font-semibold col-span-2 text-center">{formatDuration(selectedDepartureFlight?.flight.duration ?? 0)}</div>
                      <div className="font-semibold col-span-2 text-right">${selectedDepartureFlight?.price}</div>
                    </div>
                    {
                      queryParams.tripType == "roundtrip" ? 
                        <div className="grid grid-cols-7">
                          <div className="text-gray-500 col-span-3 flex flex-col gap-2">
                            <span>Return Flight ({queryParams.destination} → {queryParams.origin})</span>
                            <div>{flightInfo(selectedReturnFlight, queryParams?.cabinClass as "Y" | "C" | "W" | "F")}</div>  
                          </div>
                          <div className="font-semibold col-span-2 text-center">{formatDuration(selectedReturnFlight?.flight.duration ?? 0)}</div>
                          <div className="font-semibold col-span-2 text-right">${selectedReturnFlight?.price}</div>
                        </div>
                      : null
                    }
                    <Separator />
                    <div className="grid grid-cols-7">
                      <div className="text-gray-500 col-span-5 text-right">Passenger Information</div>
                      <div className="font-semibold col-span-2 text-right">{formatPassengerInfo()}</div>
                    </div>
                    <div className="grid grid-cols-7">
                      <div className="text-gray-500 col-span-5 text-right">Total Fare: </div>
                      <div className="font-semibold col-span-2 text-right">${calculateTotalPrice((selectedDepartureFlight?.price ?? 0) + (selectedReturnFlight?.price ?? 0))}</div>
                    </div>
                    <div className="grid grid-cols-7">
                      <div className="text-gray-500 col-span-7 text-right text-xs">{queryParams.tripType == "roundtrip" ? "Round trip" : "One way"} price for all passengers (including taxes, fees and discounts).
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button onClick={() => router.push("/checkout")}>
                  Fill out Passenger Information
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              )
            )}
          </div>
        </div>
      </div>
      <AppFooter />
    </main>
  )
}
