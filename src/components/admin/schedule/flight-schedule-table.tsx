"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatInTimeZone } from "@/lib/utils"
import { ScheduleListAdmin } from "@/types/type"
import { Edit, Search, Trash2 } from "lucide-react"
import { useState } from "react"

interface FlightScheduleTableProps {
  flights: ScheduleListAdmin[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function FlightScheduleTable({ flights, isLoading,
  searchQuery,
  setSearchQuery
 }: FlightScheduleTableProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortColumn, setSortColumn] = useState<keyof ScheduleListAdmin>("flightNum")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    console.log(flights)
    const handleSort = (column: keyof ScheduleListAdmin) => {
        if (sortColumn === column) {
        // setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
        // setSortColumn(column)
        // setSortDirection("asc")
        }
    }

    const sortedFlights = [...flights].sort((a, b) => {
        if (sortDirection === "asc") {
        return a[sortColumn] > b[sortColumn] ? 1 : -1
        } else {
        return a[sortColumn] < b[sortColumn] ? 1 : -1
        }
    })

    const filteredFlights = sortedFlights
    
    const formatDateTime = (dateTimeStr: string, timezone:string) => {
        try {
        return formatInTimeZone(new Date(dateTimeStr), timezone, "MMM dd, yyyy HH:mm")
        } catch (e) {
            console.error("Error parsing date:", e)
            return dateTimeStr
        }
    }

  const getFlightStatus = (flight: ScheduleListAdmin) => {
    const now = new Date()
    const depTime = new Date(flight.departureTime)
    const arrTime = new Date(flight.arrivalTime)

    if (now > arrTime) return "completed"
    if (now > depTime) return "in-flight"
    return "scheduled"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "in-flight":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            In Flight
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Scheduled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const isOvernightFlight = (flight: ScheduleListAdmin) => {
    const depTime = new Date(flight.departureTime)
    const arrTime = new Date(flight.arrivalTime)

    // Check if arrival is on a later date than departure
    return (
      arrTime.getDate() !== depTime.getDate() ||
      arrTime.getMonth() !== depTime.getMonth() ||
      arrTime.getFullYear() !== depTime.getFullYear()
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search flights..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("flightNum")}>
                  Flight #
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("airlineName")}>
                  Carrier
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>Route</TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("departureTime")}>
                  Departure
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("arrivalTime")}>
                  Arrival
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>Aircraft</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 20 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredFlights.length > 0 ? (
              filteredFlights.map((flight) => (
                <TableRow key={flight.flightId} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{flight.flightNum}</TableCell>
                  <TableCell>{flight.airlineName} ({flight.airlineCode})</TableCell>
                  <TableCell>
                    {flight.departAirportId} → {flight.arriveAirportId}
                    {isOvernightFlight(flight) && (
                      <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        +1
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(flight.departureTime, flight.departureTimezone)}</TableCell>
                  <TableCell>{formatDateTime(flight.arrivalTime, flight.arrivalTimezone)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{flight.aircraftModel}</span>
                      <span className="text-xs text-muted-foreground">{flight.aircraftId}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(getFlightStatus(flight))}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No schedules found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
