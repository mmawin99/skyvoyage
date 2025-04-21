/* eslint-disable @typescript-eslint/no-unused-vars */
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Clock, Filter, Loader2, Plane, TriangleAlert } from "lucide-react"
import { UniversalFlightSchedule, UniversalFlightSegmentSchedule } from "@/types/type"
import { NextRouter, useRouter } from "next/router"
import { useBackendURL } from "@/components/backend-url-provider"
import { useSession } from "next-auth/react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Navbar } from "@/components/navbar"
import { AppFooter } from "@/components/footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import FlightCard from "@/components/flight-card"

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
  
  useEffect(() => {
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
  }, []);
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
  useEffect(() => {
    // In a real app, we would fetch flights from an API
    // For now, we'll use mock data
    setLoading(true)
    setTimeout(async () => {
      if(backendURL === "" || backendURL === undefined) return
      if(!queryParams.origin || !queryParams.destination || !queryParams.departDateStr || !queryParams.returnDateStr) return
      const departData = await fetch(`${backendURL}/flight/flightList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: queryParams.origin,
          to: queryParams.destination,
          passengerCount: totalPassengers,
          date: queryParams.departDateStr.split("T")[0],
          class: queryParams.cabinClass,
          transitCount: flightType === 'direct' ? 0 : flightType === '1stop' ? 1 : 2,
        })
      })
      let returnData;
      if(queryParams.tripType !== "oneway") {
        returnData = await fetch(`${backendURL}/flight/flightList`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: queryParams.destination,
            to: queryParams.origin,
            passengerCount: totalPassengers,
            date: queryParams.returnDateStr.split("T")[0],
            class: queryParams.cabinClass,
            transitCount: flightType === 'direct' ? 0 : flightType === '1stop' ? 1 : 2,
          })
        })
      }

      if(!departData.ok || (queryParams.tripType !== "oneway" && !returnData?.ok)) {
        setLoading(false)
        setIsError(true)
        setErrorMessage("Failed to fetch flight data")
        return
      }

      const departJSON = await departData.json()
      let returnJSON;
      if(queryParams.tripType !== "oneway") returnJSON = await returnData?.json()

      console.log(departJSON, returnJSON)

      setDepartFlights(departJSON["data"] || [])
      setReturnFlights(returnJSON["data"] || [])
      setDepartFilteredFlights(departJSON["data"] || [])
      setReturnFilteredFlights(returnJSON?.["data"] || [])
      // Extract unique airlines
      const allAirlines = [
        ...departJSON["data"].flatMap((flight: UniversalFlightSchedule) =>
          flight.segments.map((segment: UniversalFlightSegmentSchedule) => ({
            code: segment.airlineCode,
            name: segment.airlineName,
          }))
        ),
        ...returnJSON?.["data"].flatMap((flight: UniversalFlightSchedule) =>
          flight.segments.map((segment: UniversalFlightSegmentSchedule) => ({
            code: segment.airlineCode,
            name: segment.airlineName,
          }))
        ) ?? [],
      ];
      
      const uniqueAirlines = Array.from(
        new Map(allAirlines.map(airline => [airline.code, airline])).values()
      );
      console.log(uniqueAirlines)
      // const uniqueAirlines = Array.from(new Set(data.map((flight) => flight.airline)))
      setAirlines(uniqueAirlines)
      setSelectedAirlines(uniqueAirlines)

      // Find min and max prices
      const allFlights = [...departJSON["data"], ...returnJSON?.["data"]]
      const prices = allFlights.map((flight: UniversalFlightSchedule) => flight.price)
      if(prices.length > 0) {
        setMinPrice(Math.min(...prices))
        setMaxPrice(Math.max(...prices))
      }
      // if (data.length > 0) {
      //   const prices = data.map((flight) => flight.price)
      //   setPriceRange([Math.min(...prices), Math.max(...prices)])
      // }

      setLoading(false)
    }, 1000)
  }, [queryParams, flightType, backendURL, totalPassengers])

  // useEffect(() => {
  //   // Apply filters
  //   const filtered = flights.filter(
  //     (flight) =>
  //       flight.price >= priceRange[0] && flight.price <= priceRange[1] && selectedAirlines.includes(flight.airline),
  //   )
  //   setFilteredFlights(filtered)
  // }, [flights, priceRange, selectedAirlines])

  const handleAirlineChange = (airline: {code:string, name:string}, checked: boolean) => {
    if (checked) {
      setSelectedAirlines([...selectedAirlines, airline])
    } else {
      setSelectedAirlines(selectedAirlines.filter((a) => a !== airline))
    }
  }

  // const handleSelectFlight = (flightId: string) => {
  //   // Navigate to flight details page with passenger breakdown
  //   window.location.href = `/flight-details?flightId=${flightId}&passengers=${passengersStr}&cabinClass=${cabinClass}&tripType=${tripType}`
  // }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Format passenger information for display
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
          <div className="w-full md:w-1/4">
            <Card>
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
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2stop" id="r3" />
                      <Label htmlFor="r3">Transit (2 stop)</Label>
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
            ) : departFilteredFlights.length === 0 || returnFilteredFlights.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Plane className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No flights found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search for different dates.</p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="">
                  <h2 className="mb-2 font-bold">Departure Flight</h2>
                  {
                    departFilteredFlights.map((flight) => {
                      return (
                        <FlightCard
                          key={flight.id + '_flight' }
                          flight={flight}
                          cabinclass={queryParams.cabinClass as "Y" | "W" | "C" | "F"}
                        />
                      )
                    })
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AppFooter />
    </main>
  )
}
