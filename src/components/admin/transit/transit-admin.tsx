 
"use client"

import { DebouncedSearch } from "@/components/reusable/search"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminTransitListType, Airline, SubmitTransit } from "@/types/type"
import { PlaneIcon, PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import AddTransitSheet from "./add-transit-sheet"
import TransitTable from "./transit-table"
import { useDebounce } from "@uidotdev/usehooks"

interface TransitAdminResponseType {
    message: string
    data: adminTransitListType[]
    size: number
    page: number
    status: boolean
    totalCount: number
}

export default function TransitAdmin() {
    const { backend:backendURL }: BackendURLType = useBackendURL();
    const [transits, setTransits] = useState<adminTransitListType[]>([])
    const [isAddTransitOpen, setIsAddTransitOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [selectedCarrier, setSelectedCarrier]     = useState<Airline>()
    const [carriers, setCarriers]                   = useState<Airline[]>([])
    const [loadingCarrier, setLoadingCarrier]       = useState<boolean>(false)

    //Pagination state
    const [page, setPage] = useState<number>(1)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [pageSize, setPageSize] = useState<number>(20)
    const [totalCount, setTotalCount] = useState<number>(0)
    
    //Refresh for new transit added
    const [newTransitAdded, setNewTransitAdded] = useState<boolean>(false)

    const [defaultValue, setDefaultValue] = useState<SubmitTransit | null>(null)
    const [helperDefaultValue, setHelperDefaultValue] = useState<adminTransitListType | null>(null)
    const debounceSearchQuery = useDebounce(searchQuery, 500)
    useEffect(()=>{
        const fetchTransits = async () => {
            setIsLoading(true)
            if(!backendURL || backendURL == "") return
            try {
                const response = await fetch(`${backendURL}/flight/transit/${selectedCarrier?.code}/${pageSize}/${page}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        searchQuery: debounceSearchQuery
                    })
                })
                if (response.ok) {
                const data: TransitAdminResponseType = await response.json()
                console.log(data)
                setTransits(data?.data)
                setTotalCount(data?.totalCount)
                console.log(data?.data)
                } else {
                console.error("Error fetching transits:", await response.json())
                }
            } catch (error) {
                console.error("Error fetching transits:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTransits()

    }, [debounceSearchQuery, page, pageSize, backendURL, selectedCarrier, newTransitAdded])
    const handleAddTransit = async (newTransit: SubmitTransit, onSuccess: ()=> void, onError: ()=> void) => {
        toast.promise(
            async () => {
                setIsLoading(true)
                const response = await fetch(`${backendURL}/flight/addTransit`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newTransit),
                })
                
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    onSuccess()
                    const currStatus = newTransitAdded
                    setNewTransitAdded(!currStatus)
                }else{
                    toast.error("Failed to add transit, Check console for more details.")
                    console.error("Error adding transit:", await response.json())
                    onError()
                }
            },
            {
                loading: "Adding transit...",
                success: () => {
                    setIsLoading(false)
                    return "Transit added successfully";
                },
                error: (error) => {
                    setIsLoading(false)
                    console.error("Error adding transit:", error)
                    return "Failed to add transit, Check console for more details."
                }
            }
        )
    }
    const handleEditTransit = async (newTransit: SubmitTransit, onSuccess: ()=> void, onError: ()=> void) => {
        toast.promise(
            async () => {
                setIsLoading(true)
                const response = await fetch(`${backendURL}/flight/editTransit`,{
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        old: {
                            flightNumFrom: helperDefaultValue?.flightNumFrom,
                            flightNumTo: helperDefaultValue?.flightNumTo,
                            airlineCodeFrom: helperDefaultValue?.airlineCodeFrom,
                            airlineCodeTo: helperDefaultValue?.airlineCodeTo,
                        },
                        new: newTransit
                    }),
                })
                
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    onSuccess()
                    const currStatus = newTransitAdded
                    setNewTransitAdded(!currStatus)
                }else{
                    toast.error("Failed to edit transit, Check console for more details.")
                    console.error("Error adding transit:", await response.json())
                    onError()
                }
            },
            {
                loading: "Editing transit...",
                success: () => {
                    setIsLoading(false)
                    return "Transit edited successfully";
                },
                error: (error) => {
                    setIsLoading(false)
                    console.error("Error editing transit:", error)
                    return "Failed to edit transit, Check console for more details."
                }
            }
        )
    }
    const promptEditTransit = (index: number)=>{
        console.log("editing...................")
        const transit = transits[index]
        setDefaultValue({
            flightNumFrom: transit.flightNumFrom,
            flightNumTo: transit.flightNumTo,
            airlineCodeFrom: transit.airlineCodeFrom,
            airlineCodeTo: transit.airlineCodeTo,
        })
        setHelperDefaultValue(transit)
        setIsAddTransitOpen(true)
    }
    const confirmDeleteTransit = (index: number) => {
        toast.promise(
            async () => {
                setIsLoading(true)
                const transit = transits[index]
                const response = await fetch(`${backendURL}/flight/deleteTransit`,{
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        flightNumFrom: transit.flightNumFrom,
                        flightNumTo: transit.flightNumTo,
                        airlineCodeFrom: transit.airlineCodeFrom,
                        airlineCodeTo: transit.airlineCodeTo,
                    }),
                })
                
                if(response.ok) {
                    const data = await response.json()
                    console.log(data)
                    const currStatus = newTransitAdded
                    setNewTransitAdded(!currStatus)
                }else{
                    toast.error("Failed to delete transit, Check console for more details.")
                    console.error("Error adding transit:", await response.json())
                }
            },
            {
                loading: "Deleting transit...",
                success: () => {
                    setIsLoading(false)
                    return "Transit deleted successfully";
                },
                error: (error) => {
                    setIsLoading(false)
                    console.error("Error deleting transit:", error)
                    return "Failed to delete transit, Check console for more details."
                }
            }
        )
    }
    const handleDeleteTransit = async (index: number) => {
        toast.warning("Are you sure you want to delete this transit?", {
            action: {
                label: "Sure",
                onClick: () => {
                    confirmDeleteTransit(index)
                }
            },
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
                <h1 className="text-3xl font-bold tracking-tight">Transit Management</h1>
                <Button onClick={() => { 
                // if((selectedCarrier?.name ?? "") == ""){
                    // toast.error("Please select an airline first.")
                // }else{
                    setIsAddTransitOpen(true)
                // }
                }} className="gap-1">
                <PlusCircle className="h-4 w-4" />
                    Add Transit
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
                    Transit
                    </CardTitle>
                    <CardDescription>
                    View and manage all transits belonging to the airline.
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
                    <TransitTable
                        handleEditTransit={promptEditTransit}
                        handleDeleteTransit={handleDeleteTransit}
                        searchQuery={searchQuery} setSearchQuery={setSearchQuery} transits={transits} isLoading={isLoading} />
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

            <AddTransitSheet
                open={isAddTransitOpen}
                onOpenChange={()=>{
                    setIsAddTransitOpen(false)
                    setDefaultValue(null)
                    setHelperDefaultValue(null)
                }}
                defaultValue={defaultValue}
                helperDefaultValue={helperDefaultValue}
                onAddTransit={handleAddTransit}
                onEditTransit={handleEditTransit}
                isLoading={isLoading}
            />
        </div>
    )
}
