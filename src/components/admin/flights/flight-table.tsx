"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { adminFlightListType } from "@/types/type"

interface FlightScheduleTableProps {
  flights: adminFlightListType[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function FlightTable({ flights, isLoading,
  searchQuery,
  setSearchQuery
}: FlightScheduleTableProps) {
    
    const [sortColumn, setSortColumn] = useState<keyof adminFlightListType>("flightNum")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

    const handleSort = (column: keyof adminFlightListType) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        }else{
            setSortColumn(column)
            setSortDirection("asc")
        }
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
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("departAirportId")}>
                  Departure Airport
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("utcDepartureTime")}>
                  Departure UTC time
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("arriveAirportId")}>
                  Arrival Airport
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("utcArrivalTime")}>
                  Arrival UTC time
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                Schedule Count
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
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
            ) : flights.length != 0 ? flights.map((flight, index)=>( 
                <TableRow key={index+ "_" +flight.flightNum + "_" + flight.airlineCode + "_fligh-table-entries"} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>{flight.airlineCode} {flight.flightNum}</TableCell>
                    <TableCell>({flight.departAirportId}) {flight.departAirportName}</TableCell>
                    <TableCell>{flight.utcDepartureTime}</TableCell>
                    <TableCell>({flight.arriveAirportId}) {flight.arriveAirportName}</TableCell>
                    <TableCell>{flight.utcArrivalTime}</TableCell>
                    <TableCell>{flight.flightCount}</TableCell>
                </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No flights found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
