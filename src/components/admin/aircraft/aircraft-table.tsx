"use client"
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AircraftRegistration } from '@/types/type'
import { Edit, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

const AircraftTableWithEditor = ({
    aircraft,
    isLoading
}:{
    aircraft: AircraftRegistration[]
    isLoading: boolean
}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortColumn, setSortColumn] = useState<keyof AircraftRegistration>("registration")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

    const handleSort = (column: keyof AircraftRegistration) => {
        if (sortColumn === column) {
            // setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        }else{
            // setSortColumn(column)
            // setSortDirection("asc")
        }
    }
    return (
        <div className="rounded-md border w-full">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>
                        <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("registration")}>
                        Registration
                        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                        </Button>
                    </TableHead>
                    <TableHead>
                        <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("airlineCode")}>
                        Airline
                        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                        </Button>
                    </TableHead>
                    <TableHead>
                        <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("model")}>
                        Model
                        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
                        </Button>
                    </TableHead>
                    <TableHead>Total flight</TableHead>
                    <TableHead>Manage</TableHead>
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
                    ) : aircraft.length > 0 ? (
                        aircraft.map((aircraft) => (
                        <TableRow key={aircraft.registration} className="cursor-pointer hover:bg-muted/50">
                            <TableCell>{aircraft.registration}</TableCell>
                            <TableCell>{aircraft.airlineCode}</TableCell>
                            <TableCell>{aircraft.model}</TableCell>
                            <TableCell>{aircraft.totalFlight}</TableCell>
                            <TableCell className='flex flex-row gap-2'>
                                <Button variant="outline" onClick={() => console.log("Edit", aircraft.registration)}>
                                    <Edit className="h-4 w-4" />
                                    <span>Edit</span>
                                </Button>
                                <Button variant="destructive" onClick={() => console.log("Delete", aircraft.registration)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        No flights found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default AircraftTableWithEditor