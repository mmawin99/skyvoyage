"use client"

import { Check, ChevronDown, ChevronUp, Plane, X } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatInTimeZone } from "@/lib/utils"
import { FarePackage, FareType, UniversalFlightSchedule } from "@/types/type"
import { FarePackageList, formatFareType } from './../lib/farePackage'


interface FlightCardProps {
  flight: UniversalFlightSchedule
  cabinclass: "Y" | "W" | "C" | "F"
  onSelect: ({selectedFare, flightId}: { selectedFare: FareType | null; flightId: string }) => void
}

export default function FlightCard({ flight, cabinclass, onSelect }: FlightCardProps) {
  // State to track if this flight card is expanded
  const [isExpanded, setIsExpanded] = useState(false)
  // State to track if fare selection is visible
  const [showFareSelection, setShowFareSelection] = useState(false)
  // State to track selected fare package
  const [selectedFare, setSelectedFare] = useState<FareType | null>(null)

  // Toggle expanded state
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  // Toggle fare selection
  const toggleFareSelection = () => {
    setShowFareSelection((prev) => !prev)
    // Close flight details if opening fare selection
    if (!showFareSelection) {
      setIsExpanded(false)
    }
  }

  const firstSegment = flight.segments[0]
  const lastSegment = flight.segments[flight.segments.length - 1]

  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
      const hours = Math.floor(minutes / 60)
      const remainingMins = minutes % 60
      return `${hours}h ${remainingMins}m`
    }

  // Calculate layover time between segments
  const calculateLayover = (arrivalTime: string, departureTime: string) => {
    const arrival = new Date(arrivalTime)
    const departure = new Date(departureTime)
    const diffMs = departure.getTime() - arrival.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  // Format time in the specific timezone
  const formatLocalTime = (dateString: string, timezone: string) => {
    return formatInTimeZone(new Date(dateString), timezone, "HH:mm")
  }

  // Format date in the specific timezone
  const formatLocalDate = (dateString: string, timezone: string) => {
    return formatInTimeZone(new Date(dateString), timezone, "dd MMM yyyy")
  }

  // Sample fare packages data
  const farePackages: FarePackage[] = FarePackageList(flight, cabinclass);
  // Format fare type for display
  

  // Handle fare selection
  const handleSelectFare = (fare: FareType) => {
    setSelectedFare(fare)
    // You could automatically proceed here if desired
    // alert(`Selected ${fare} fare for flight ${flight.id}`)
  }

  return (
    <Card className="overflow-hidden mb-2">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <span className="font-bold">{firstSegment.airlineName}</span>
            <Badge variant="outline" className="ml-2">
              {firstSegment.airlineCode} {firstSegment.flightNum.split("-")[0]}
              {flight.segments.length > 1 ? ` (${flight.segments.length} segments)` : ""}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {cabinclass == "Y" ? "Economy" : cabinclass === "W" ? "Premium Economy" : cabinclass === "C" ? "Business" : "First Class"}
            </Badge>
          </CardTitle>
          <div className="text-2xl font-bold">Start at ${(
            cabinclass === "Y" ? flight.price.SUPER_SAVER :
            cabinclass === "W" ? flight.price.SAVER :
            cabinclass === "C" ? flight.price.FLEXI :
            cabinclass === "F" ? flight.price.FLEXI : 0
          ).toFixed(2)}</div>
        </div>
      </CardHeader>

      <CardContent className="">
        {/* Flight route summary - always visible */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xl font-bold">
              {formatLocalTime(firstSegment.departureTime, firstSegment.departTimezone)}
            </span>
            <span className="text-sm text-muted-foreground font-bold">{firstSegment.departureAirport}</span>
            <span className="text-xs text-muted-foreground">
              {formatLocalDate(firstSegment.departureTime, firstSegment.departTimezone)}
            </span>
          </div>

          <div className="flex-1 mx-4 relative">
            <div className="border-t border-dashed border-muted-foreground my-4"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground whitespace-nowrap">
              {formatDuration(flight.duration)}
              <Badge variant="secondary" className="ml-2">
                {flight.stopCount === 0
                  ? "Direct"
                  : `${flight.stopCount} Stop${Number.parseInt(String(flight.stopCount)) > 1 ? "s" : ""}`}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-xl font-bold">
              {formatLocalTime(lastSegment.arrivalTime, lastSegment.arriveTimezone)}
            </span>
            <span className="text-sm text-muted-foreground font-bold">{lastSegment.arrivalAirport}</span>
            <span className="text-xs text-muted-foreground">
              {formatLocalDate(lastSegment.arrivalTime, lastSegment.arriveTimezone)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-sm" onClick={toggleExpand}>
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Hide details</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Show details</span>
              </>
            )}
          </Button>

          <Button variant="default" size="sm" className="flex items-center gap-1" onClick={toggleFareSelection}>
            {showFareSelection ? "Hide fare options" : "Select this flight"}
          </Button>
        </div>

        {/* Detailed segments - only visible when expanded */}
        {isExpanded && (
          <div className="space-y-4 mt-4 pt-4 border-t border-muted">
            {flight.segments.map((segment, index) => (
              <div key={segment.flightId}>
                {index > 0 && (
                  <div className="my-4 py-2 px-4 bg-muted/30 rounded-md">
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <span>Layover in {flight.segments[index - 1].arrivalAirport}: </span>
                      <span className="font-medium ml-1">
                        {calculateLayover(flight.segments[index - 1].arrivalTime, segment.departureTime)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    <Plane className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <div>
                        <span className="font-medium">Operate by <span className="font-bold">{segment.airlineName}</span></span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {segment.airlineCode} {segment.flightNum.split("-")[0]}
                        </span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          Segment {index + 1}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">Aircraft {segment.aircraftModel}</div>
                    </div>

                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {formatLocalTime(segment.departureTime, segment.departTimezone)}
                          <span className="text-xs text-muted-foreground ml-1">({segment.departureAirport} local)</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{segment.departureAirport}</div>
                      </div>

                      <div className="flex-1 mx-4 relative">
                        <div className="border-t border-dotted border-muted-foreground my-3"></div>
                      </div>

                      <div className="flex flex-col text-right">
                        <div className="font-medium">
                          {formatLocalTime(segment.arrivalTime, segment.arriveTimezone)}
                          <span className="text-xs text-muted-foreground ml-1">({segment.arrivalAirport} local)</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{segment.arrivalAirport}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fare package selection - only visible when showFareSelection is true */}
        {showFareSelection && (
          <div className="mt-4 pt-4 border-t border-muted">
            <h3 className="text-lg font-semibold mb-6">Select Fare Package</h3>

            <div className="overflow-x-auto pb-2">
              <div className={`grid ${cabinclass == "Y" ? "grid-cols-5" : "grid-cols-4"} gap-3 min-w-[800px]`}>
                {farePackages.map((fare) =>{
                  if(fare.available === false) return null
                  return (
                    <div
                    key={fare.type}
                    className={`relative flex flex-col border rounded-lg overflow-hidden ${
                      fare.recommended
                        ? "border-primary shadow-md"
                        : selectedFare === fare.type
                          ? "border-primary"
                          : "border-border"
                    }`}
                  >
                    {/* Recommended badge */}
                    {fare.recommended && (
                      <div className="absolute top-0 right-0 left-0">
                        <div className="bg-primary text-primary-foreground text-xs font-medium py-1 px-2 text-center">
                          RECOMMENDED
                        </div>
                      </div>
                    )}

                    {/* Header */}
                    <div className={`p-4 text-center ${fare.recommended ? "bg-primary/10 pt-7" : "bg-muted/30"}`}>
                      <h4 className="font-bold text-lg">{formatFareType(fare.type)}</h4>
                      {fare.label && <p className="text-sm text-muted-foreground">{fare.label}</p>}
                    </div>

                    {/* Price */}
                    <div className="p-4 text-center border-b">
                      <div className="text-3xl font-bold">${fare.price.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">per passenger</div>
                    </div>

                    {/* Features */}
                    <div className="p-4 space-y-4 flex-grow">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                          {fare.baggage ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Baggage</p>
                          <p className="text-sm text-muted-foreground">{fare.baggage}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                          {fare.carryOn ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Carry on</p>
                          <p className="text-sm text-muted-foreground">{fare.carryOn}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                          {fare.seatSelection ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Seat Selection</p>
                          <p className="text-sm text-muted-foreground">
                            {fare.seatSelection ? "Included" : "Not included"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                          {fare.mealSelection ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Meal Selection</p>
                          <p className="text-sm text-muted-foreground">
                            {fare.mealSelection ? "Included" : "Not included"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Changes</p>
                          <p className="text-sm text-muted-foreground">{fare.changes}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Cancellation</p>
                          <p className="text-sm text-muted-foreground">{fare.cancellation}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                          {fare.refundable ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Refund</p>
                          <p className="text-sm text-muted-foreground">
                            {fare.refundable ? "Free" : "Fee applies"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                          {fare.priorityBoarding ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Priority Boarding</p>
                          <p className="text-sm text-muted-foreground">
                            {fare.priorityBoarding ? "Included" : "Not included"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                          {fare.loungeAccess ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Lounge Access</p>
                          <p className="text-sm text-muted-foreground">
                            {fare.loungeAccess ? "Included" : "Not included"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="p-4 border-t">
                      <Button
                        variant={fare.recommended ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleSelectFare(fare.type)}
                      >
                        {selectedFare === fare.type ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>

            {selectedFare && (
              <div className="mt-6 flex justify-end">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => {
                    // console.log(`Selected fare: ${selectedFare}`)
                    // alert(`Proceeding with ${formatFareType(selectedFare)} fare for flight ${flight.id}`)
                    onSelect({selectedFare: selectedFare, flightId: flight.id})
                  }}
                >
                  Continue with {formatFareType(selectedFare)}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-muted/20 flex justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Total duration:</span> {formatDuration(flight.duration)}
        </div>
        <div className="text-sm">
          <span className="font-medium">Route:</span> {flight.departureAirport} → {flight.arrivalAirport}
        </div>
      </CardFooter>
    </Card>
  )
}
