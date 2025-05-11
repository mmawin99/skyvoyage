"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Edit, Search, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { adminTransitListType } from "@/types/type"

interface FlightScheduleTableProps {
  transits: adminTransitListType[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function TransitTable({ transits, isLoading,
  searchQuery,
  setSearchQuery
}: FlightScheduleTableProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortColumn, setSortColumn] = useState<keyof adminTransitListType>("flightNumFrom")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

    const handleSort = (column: keyof adminTransitListType) => {
        if (sortColumn === column) {
            // setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        }else{
            // setSortColumn(column)
            // setSortDirection("asc")
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
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("flightNumFrom")}>
                  Flight number Leg 1
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("flightNumTo")}>
                  Flight number Leg 2
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("airlineCodeFrom")}>
                  Airline Leg 1
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("airlineCodeTo")}>
                  Airline Leg 2
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("departureAirportCode")}>
                  Departure Airport
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("transitAirportCode")}>
                  Transit Airport
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("arrivalAirportCode")}>
                  Arrival Airport
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                Manage
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
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : transits.length != 0 ? transits.map((transit, index)=>( 
                <TableRow key={index+ "_" + transit.flightNumFrom + "_" + transit.flightNumTo + "_transit-table-entries"} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      {transit.flightNumFrom}
                    </TableCell>
                    <TableCell>
                      {transit.flightNumTo}
                    </TableCell>
                    <TableCell>
                      ({transit.airlineCodeFrom}) {transit.airlineNameFrom}
                    </TableCell>
                    <TableCell>
                      ({transit.airlineCodeTo}) {transit.airlineNameTo}
                    </TableCell>
                    <TableCell>
                      {transit.departureAirportCode}
                    </TableCell>
                    <TableCell>
                      {transit.transitAirportCode}
                    </TableCell>
                    <TableCell>
                      {transit.arrivalAirportCode}
                    </TableCell>
                    <TableCell className="flex gap-2">
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
            )) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No Transit found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
