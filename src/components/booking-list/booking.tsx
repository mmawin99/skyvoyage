"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, CreditCard, Edit, MoreHorizontal, Plane, Trash, Users, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingStatus, CabinClassType, searchSelectedBookingRoutes } from "@/types/type"
import { extractVAT } from "@/lib/price"

// Props for the BookingDetails component
interface BookingDetailsProps {
  item: searchSelectedBookingRoutes
  isAdmin: boolean
  // Admin actions
  onDeleteTicket?: (ticketId: string, passengerId: string) => void
  onModifyTicket?: (ticketId: string, passengerId: string) => void
  onDeletePassenger?: (passengerId: string) => void
  onModifyPassenger?: (passengerId: string) => void
  onDeleteBooking?: () => void
  onModifyBooking?: () => void
  onModifyBookingStatus?: (status: BookingStatus) => void
  onModifyPayment?: () => void
  onDeletePayment?: () => void
  // User actions
  onRefund?: () => void
  onCancel?: () => void
}

// Helper function to format duration from minutes to hours and minutes
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Helper function to get cabin class full name
const getCabinClassName = (cabinClass: CabinClassType) => {
  switch (cabinClass) {
    case "Y":
      return "Economy"
    case "C":
      return "Business"
    case "W":
      return "Premium Economy"
    case "F":
      return "First Class"
    default:
      return "Unknown"
  }
}

