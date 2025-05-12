/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Airport, AirportAPIType, SubmitAirport } from "@/types/type"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import AirportTable from "./airport-table"
import AddAirportSheet from "./add-airport-sheet"
import { toast } from "sonner"
import { useDebounce } from "@uidotdev/usehooks"
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

    const [defaultValue, setDefaultValue] = useState<SubmitAirport | null>(null)
    const debounceSearchQuery = useDebounce(searchQuery, 300)
    useEffect(()=>{
        const fetchAirports = async () => {
            setIsLoading(true)
            if(!backendURL || backendURL == "") return
            try {
                const response = await fetch(`/api/query/admin/airport/${pageSize}/${page}?query=${debounceSearchQuery}`, {
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

    }, [debounceSearchQuery, page, pageSize, backendURL, selectedCarrier, newAirportAdded])
    const handleAddAirport = async (newAirport: SubmitAirport, onSuccess: ()=> void, onError: ()=> void) => {
        toast.promise(
            async () => {
                setIsLoading(true)
                const response = await fetch(`${backendURL}/flight/addAirport`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newAirport),
                })
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    onSuccess()
                    setNewAirportAdded(!newAirportAdded)
                }else{
                    console.error("Error adding airport:", await response.json())
                    onError()
                }
            }, {
                loading: "Adding airport...",
                success: () => {
                    setIsLoading(false)
                    return "Airport added successfully"
                },
                error: (error) => {
                    setIsLoading(false)
                    return `Failed to add airport, Check console for more details.`
                }
            }
        )
    }
    const handleEditAirport = async (newAirport: SubmitAirport, onSuccess: ()=> void, onError: ()=> void) => {
        console.log("editing airport", newAirport)
        toast.promise(
            async () => {
                setIsLoading(true)
                const response = await fetch(`${backendURL}/flight/editAirport`,{
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newAirport),
                })
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    onSuccess()
                    setNewAirportAdded(!newAirportAdded)
                }else{
                    console.error("Error editing airport:", await response.json())
                    onError()
                }
            }, {
                loading: "Editing airport...",
                success: () => {
                    setIsLoading(false)
                    return "Airport edited successfully"
                },
                error: (error) => {
                    setIsLoading(false)
                    return `Failed to edit airport, Check console for more details.`
                }
            }
        )
    }
    const promptEditAirport = (index: number) => {
        const airport = airports[index]
        setDefaultValue({
            airportCode: airport.airportCode,
            name: airport.name,
            country: airport.country,
            city: airport.city,
            latitude: airport.latitude,
            longitude: airport.longitude,
            timezone: airport.timezone,
            altitude: airport.altitude ?? 0 // Provide a default value if altitude is undefined
        })
        setIsAddAirportOpen(true)
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
                    <AirportTable 
                        handleDeleteAirport={(index)=>{
                            toast.error("Delete airline feature is not implemented yet.")
                        }}
                        handleEditAirport={(index)=>{
                            promptEditAirport(index)
                        }}
                        searchQuery={searchQuery} setSearchQuery={(query)=>{
                            setSearchQuery(query)
                            setPage(1)
                        }} airports={airports} isLoading={isLoading} />
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

            <AddAirportSheet
                open={isAddAirportOpen}
                onOpenChange={()=>{
                    setIsAddAirportOpen(false)
                    setDefaultValue(null)
                }}
                onAddAirport={handleAddAirport}
                onEditAirport={handleEditAirport}
                isLoading={isLoading}
                defaultValue={defaultValue}
            />
        </div>
    )
}
