"use client"

import { ArrowLeftIcon, Edit, Loader2, Trash2, PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"

import { CustomPagination } from "@/components/custom-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SeatmapAPIMetadata } from "@/types/type"
import { SeatMapEditor } from "./seatmap-editor"

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export const SeatmapAdmin = () => {

    const [mode, setMode] = useState<"edit" | "add" | "list">("list")
    const [effectiveSeatmapId, setEffectiveSeatmapId] = useState<string>("")
    const [data, setData] = useState<SeatmapAPIMetadata[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pageSize, setPageSize] = useState(10)
    const [pageIndex, setPageIndex] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedSearchQuery = useDebounce(searchQuery, 500)
    const SelectSizeInput = () => {
        return (
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
                </SelectContent>
            </Select>
        )
    }

    // Toggle sorting
    // const toggleSorting = (field: string) => {
    //     if (sortField === field) {
    //         setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    //     } else {
    //         setSortField(field)
    //         setSortDirection("asc")
    //     }
    // }

    // Fetch data from API
    useEffect(() => {
        const fetchSeatmaps = async () => {
            setLoading(true)
            try {
                const response = await fetch(
                    `/api/seatmap/list/${pageSize}/${pageIndex}?query=${debouncedSearchQuery}`
                )
                if (!response.ok) {
                    console.error(`API request failed with status ${response.status}`)
                }

                const result = await response.json()
                setData(result.data || [])
                setTotalCount(result.pagination.totalCount || 0)
                setError(null)
            } catch (err) {
                console.error("Failed to fetch seatmaps:", err)
                setError("Failed to load seatmap data. Please try again later.")
                setData([])
            } finally {
                setLoading(false)
            }
        }

        fetchSeatmaps()
    }, [pageSize, pageIndex, debouncedSearchQuery])

    if(mode == "edit") return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Edit Seatmap</h1>
                <Button onClick={() => { 
                    setMode("list")
                    setEffectiveSeatmapId("")
                }} className="gap-1">
                <ArrowLeftIcon className="h-4 w-4" />
                    Go back
                </Button>
            </div>
            <SeatMapEditor seatMapId={effectiveSeatmapId} />
        </div>
    )
    if(mode == "add") return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Add Seatmap</h1>
                <Button onClick={() => { 
                    setMode("list")
                    setEffectiveSeatmapId("")
                }} className="gap-1">
                <ArrowLeftIcon className="h-4 w-4" />
                    Go back
                </Button>
            </div>
            <SeatMapEditor isNewSeatMap={true} />
        </div>
    )

    if (mode == "list") return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Seatmap Management</h1>
                <Button onClick={() => { 
                    setMode("add")
                }} className="gap-1">
                <PlusCircle className="h-4 w-4" />
                    Add Seatmap
                </Button>
            </div>
            <div className="flex flex-row justify-between py-4">
                <Input
                    placeholder="Search seat maps..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="max-w-sm"
                />
                <SelectSizeInput />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Seat Map ID</TableHead>
                            <TableHead>Airline</TableHead>
                            <TableHead>Aircraft Model</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead className="text-center">Seats</TableHead>
                            <TableHead>Class Distribution</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="ml-2">Loading seatmap data...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-destructive">
                                    {error}
                                </TableCell>
                            </TableRow>
                        ) : data.length > 0 ? (
                            data.map((seatmap) => (
                                <TableRow key={seatmap.seatMapId}>
                                    <TableCell className="font-medium">{seatmap.seatMapId}</TableCell>
                                    <TableCell>{seatmap.airlineName}</TableCell>
                                    <TableCell>{seatmap.aircraftModel}</TableCell>
                                    <TableCell>{seatmap.version}</TableCell>
                                    <TableCell className="text-center">{seatmap.seatCount}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {seatmap.classDistribution.split(", ").map((item, index) => {
                                                const [cls] = item.split(": ")
                                                return (
                                                    <Badge
                                                        key={index}
                                                        variant={cls === "F" ? "default" : cls === "C" ? "secondary" : cls === "W" ? "outline" : "destructive"}
                                                        className="text-xs"
                                                    >
                                                        {item}
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="flex items-center justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={()=>{
                                            setMode("edit")
                                            setEffectiveSeatmapId(seatmap.seatMapId)
                                        }}>
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
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {loading ? (
                        "Loading..."
                    ) : (
                        `${(pageIndex - 1) * pageSize} - ${Math.min((pageIndex - 1) * pageSize + pageSize, totalCount)} of ${totalCount} row(s) selected.`
                    )}
                </div>
                <div className="space-x-2">
                    <CustomPagination 
                        className="w-full flex flex-row justify-start" 
                        currentPage={pageIndex} 
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPageIndex}
                        siblingCount={1}
                    />
                </div>
            </div>
        </div>
    )
}