// Helper function to get status badge color
const getStatusBadge = (status: BookingStatus) => {
  switch (status) {
    // case "PENDING":
    //   return (
    //     <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
    //       Pending
    //     </Badge>
    //   )
    case "PAID":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          Confirmed (Paid)
        </Badge>
      )
    case "CANCELLED":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          Cancelled
        </Badge>
      )
    // case "COMPLETED":
    //   return (
    //     <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
    //       Completed
    //     </Badge>
    //   )
    case "REFUNDED":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          Refunded
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function BookingDetails({
  item,
  isAdmin,
  onDeleteTicket,
  onModifyTicket,
  onDeletePassenger,
  onModifyPassenger,
  onDeleteBooking,
  onModifyBooking,
  onModifyBookingStatus,
  onModifyPayment,
  onDeletePayment,
  onRefund,
  onCancel,
}: BookingDetailsProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("overview")

  // Format dates for display
  const formatDate = (dateStr: string) => {
    try {
      if(dateStr === "") return "N/A"
      return format(new Date(dateStr), "MMM dd, yyyy")
    } catch (e) {
        console.error("formatDate Error: ", dateStr, e)
      return dateStr
    }
  }

  // Format times for display
  const formatTime = (timeStr: string) => {
    try {
      return format(new Date(timeStr), "hh:mm a")
    } catch (e) {
        console.error("formatTime Error: ", e)
      return timeStr
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-col sm:flex-row items-start justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle className="text-xl sm:text-2xl">
            Booking Details
            <span className="ml-3">{getStatusBadge(item.status)}</span>
          </CardTitle>
          <CardDescription className="mt-1.5">
            {item.queryString.origin} to {item.queryString.destination} •{" "}
            {item.queryString.tripType === "roundtrip" ? "Round Trip" : "One Way"}
          </CardDescription>
        </div>

        {isAdmin ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Booking Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onModifyBooking}>
                <Edit className="mr-2 h-4 w-4" /> Modify Booking
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteBooking} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" /> Delete Booking
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status Update</DropdownMenuLabel>
              {/* <DropdownMenuItem onClick={() => onModifyBookingStatus?.("PENDING")}>Set as Pending</DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => onModifyBookingStatus?.("PAID")}>Set as Confirmed (Paid)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onModifyBookingStatus?.("CANCELLED")}>Set as Cancelled</DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => onModifyBookingStatus?.("COMPLETED")}>Set as Completed</DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => onModifyBookingStatus?.("REFUNDED")}>Set as Refunded</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            {item.status === "PAID" && (
              <>
                <Button variant="destructive" onClick={onCancel} className="cursor-pointer">
                  Cancel
                </Button>
                <Button variant="outline" onClick={onRefund} className="cursor-pointer">
                  Request Refund
                </Button>
              </>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="passengers">Passengers</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="mr-2 h-4 w-4" /> Trip Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trip Type:</span>
                        <span>{item.queryString.tripType === "roundtrip" ? "Round Trip" : "One Way"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Origin:</span>
                        <span>{item.selectedDepartRoute.flight.departureAirport}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destination:</span>
                        <span>{item.selectedDepartRoute.flight.arrivalAirport}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Depart Date:</span>
                        <span>{formatDate(item.selectedDepartRoute.flight.segments[0].departureTime)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {item.queryString.tripType === "roundtrip" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Return Date:</span>
                          <span>{formatDate(item?.selectedReturnRoute?.flight.segments[0].departureTime ?? "")}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cabin Class:</span>
                        <span>{getCabinClassName(item.queryString.cabinClass)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Passengers:</span>
                        <span>{item.passenger?.length ?? 0} Passenger</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" /> Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{getStatusBadge(item.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment ID:</span>
                        <span>{item.payment.paymentId || "N/A"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Date:</span>
                        <span>{item.payment.paymentDate ? formatDate(item.payment.paymentDate) : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span>{item.payment.paymentMethod || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total Fare:</span>
                    <span>THB {item.totalFare.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Flights Tab */}
          <TabsContent value="flights" className="space-y-6">
            {/* Departure Flight */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Plane className="mr-2 h-4 w-4" /> Departure Flight
                </CardTitle>
                <CardDescription>
                  {formatDate(item.queryString.departDateStr)} • {item.selectedDepartRoute.selectedFare} Fare
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                  <div className="text-center mb-2 md:mb-0">
                    <div className="text-xl font-bold">{item.selectedDepartRoute.flight.departureAirport}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.selectedDepartRoute.flight.segments[0].departureTime
                        ? formatTime(item.selectedDepartRoute.flight.segments[0].departureTime)
                        : "N/A"}
                    </div>
                  </div>
                  <div className="flex-1 mx-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {formatDuration(item.selectedDepartRoute.flight.duration)}
                    </div>
                    <div className="relative">
                      <div className="border-t border-dashed border-gray-300 w-full absolute top-1/2 left-0"></div>
                      <Plane className="h-4 w-4 mx-auto relative z-10 bg-white transform rotate-90" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.selectedDepartRoute.flight.stopCount === 0
                        ? "Direct"
                        : `${item.selectedDepartRoute.flight.stopCount} ${
                            item.selectedDepartRoute.flight.stopCount === 1 ? "Stop" : "Stops"
                          }`}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{item.selectedDepartRoute.flight.arrivalAirport}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.selectedDepartRoute.flight.segments[item.selectedDepartRoute.flight.segments.length - 1]
                        .arrivalTime
                        ? formatTime(
                            item.selectedDepartRoute.flight.segments[
                              item.selectedDepartRoute.flight.segments.length - 1
                            ].arrivalTime,
                          )
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="segments">
                    <AccordionTrigger>Flight Segments</AccordionTrigger>
                    <AccordionContent>
                      {item.selectedDepartRoute.flight.segments.map((segment, index) => (
                        <div key={segment.flightId} className="mb-4 last:mb-0">
                          {index > 0 && <Separator className="my-3" />}
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">
                              {segment.airlineName} ({segment.airlineCode})
                            </div>
                            <div className="text-sm">Flight {segment.flightNum}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Departure</div>
                              <div className="font-medium">{segment.departureAirport}</div>
                              <div className="text-sm">{formatTime(segment.departureTime)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Arrival</div>
                              <div className="font-medium">{segment.arrivalAirport}</div>
                              <div className="text-sm">{formatTime(segment.arrivalTime)}</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Aircraft:</span> {segment.aircraftModel}
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Return Flight (if applicable) */}
            {item.queryString.tripType === "roundtrip" && item.selectedReturnRoute && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Plane className="mr-2 h-4 w-4 transform rotate-180" /> Return Flight
                  </CardTitle>
                  <CardDescription>
                    {formatDate(item.queryString.returnDateStr)} • {item.selectedReturnRoute.selectedFare} Fare
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <div className="text-center mb-2 md:mb-0">
                      <div className="text-xl font-bold">{item.selectedReturnRoute.flight.departureAirport}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.selectedReturnRoute.flight.segments[0].departureTime
                          ? formatTime(item.selectedReturnRoute.flight.segments[0].departureTime)
                          : "N/A"}
                      </div>
                    </div>
                    <div className="flex-1 mx-4 text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        {formatDuration(item.selectedReturnRoute.flight.duration)}
                      </div>
                      <div className="relative">
                        <div className="border-t border-dashed border-gray-300 w-full absolute top-1/2 left-0"></div>
                        <Plane className="h-4 w-4 mx-auto relative z-10 bg-white transform rotate-90" />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.selectedReturnRoute.flight.stopCount === 0
                          ? "Direct"
                          : `${item.selectedReturnRoute.flight.stopCount} ${
                              item.selectedReturnRoute.flight.stopCount === 1 ? "Stop" : "Stops"
                            }`}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{item.selectedReturnRoute.flight.arrivalAirport}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.selectedReturnRoute.flight.segments[item.selectedReturnRoute.flight.segments.length - 1]
                          .arrivalTime
                          ? formatTime(
                              item.selectedReturnRoute.flight.segments[
                                item.selectedReturnRoute.flight.segments.length - 1
                              ].arrivalTime,
                            )
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="segments">
                      <AccordionTrigger>Flight Segments</AccordionTrigger>
                      <AccordionContent>
                        {item.selectedReturnRoute.flight.segments.map((segment, index) => (
                          <div key={segment.flightId} className="mb-4 last:mb-0">
                            {index > 0 && <Separator className="my-3" />}
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium">
                                {segment.airlineName} ({segment.airlineCode})
                              </div>
                              <div className="text-sm">Flight {segment.flightNum}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Departure</div>
                                <div className="font-medium">{segment.departureAirport}</div>
                                <div className="text-sm">{formatTime(segment.departureTime)}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Arrival</div>
                                <div className="font-medium">{segment.arrivalAirport}</div>
                                <div className="text-sm">{formatTime(segment.arrivalTime)}</div>
                              </div>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Aircraft:</span> {segment.aircraftModel}
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Passengers Tab */}
          <TabsContent value="passengers" className="space-y-4">
            {item.passenger && item.passenger.length > 0 ? (
              item.passenger.map((passenger) => (
                <Card key={passenger.pid}>
                  <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {passenger.titleName} {passenger.firstName} {passenger.lastName}
                        <Badge className="ml-2" variant="outline">
                          {passenger.ageRange}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Passport: {passenger.passportNum} ({passenger.passportCountry})
                      </CardDescription>
                    </div>

                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onModifyPassenger?.(passenger.pid)}>
                            <Edit className="mr-2 h-4 w-4" /> Modify Passenger
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeletePassenger?.(passenger.pid)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete Passenger
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="details" className="border-b-0">
                        <AccordionTrigger className="px-6 py-3">Passenger Details</AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Date of Birth</div>
                              <div>{formatDate(passenger.dateOfBirth)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Nationality</div>
                              <div>{passenger.nationality}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Passport Expiry</div>
                              <div>{formatDate(passenger.passportExpiry)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Status</div>
                              <div>{passenger.status}</div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Tickets</h4>
                            <div className="space-y-3">
                              {passenger.ticket.map((ticket) => (
                                <div key={ticket.tid} className="border rounded-md p-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium">Ticket ID: {ticket.tid}</div>
                                      <div className="text-sm text-muted-foreground">Flight ID: {ticket.fid}</div>
                                    </div>

                                    {isAdmin && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-5 w-5" />
                                            <span className="sr-only">Actions</span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => onModifyTicket?.(ticket.tid, passenger.pid)}>
                                            <Edit className="mr-2 h-4 w-4" /> Modify Ticket
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => onDeleteTicket?.(ticket.tid, passenger.pid)}
                                            className="text-red-600"
                                          >
                                            <Trash className="mr-2 h-4 w-4" /> Delete Ticket
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                                    <div>
                                      <div className="text-sm text-muted-foreground">Baggage</div>
                                      <div>
                                        {ticket.baggageAllowanceWeight} kg (${ticket.baggageAllowancePrice.toFixed(2)})
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">Meal</div>
                                      <div>
                                        {ticket.mealSelection} (${ticket.mealPrice.toFixed(2)})
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">Seat</div>
                                      <div>
                                        {ticket.seatId || "Not Assigned"} (${ticket.seatPrice.toFixed(2)})
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No passenger information available</div>
            )}
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Wallet className="mr-2 h-4 w-4" /> Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Payment ID</div>
                    <div className="font-medium">{item.payment.paymentId || "Not Available"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Method</div>
                    <div className="font-medium">{item.payment.paymentMethod || "Not Available"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Date</div>
                    <div className="font-medium">
                      {item.payment.paymentDate ? formatDate(item.payment.paymentDate) : "Not Available"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Status</div>
                    <div className="font-medium">{getStatusBadge(item.status)}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <span>THB {(extractVAT(item.totalFare).basePrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees:</span>
                    <span>THB {(extractVAT(item.totalFare).vatAmount).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>THB {item.totalFare.toFixed(2)}</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onModifyPayment}>
                      <Edit className="mr-2 h-4 w-4" /> Modify Payment
                    </Button>
                    <Button variant="outline" className="text-red-600" onClick={onDeletePayment}>
                      <Trash className="mr-2 h-4 w-4" /> Delete Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-sm text-muted-foreground">
          <Users className="inline-block mr-1 h-4 w-4" />
          {item.passenger ? item.passenger.length : 0} Passenger(s)
        </div>
        <div className="text-sm text-muted-foreground">
          <Clock className="inline-block mr-1 h-4 w-4" />
          Last Updated: {item.payment.paymentDate ? formatDate(item.payment.paymentDate) : "N/A"}
        </div>
      </CardFooter>
    </Card>
  )
}
