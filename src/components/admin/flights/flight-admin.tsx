 
"use client"

import { DebouncedSearch } from "@/components/reusable/search"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminFlightListType, Airline, SubmitFlight } from "@/types/type"
import { PlaneIcon, PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import AddFlightSheet from "./add-flight-sheet"
import FlightTable from "./flight-table"
import { useDebounce } from "@uidotdev/usehooks"

interface FlightAdminFetchResponse {
    message: string
    data: adminFlightListType[]
    size: number
    page: number
    status: boolean
    totalCount: number
}

export default function FlightAdmin() {
    const { backend:backendURL }: BackendURLType = useBackendURL();
    const [flights, setFlights] = useState<adminFlightListType[]>([])
    const [isAddFlightOpen, setIsAddFlightOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [selectedCarrier, setSelectedCarrier]     = useState<Airline>()
    const [carriers, setCarriers]                   = useState<Airline[]>([])
    const [loadingCarrier, setLoadingCarrier]       = useState<boolean>(false)

    //Pagination state
    const [page, setPage] = useState<number>(1)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [pageSize, setPageSize] = useState<number>(20)
    const [totalCount, setTotalCount] = useState<number>(0)
    
    //Refresh for new flight added
    const [newFlightAdded, setNewFlightAdded] = useState<boolean>(false)
    const [defaultValue, setDefaultValue] = useState<SubmitFlight|null>(null)
    const debounceSearchQuery = useDebounce(searchQuery, 200)
    useEffect(()=>{
        const fetchFlights = async () => {
            setIsLoading(true)
            if(!backendURL || backendURL == "") return
            if(!selectedCarrier) return
            try {
                const response = await fetch(`${backendURL}/flight/flightlist/${selectedCarrier?.code}/${pageSize}/${page}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        searchQuery: debounceSearchQuery
                    })
                })
                if (response.ok) {
                const data: FlightAdminFetchResponse = await response.json()
                console.log(data)
                setFlights(data?.data)
                setTotalCount(data?.totalCount)
                console.log(data?.data)
                } else {
                console.error("Error fetching flights:", await response.json())
                }
            } catch (error) {
                console.error("Error fetching flights:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchFlights()

    }, [debounceSearchQuery, page, pageSize, backendURL, selectedCarrier, newFlightAdded])
    const handleAddFlight = async (newFlight: SubmitFlight, onSuccess: ()=> void, onError: ()=> void) => {
        toast.promise(
            async () => {
                if(!backendURL || backendURL == "") return
                const response = await fetch(`${backendURL}/flight/addFlight`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newFlight),
                })
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    onSuccess()
                    setNewFlightAdded(!newFlightAdded)
                    return data
                }else{
                    onError()
                    console.error("Failed to add flight")
                }
            }
            , {
                loading: "Adding flight...",
                success: (data) => {
                    console.log(data)
                    return "Flight added successfully"
                },
                error: (error) => {
                    console.error("Error adding flight:", error)
                    return "Failed to add flight, Check console for more details."
                },
            }
        )
    }
    const handleEditFlight = async (newFlight: SubmitFlight, onSuccess: ()=> void, onError: ()=> void) => {
        toast.promise(
            async () => {
                if(!backendURL || backendURL == "") return
                const response = await fetch(`${backendURL}/flight/editFlight`,{
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newFlight),
                })
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    onSuccess()
                    setNewFlightAdded(!newFlightAdded)
                    return data
                }else{
                    onError()
                    console.error("Failed to edit flight")
                }
            }
            , {
                loading: "Editing flight...",
                success: (data) => {
                    console.log(data)
                    return "Flight edited successfully"
                },
                error: (error) => {
                    console.error("Error editing flight:", error)
                    return "Failed to edit flight, Check console for more details."
                },
            }
        )
    }
    const promptEditFlight = (index: number) => {
        const flight = flights[index]
        setDefaultValue({
            flightNum: flight.flightNum,
            airlineCode: flight.airlineCode,
            departAirportId: flight.departAirportId,
            arriveAirportId: flight.arriveAirportId,
            departureTime: flight.utcDepartureTime,
            arrivalTime: flight.utcArrivalTime,
        })
        setIsAddFlightOpen(true)
    }

    const confirmDeleteFlight = async (index: number) => {
        const flight = flights[index]
        toast.promise(
            async () => {
                if(!backendURL || backendURL == "") return
                const response = await fetch(`${backendURL}/flight/deleteFlight/${flight.airlineCode}/${flight.flightNum}`,{
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    setNewFlightAdded(!newFlightAdded)
                    return data
                }else{
                    console.error("Failed to delete flight")
                }
            }
            , {
                loading: "Deleting flight...",
                success: (data) => {
                    console.log(data)
                    return "Flight deleted successfully"
                },
                error: (error) => {
                    console.error("Error deleting flight:", error)
                    return "Failed to delete flight, Check console for more details."
                },
            }
        )
    }

    const handleDeleteFlight = async (index: number) => {
        toast.warning("Are you sure you want to delete this flight?", {
            action: {
                label: "Delete",
                onClick: () => {
                    confirmDeleteFlight(index)
                }
            }
        })
    }

    const SelectSizeInput = ()=>{
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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Flight Management</h1>
                <Button onClick={() => { 
                if((selectedCarrier?.name ?? "") == ""){
                    toast.error("Please select an airline first.")
                }else{
                    setIsAddFlightOpen(true)
                }
                }} className="gap-1">
                <PlusCircle className="h-4 w-4" />
                    Add Flight
                </Button>
            </div>
                <div className="flex flex-row gap-2">
                    <div className="w-75">
                        <DebouncedSearch<Airline>
                            title="Search for airline"
                            Icon={PlaneIcon}
                            selected={selectedCarrier ?? null}
                            onSelect={setSelectedCarrier}
                            requestMethod="GET"
                            results={carriers}
                            setResults={setCarriers}
                            loading={loadingCarrier}
                            setLoading={setLoadingCarrier}
                            fetchUrl={(q) => `${backendURL}/autocomplete/airline/${q}`}
                            renderItem={(airline) => (
                                <div>
                                {airline.name}, ({airline.code})
                                </div>
                            )}
                            renderSelectedItem={(airline) => (
                                <div>
                                {airline.name}, ({airline.code})
                                </div>
                            )}
                        />
                    </div>
                </div>

            {
                selectedCarrier ? 
                <Card>
                <CardHeader>
                    <CardTitle>
                    Flight
                    </CardTitle>
                    <CardDescription>
                    View and manage all flights belonging to the airline.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row justify-between mb-4">
                        <CustomPagination className="w-full flex flex-row justify-start" 
                            currentPage={parseInt(String(page))} 
                            totalCount={totalCount} 
                            pageSize={pageSize} 
                            onPageChange={setPage}
                            siblingCount={1}
                        />
                        <SelectSizeInput />
                    </div>
                    <FlightTable 
                    handleDeleteFlight={handleDeleteFlight}
                    handleEditFlight={promptEditFlight} searchQuery={searchQuery} setSearchQuery={setSearchQuery} flights={flights} isLoading={isLoading} />
                    <div className="flex flex-row justify-between mt-4">
                    <CustomPagination className="w-full flex flex-row justify-start" 
                        currentPage={parseInt(String(page))} 
                        totalCount={totalCount} 
                        pageSize={pageSize} 
                        onPageChange={setPage}
                        siblingCount={1}
                    />
                    <SelectSizeInput />
                    </div>
                </CardContent>
                </Card> :
                <Card className="flex flex-col items-center justify-center gap-6 py-20 w-full">
                <PlaneIcon className="h-24 w-24 text-blue-500" />
                <div className="text-xl font-semibold">No airline selected</div>
                </Card>
            }

            <AddFlightSheet
                open={isAddFlightOpen}
                onOpenChange={()=>{
                    setIsAddFlightOpen(false)
                    setDefaultValue(null)
                }}
                onAddFlight={handleAddFlight}
                onEditFlight={handleEditFlight}
                isLoading={isLoading}
                defaultValue={defaultValue}
                carrier={{
                    name: selectedCarrier?.name ?? "",
                    code: selectedCarrier?.code ?? "",
                }}
            />
        </div>
    )
}
