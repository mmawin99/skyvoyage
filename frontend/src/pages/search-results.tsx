/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Clock, Filter, Plane } from "lucide-react"

export default function SearchResults() {
  const searchParams = useSearchParams()
  const origin = searchParams.get("origin")
  const destination = searchParams.get("destination")
  const departDateStr = searchParams.get("departDate")
  const returnDateStr = searchParams.get("returnDate")
  const passengersStr = searchParams.get("passengers") || "1,0,0" // Default to 1 adult, 0 children, 0 infants
  const cabinClass = searchParams.get("cabinClass") || "economy"
  const tripType = searchParams.get("tripType") || "roundtrip"

  // Parse passenger counts
  const [adultCount, childCount, infantCount] = passengersStr.split(",").map(Number)
  const allTotalPassengers = adultCount + childCount + infantCount
  const totalPassengers = adultCount + childCount
  const [flights, setFlights] = useState<Flight[]>([])
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([])
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [airlines, setAirlines] = useState<string[]>([])
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, we would fetch flights from an API
    // For now, we'll use mock data
    setLoading(true)
    setTimeout(() => {
      const data = mockFlights.filter(
        (flight) =>
          flight.origin.toLowerCase() === origin?.toLowerCase() &&
          flight.destination.toLowerCase() === destination?.toLowerCase(),
      )

      setFlights(data)
      setFilteredFlights(data)

      // Extract unique airlines
      const uniqueAirlines = Array.from(new Set(data.map((flight) => flight.airline)))
      setAirlines(uniqueAirlines)
      setSelectedAirlines(uniqueAirlines)

      // Find min and max prices
      if (data.length > 0) {
        const prices = data.map((flight) => flight.price)
        setPriceRange([Math.min(...prices), Math.max(...prices)])
      }

      setLoading(false)
    }, 1000)
  }, [origin, destination, departDateStr])

  useEffect(() => {
    // Apply filters
    const filtered = flights.filter(
      (flight) =>
        flight.price >= priceRange[0] && flight.price <= priceRange[1] && selectedAirlines.includes(flight.airline),
    )
    setFilteredFlights(filtered)
  }, [flights, priceRange, selectedAirlines])

  const handleAirlineChange = (airline: string, checked: boolean) => {
    if (checked) {
      setSelectedAirlines([...selectedAirlines, airline])
    } else {
      setSelectedAirlines(selectedAirlines.filter((a) => a !== airline))
    }
  }

  const handleSelectFlight = (flightId: string) => {
    // Navigate to flight details page with passenger breakdown
    window.location.href = `/flight-details?flightId=${flightId}&passengers=${passengersStr}&cabinClass=${cabinClass}&tripType=${tripType}`
  }

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
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">
          Flights from {origin} to {destination}
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
                    max={2000}
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
                  <h3 className="font-medium mb-3">Airlines</h3>
                  <div className="space-y-2">
                    {airlines.map((airline) => (
                      <div key={airline} className="flex items-center space-x-2">
                        <Checkbox
                          id={`airline-${airline}`}
                          checked={selectedAirlines.includes(airline)}
                          onCheckedChange={(checked) => handleAirlineChange(airline, checked as boolean)}
                        />
                        <Label htmlFor={`airline-${airline}`}>{airline}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flight Results */}
          <div className="w-full md:w-3/4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg">Searching for the best flights...</p>
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Plane className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No flights found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search for different dates.</p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFlights.map((flight) => (
                  <Card key={flight.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                          <div className="flex items-center mb-2 md:mb-0">
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mr-4">
                              <Plane className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{flight.airline}</h3>
                              <p className="text-sm text-gray-500">Flight {flight.flightNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold">${flight.price}</span>
                            <p className="text-sm text-gray-500">{formatPassengerInfo()}</p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="text-center mr-4">
                                <p className="text-xl font-semibold">{flight.departureTime}</p>
                                <p className="text-sm text-gray-500">{flight.origin}</p>
                              </div>
                              <div className="flex-1 px-4">
                                <div className="relative">
                                  <div className="border-t-2 border-gray-300 w-full absolute top-3"></div>
                                  <div className="flex justify-center">
                                    <div className="bg-white px-2 relative z-10 flex items-center">
                                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                      <span className="text-sm text-gray-500">
                                        {formatDuration(flight.durationMinutes)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-center ml-4">
                                <p className="text-xl font-semibold">{flight.arrivalTime}</p>
                                <p className="text-sm text-gray-500">{flight.destination}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 p-4 flex justify-end">
                      <Button onClick={() => handleSelectFlight(flight.id)}>
                        Select <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
