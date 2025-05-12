/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Airport, AirportAPIType } from "@/types/type"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import AirportTable from "./airport-table"
// import AddAirportSheet from "./add-airport-sheet"

interface AirportAdminResponseType {
    message: string
    data: AirportAPIType[]
    status: boolean
    pagination:{
        size: number
        page: number
        totalCount: number
    }
}

export default function AirportAdmin() {
    const { backend:backendURL }: BackendURLType = useBackendURL();
    const [airports, setAirports] = useState<AirportAPIType[]>([])
    const [isAddAirportOpen, setIsAddAirportOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [selectedCarrier, setSelectedCarrier]     = useState<Airport>()
    const [carriers, setCarriers]                   = useState<Airport[]>([])
    const [loadingCarrier, setLoadingCarrier]       = useState<boolean>(false)

    //Pagination state
    const [page, setPage] = useState<number>(1)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [pageSize, setPageSize] = useState<number>(20)
    const [totalCount, setTotalCount] = useState<number>(0)
    
    //Refresh for new airport added
    const [newAirportAdded, setNewAirportAdded] = useState<boolean>(false)
    useEffect(()=>{
        const fetchAirports = async () => {
            setIsLoading(true)
            if(!backendURL || backendURL == "") return
            try {
                const response = await fetch(`/api/query/admin/airport/${pageSize}/${page}?query=${searchQuery}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data: AirportAdminResponseType = await response.json()
                    console.log(data)
                    setAirports(data?.data)
                    setTotalCount(data?.pagination.totalCount)
                    console.log(data?.data)
                } else {
                    console.error("Error fetching airports:", await response.json())
                }
            } catch (error) {
                console.error("Error fetching airports:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAirports()

    }, [searchQuery, page, pageSize, backendURL, selectedCarrier, newAirportAdded])
    // const handleAddAirport = async (newAirport: SubmitAirport, onSuccess: ()=> void, onError: ()=> void) => {
    //     setIsLoading(true)
    //     const response = await fetch(`${backendURL}/flight/addAirport`,{
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(newAirport),
    //     })
        
    //     if(response.ok) {
    //         const data = await response.json()
    //         console.log(data)
    //         onSuccess()
    //         toast.success("Airport added successfully")
    //         const currStatus = newAirportAdded
    //         setNewAirportAdded(!currStatus)
    //     }else{
    //         toast.error("Failed to add airport, Check console for more details.")
    //         console.error("Error adding airport:", await response.json())
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
                <h1 className="text-3xl font-bold tracking-tight">Airport Management</h1>
                <Button onClick={() => { 
                // if((selectedCarrier?.name ?? "") == ""){
                    // toast.error("Please select an airport first.")
                // }else{
                    setIsAddAirportOpen(true)
                // }
                }} className="gap-1">
                <PlusCircle className="h-4 w-4" />
                    Add Airport
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Airport
                    </CardTitle>
                    <CardDescription>
                        View and manage all airports.
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
                    <AirportTable searchQuery={searchQuery} setSearchQuery={setSearchQuery} airports={airports} isLoading={isLoading} />
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

            {/* <AddAirportSheet
                open={isAddAirportOpen}
                onOpenChange={setIsAddAirportOpen}
                onAddAirport={handleAddAirport}
                isLoading={isLoading}
            /> */}
        </div>
    )
}
