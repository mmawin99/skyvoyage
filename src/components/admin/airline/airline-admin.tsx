/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlaneIcon, PlusCircle } from "lucide-react"
import { Airline, Schedule, ScheduleListAdmin, SubmitSchedule, AirlineAPIType } from "@/types/type"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
// import AirlineTable from "./airline-table"
import { DebouncedSearch } from "@/components/reusable/search"
// import AddAirlineSheet from "./add-airline-sheet"
import { toast } from "sonner"
import AirlineTable from "./airline-table"

interface AirlineAdminResponseType {
    message: string
    data: AirlineAPIType[]
    size: number
    page: number
    status: boolean
    totalCount: number
}

export default function AirlineAdmin() {
    const { backend:backendURL }: BackendURLType = useBackendURL();
    const [airlines, setAirlines] = useState<AirlineAPIType[]>([])
    const [isAddAirlineOpen, setIsAddAirlineOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [selectedCarrier, setSelectedCarrier]     = useState<Airline>()
    const [carriers, setCarriers]                   = useState<Airline[]>([])
    const [loadingCarrier, setLoadingCarrier]       = useState<boolean>(false)

    //Pagination state
    const [page, setPage] = useState<number>(1)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [pageSize, setPageSize] = useState<number>(20)
    const [totalCount, setTotalCount] = useState<number>(0)
    
    //Refresh for new airline added
    const [newAirlineAdded, setNewAirlineAdded] = useState<boolean>(false)
    useEffect(()=>{
        const fetchAirlines = async () => {
            setIsLoading(true)
            if(!backendURL || backendURL == "") return
            try {
                const response = await fetch(`/api/query/admin/airline/${pageSize}/${page}?query=${searchQuery}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data: AirlineAdminResponseType = await response.json()
                    console.log(data)
                    setAirlines(data?.data)
                    setTotalCount(data?.totalCount)
                    console.log(data?.data)
                } else {
                    console.error("Error fetching airlines:", await response.json())
                }
            } catch (error) {
                console.error("Error fetching airlines:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAirlines()

    }, [searchQuery, page, pageSize, backendURL, selectedCarrier, newAirlineAdded])
    // const handleAddAirline = async (newAirline: SubmitAirline, onSuccess: ()=> void, onError: ()=> void) => {
    //     setIsLoading(true)
    //     const response = await fetch(`${backendURL}/flight/addAirline`,{
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(newAirline),
    //     })
        
    //     if(response.ok) {
    //         const data = await response.json()
    //         console.log(data)
    //         onSuccess()
    //         toast.success("Airline added successfully")
    //         const currStatus = newAirlineAdded
    //         setNewAirlineAdded(!currStatus)
    //     }else{
    //         toast.error("Failed to add airline, Check console for more details.")
    //         console.error("Error adding airline:", await response.json())
    //         onError()
    //     }
    //     setIsLoading(false)
    // }

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
                <h1 className="text-3xl font-bold tracking-tight">Airline Management</h1>
                <Button onClick={() => { 
                // if((selectedCarrier?.name ?? "") == ""){
                    // toast.error("Please select an airline first.")
                // }else{
                    setIsAddAirlineOpen(true)
                // }
                }} className="gap-1">
                <PlusCircle className="h-4 w-4" />
                    Add Airline
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Airline
                    </CardTitle>
                    <CardDescription>
                        View and manage all airlines.
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
                    <AirlineTable searchQuery={searchQuery} setSearchQuery={setSearchQuery} airlines={airlines} isLoading={isLoading} />
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
            </Card> 

            {/* <AddAirlineSheet
                open={isAddAirlineOpen}
                onOpenChange={setIsAddAirlineOpen}
                onAddAirline={handleAddAirline}
                isLoading={isLoading}
            /> */}
        </div>
    )
}
