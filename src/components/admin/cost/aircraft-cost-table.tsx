"use client"
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AircraftCost } from '@/types/type'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

const AircraftCostTable = ({
    costs,
    isLoading,
    handleEditAircraftCost,
    handleDeleteAircraftCost
}:{
    costs: AircraftCost[]
    isLoading: boolean,
    handleEditAircraftCost: (index: number) => void,
    handleDeleteAircraftCost: (index: number) => void
}) => {
    const [sortColumn, setSortColumn] = useState<keyof AircraftCost>("model")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

    const handleSort = (column: keyof AircraftCost) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(column)
            setSortDirection("asc")
        }
    }

    // Format cost to always show 2 decimal places
    const formatCost = (cost: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(cost)
    }

    return (
        <div className="rounded-md border w-full">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>
                        <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("model")}>
                        Model
                        </Button>
                    </TableHead>
                    <TableHead>
                        <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("ownerAirlineCode")}>
                        Airline
                        </Button>
                    </TableHead>
                    <TableHead>
                        <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("costPerMile")}>
                        Cost Per Mile
                        </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
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
                        </TableRow>
                    ))
                    ) : costs.length > 0 ? (
                        costs.map((cost, index) => (
                        <TableRow key={`${cost.model}-${cost.ownerAirlineCode}`} className="cursor-pointer hover:bg-muted/50">
                            <TableCell>{cost.model}</TableCell>
                            <TableCell>{cost.ownerAirlineCode}</TableCell>
                            <TableCell>{formatCost(cost.costPerMile)}</TableCell>
                            <TableCell className='flex flex-row gap-2'>
                                <Button onClick={() => handleEditAircraftCost(index)} variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                                <Button onClick={() => handleDeleteAircraftCost(index)} variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        No aircraft costs found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default AircraftCostTable