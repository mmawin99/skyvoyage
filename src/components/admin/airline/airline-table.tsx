"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AirlineAPIType } from "@/types/type"
import { Edit, Search, Trash2 } from "lucide-react"
import { useState } from "react"

interface AirlineTableProps {
  airlines: AirlineAPIType[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function AirlineTable({ airlines, isLoading,
  searchQuery,
  setSearchQuery
}: AirlineTableProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortColumn, setSortColumn] = useState<keyof AirlineAPIType>("airlineCode")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

    const handleSort = (column: keyof AirlineAPIType) => {
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
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("airlineCode")}>
                  Airline Code
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("airlineName")}>
                  Airline Name
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("numAssociateFlight")}>
                  Total Flights
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("numAssociateSchedule")}>
                  Total Schedule
                  {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("numAssociateAircraft")}>
                  Total Aircraft
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
                </TableRow>
              ))
            ) : airlines.length != 0 ? airlines.map((airline, index)=>( 
                <TableRow key={index+ "_" + airline.airlineCode + "_" + airline.airlineName + "_airline-table-entries"} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      {airline.airlineCode}
                    </TableCell>
                    <TableCell>
                      {airline.airlineName}
                    </TableCell>
                    <TableCell>
                      {airline.numAssociateFlight}
                    </TableCell>
                    <TableCell>
                      {airline.numAssociateSchedule}
                    </TableCell>
                    <TableCell>
                      {airline.numAssociateAircraft}
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
                <TableCell colSpan={6} className="h-24 text-center">
                  No airline found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
