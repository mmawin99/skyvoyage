/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Airline, AirlineAPIType, SubmitAirline } from "@/types/type"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
// import AirlineTable from "./airline-table"
// import AddAirlineSheet from "./add-airline-sheet"
import AirlineTable from "./airline-table"
import AddAirlineSheet from "./add-airline-sheet"
import { toast } from "sonner"
import { useDebounce } from "@uidotdev/usehooks"

interface AirlineAdminResponseType {
    message: string
    data: AirlineAPIType[]
    status: boolean
    pagination:{
        size: number
        page: number
        totalCount: number
    }
}

export default function AirlineAdmin() {
    const { backend:backendURL }: BackendURLType = useBackendURL();
    const [airlines, setAirlines] = useState<AirlineAPIType[]>([])
    const [isAddAirlineOpen, setIsAddAirlineOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    //Pagination state
    const [page, setPage] = useState<number>(1)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [pageSize, setPageSize] = useState<number>(20)
    const [totalCount, setTotalCount] = useState<number>(0)
    
    //Refresh for new airline added
    const [newAirlineAdded, setNewAirlineAdded] = useState<boolean>(false)

    const [defaultValue, setDefaultValue] = useState<SubmitAirline|null>(null)
    const debouncecSearchQuery = useDebounce(searchQuery, 500)
    useEffect(()=>{
        const fetchAirlines = async () => {
            setIsLoading(true)
            if(!backendURL || backendURL == "") return
            try {
                const response = await fetch(`/api/query/admin/airline/${pageSize}/${page}?query=${debouncecSearchQuery}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data: AirlineAdminResponseType = await response.json()
                    console.log(data)
                    setAirlines(data?.data)
                    setTotalCount(data?.pagination.totalCount)
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

    }, [debouncecSearchQuery, page, pageSize, backendURL, newAirlineAdded])
    
    const handleAddAirline = async (newAirline: SubmitAirline, onSuccess: ()=> void, onError: ()=> void) => {
        toast.promise(
            async () => {
                setIsLoading(true)
                const response = await fetch(`${backendURL}/flight/addAirline`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newAirline),
                })
                
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    onSuccess()
                    const currStatus = newAirlineAdded
                    setNewAirlineAdded(!currStatus)
                }else{
                    console.error("Error adding airline:", await response.json())
                    toast.error("Failed to add airline")
                }
            },
            {
                loading: "Adding airline...",
                success: () => {
                    setIsLoading(false)
                    return "Airline added successfully"
                },
                error: (error) => {
                    setIsLoading(false)
                    console.error("Error adding airline:", error)
                    return "Failed to add airline, Check console for more details."
                }
            }
        )
    }

    const handleEditAirline = async (newAirline: SubmitAirline, onSuccess: ()=> void, onError: ()=> void) => {
        toast.promise(
            async () => {
                setIsLoading(true)
                const response = await fetch(`${backendURL}/flight/editAirline`,{
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newAirline),
                })
                
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    onSuccess()
                    const currStatus = newAirlineAdded
                    setNewAirlineAdded(!currStatus)
                }else{
                    console.error("Error editing airline:", await response.json())
                    toast.error("Failed to edit airline")
                }
            },
            {
                loading: "Editing airline...",
                success: () => {
                    setIsLoading(false)
                    return "Airline edited successfully"
                },
                error: (error) => {
                    setIsLoading(false)
                    console.error("Error editing airline:", error)
                    return "Failed to edit airline, Check console for more details."
                }
            }
        )
    }

    const confirmDeleteAirline = async (index: number) => {
        const airlineCode = airlines[index].airlineCode
        toast.promise(
            async () => {
                setIsLoading(true)
                const response = await fetch(`${backendURL}/flight/deleteAirline/${airlineCode}`,{
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    const currStatus = newAirlineAdded
                    setNewAirlineAdded(!currStatus)
                }else{
                    console.error("Error deleting airline:", await response.json())
                    toast.error("Failed to delete airline")
                }
            },
            {
                loading: "Deleting airline...",
                success: () => {
                    setIsLoading(false)
                    return "Airline deleted successfully"
                },
                error: (error) => {
                    setIsLoading(false)
                    console.error("Error deleting airline:", error)
                    return "Failed to delete airline, Check console for more details."
                }
            }
        )
    }

    const handleDeleteAirline = async (index: number)=>{
        toast.warning("Are you sure you want to delete this airline?", {
            description: "This action cannot be undone.",
            action: {
                "label": "Delete",
                onClick: ()=>{
                    confirmDeleteAirline(index)
                }
            }
        })
    }

    const promptEditAirline = (index: number)=>{
        setDefaultValue({
            airlineCode: airlines[index].airlineCode,
            airlineName: airlines[index].airlineName
        })
        setIsAddAirlineOpen(true)
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
                <h1 className="text-3xl font-bold tracking-tight">Airline Management</h1>
                <Button onClick={() => { 
                    setIsAddAirlineOpen(true)
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
                    <AirlineTable 
                        handleDeleteAirline={(index)=>{
                            handleDeleteAirline(index)
                        }}
                        handleEditAirline={(index)=>{
                            promptEditAirline(index)
                        }}
                        searchQuery={searchQuery} setSearchQuery={setSearchQuery} airlines={airlines} 
                        isLoading={isLoading} 
                    />
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

            <AddAirlineSheet
                open={isAddAirlineOpen}
                onOpenChange={()=>{
                    setIsAddAirlineOpen(false)
                    setDefaultValue(null)
                }}
                onAddAirline={handleAddAirline}
                onEditAirline={handleEditAirline}
                isLoading={isLoading}
                defaultValue={defaultValue}
            />
        </div>
    )
}
