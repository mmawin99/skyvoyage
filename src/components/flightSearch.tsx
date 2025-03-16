"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

export function FlightSearch() {
  const router = useRouter()
  const [tripType, setTripType] = useState("roundtrip")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [passengers, setPassengers] = useState("1")
  const [cabinClass, setCabinClass] = useState("economy")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, we would validate the form data here

    // Navigate to search results with query params
    router.push(
      `/search-results?origin=${origin}&destination=${destination}&departDate=${dateRange?.from?.toISOString()}&returnDate=${dateRange?.to?.toISOString()}&passengers=${passengers}&cabinClass=${cabinClass}&tripType=${tripType}`,
    )
  }

  return (
    <div className="rounded-lg shadow-lg p-6">
      <Tabs defaultValue="roundtrip" onValueChange={setTripType} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roundtrip">Round Trip</TabsTrigger>
          <TabsTrigger value="oneway">One Way</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSearch} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin">From</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="origin"
                placeholder="City or Airport"
                className="pl-10"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">To</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="destination"
                placeholder="City or Airport"
                className="pl-10"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-range">Travel Dates</Label>
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
            <Label htmlFor="passengers">Passengers</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Select value={passengers} onValueChange={setPassengers}>
                <SelectTrigger id="passengers" className="pl-10 w-full">
                  <SelectValue placeholder="Select passengers" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Passenger" : "Passengers"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cabin-class">Cabin Class</Label>
            <Select value={cabinClass} onValueChange={setCabinClass}>
              <SelectTrigger id="cabin-class" className="w-full">
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

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Search Flights
        </Button>
      </form>
    </div>
  )
}

