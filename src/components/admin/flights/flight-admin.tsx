/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlaneIcon, PlusCircle } from "lucide-react"
import { adminFlightListType, Airline, Schedule, ScheduleListAdmin, SubmitFlight, SubmitSchedule } from "@/types/type"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import FlightTable from "./flight-table"
import { DebouncedSearch } from "@/components/reusable/search"
import AddFlightSheet from "./add-flight-sheet"
import { toast } from "sonner"

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
    useEffect(()=>{
        const fetchFlights = async () => {
            setIsLoading(true)
            if(!backendURL || backendURL == "") return
            try {
                const response = await fetch(`${backendURL}/flight/flightlist/${selectedCarrier?.code}/${pageSize}/${page}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        searchQuery: searchQuery
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

    }, [searchQuery, page, pageSize, backendURL, selectedCarrier, newFlightAdded])
    const handleAddFlight = async (newFlight: SubmitFlight, onSuccess: ()=> void, onError: ()=> void) => {
        setIsLoading(true)
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
            toast.success("Flight added successfully")
            const currStatus = newFlightAdded
            setNewFlightAdded(!currStatus)
        }else{
        toast.error("Failed to add flight, Check console for more details.")
        console.error("Error adding flight:", await response.json())
        onError()
        }
        setIsLoading(false)
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
                    <FlightTable searchQuery={searchQuery} setSearchQuery={setSearchQuery} flights={flights} isLoading={isLoading} />
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
                onOpenChange={setIsAddFlightOpen}
                onAddFlight={handleAddFlight}
                isLoading={isLoading}
                carrier={{
                name: selectedCarrier?.name ?? "",
                code: selectedCarrier?.code ?? "",
                }}
            />
        </div>
    )
}
