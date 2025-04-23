"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Aircraft {
  aircraftId: string
  ownerAirlineCode: string
  model: string
  seatMapId: string
  airline: {
    code: string
    name: string
  }
  seatmap: {
    id: string
    name: string
  }
  flightOperate: number
  status: string
  registrationDate: string
}

interface AircraftTableProps {
  aircraft: Aircraft[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function AircraftTable({ aircraft, isLoading, searchQuery, setSearchQuery }: AircraftTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Aircraft>("aircraftId")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (column: keyof Aircraft) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedAircraft = [...aircraft].sort((a, b) => {
    let valueA, valueB

    // Handle nested properties
    if (sortColumn === "airline") {
      valueA = a.airline.name
      valueB = b.airline.name
    } else if (sortColumn === "seatmap") {
      valueA = a.seatmap.name
      valueB = b.seatmap.name
    } else {
      valueA = a[sortColumn]
      valueB = b[sortColumn]
    }

    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : -1
    } else {
      return valueA < valueB ? 1 : -1
    }
  })

  const filteredAircraft = sortedAircraft.filter(
    (aircraft) =>
      aircraft.aircraftId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aircraft.ownerAirlineCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aircraft.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aircraft.airline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aircraft.seatmap.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy")
    } catch (e) {
      console.error("Error parsing date:", e)
      return dateStr
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        )
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Maintenance
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search aircraft..."
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
              <TableHead className="w-[120px]">
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("aircraftId")}>
                  Aircraft ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("airline")}>
                  Airline
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("model")}>
                  Model
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("seatmap")}>
                  Seat Map
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent"
                  onClick={() => handleSort("flightOperate")}
                >
                  Flights
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent"
                  onClick={() => handleSort("registrationDate")}
                >
                  Registration Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("status")}>
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAircraft.length > 0 ? (
              filteredAircraft.map((aircraft) => (
                <TableRow key={aircraft.aircraftId} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{aircraft.aircraftId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{aircraft.airline.name}</span>
                      <span className="text-xs text-muted-foreground">{aircraft.ownerAirlineCode}</span>
                    </div>
                  </TableCell>
                  <TableCell>{aircraft.model}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{aircraft.seatmap.name}</span>
                      <span className="text-xs text-muted-foreground">ID: {aircraft.seatMapId}</span>
                    </div>
                  </TableCell>
                  <TableCell>{aircraft.flightOperate}</TableCell>
                  <TableCell>{formatDate(aircraft.registrationDate)}</TableCell>
                  <TableCell>{getStatusBadge(aircraft.status)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No aircraft found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
