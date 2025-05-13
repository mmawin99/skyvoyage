"use client"

import { Button } from "@/components/ui/button"
import { AircraftRegistration, Airline, SubmitAircraft } from "@/types/type"
import { Loader2, PlaneIcon, PlaneTakeoff, PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { DebouncedSearch } from "../../reusable/search"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import AddAircraftSheet from "./add-aircraft-sheet"
import AircraftTable from "./aircraft-table"


export default function AircraftAdmin() {
    const { backend:backendURL }: BackendURLType    = useBackendURL();
    const [selectedCarrier, setSelectedCarrier]     = useState<Airline>()
    const [carriers, setCarriers]                   = useState<Airline[]>([])
    const [loadingCarrier, setLoadingCarrier]       = useState<boolean>(false)
    const [page, setPage]                           = useState<number>(1)
    const [pageSize, setPageSize]                   = useState<number>(20)
    const [totalCount, setTotalCount]               = useState<number>(0)
    const [isLoadingAircraft, setIsLoadingAircraft] = useState<boolean>(false)
    const [aircraft, setAircraft]                   = useState<AircraftRegistration[]>([])

    const [isAddAircraftOpen, setIsAddAircraftOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [newAircraftAdded, setNewAircraftAdded] = useState<boolean>(false)

    useEffect(() => {
        const fetchAircraft = async () => {
            setIsLoadingAircraft(true)
            if(!backendURL || backendURL == "") return
            if(!selectedCarrier) return
            if(selectedCarrier?.code == "") return
            try {
                const response = await fetch(`${backendURL}/autocomplete/aircraft/${selectedCarrier?.code}/${pageSize}/${page}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data:{data:AircraftRegistration[], status:boolean, totalCount:number,
                                page:number,pageSize:number} = await response.json()
                    setAircraft(data?.data)
                    setTotalCount(data?.totalCount)
                    // setPage(data?.page)
                } else {
                    console.error("Error fetching flights:", await response.json())
                }
            } catch (error) {
                console.error("Error fetching flights:", error)
            } finally {
                setIsLoadingAircraft(false)
            }
        }
        fetchAircraft()
    }, [page, pageSize, selectedCarrier, backendURL, newAircraftAdded]);

    const handleAddAircraft = async (newFlight: SubmitAircraft, onSuccess: ()=> void, onError: ()=> void) => {
        setIsLoading(true)
        const response = await fetch(`${backendURL}/flight/addAircraft`,{
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
            toast.success("Aircraft added successfully")
            const currStatusAdded = newAircraftAdded
            setNewAircraftAdded(!currStatusAdded)
        }else{
            toast.error("Failed to add Aircraft, Check console for more details.")
            console.error("Error adding Aircraft:", await response.json())
            onError()
        }
        setIsLoading(false)
    }

    const confirmDeleteAircraft = async (index: number) => {
        toast.promise(
            async () => {
                setIsLoading(true)
                const response = await fetch(`${backendURL}/flight/deleteAircraft/${aircraft[index].registration}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    console.log(data)
                    toast.success("Aircraft deleted successfully")
                    const currStatusAdded = newAircraftAdded
                    setNewAircraftAdded(!currStatusAdded)
                } else {
                    toast.error("Failed to delete Aircraft, Check console for more details.")
                    console.error("Error deleting Aircraft:", await response.json())
                }
            },
            {
                loading: "Deleting Aircraft...",
                success: "Aircraft deleted successfully",
                error: "Failed to delete Aircraft, Check console for more details.",
            }
        )
    }

    const handleDeleteAircraft = async (index: number)=>{
        toast.warning("are you sure you want to delete this aircraft?", {
            description: "This action cannot be undone",
            action: {
                label: "Delete",
                onClick: async () => {
                    confirmDeleteAircraft(index)
                }
            }
        })
    }

    return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Aircraft Management</h1>
                    <Button onClick={() => { setIsAddAircraftOpen(true) }} className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                        Add Aircraft
                    </Button>
                </div>
                <div className="flex flex-row gap-2">
                    <div className="w-75">
                        <DebouncedSearch<Airline>
                            title="Search for airline"
                            Icon={PlaneIcon}
                            selected={selectedCarrier ?? null}
                            onSelect={(sel)=>{
                                setSelectedCarrier(sel)
                                setPage(1)
                            }}
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
                    <div>
                        <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select page size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                                <SelectItem value="40">40</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="60">60</SelectItem>
                                <SelectItem value="70">70</SelectItem>
                                <SelectItem value="80">80</SelectItem>
                                <SelectItem value="90">90</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <CustomPagination className="w-full flex flex-row justify-start" 
                        currentPage={parseInt(String(page))} 
                        totalCount={totalCount} 
                        pageSize={pageSize} 
                        onPageChange={setPage}
                        siblingCount={1}
                        />
                    </div>
                </div>
                {
                    selectedCarrier && (isLoadingAircraft || loadingCarrier) ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div> ) :
                    selectedCarrier ?
                        (
                            <Card className="col-span-2 md:col-span-3 lg:col-span-4">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-semibold">{selectedCarrier?.name} ({selectedCarrier?.code}) ({totalCount} Aircrafts)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col">
                                        {aircraft.length > 0 ? <AircraftTable handleDeleteAircraft={handleDeleteAircraft} aircraft={aircraft} isLoading={isLoadingAircraft} /> : (
                                            <div className="flex flex-col items-center justify-center gap-6 py-6 w-full">
                                                <PlaneTakeoff className="h-24 w-24 text-blue-600" />
                                                <div className="text-xl font-semibold">No aircraft found</div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                        <Card className="flex flex-col items-center justify-center gap-6 py-20 w-full">
                            <PlaneIcon className="h-24 w-24 text-blue-600" />
                            <div className="text-xl font-semibold">No airline selected</div>
                        </Card>
                        )
                }
                <AddAircraftSheet
                    open={isAddAircraftOpen}
                    onOpenChange={setIsAddAircraftOpen}
                    onAddAircraft={handleAddAircraft}
                    isLoading={isLoading}
                    carrier={{
                        name: selectedCarrier?.name ?? "",
                        code: selectedCarrier?.code ?? "",
                    }}
                />
            </div>
    )
}
