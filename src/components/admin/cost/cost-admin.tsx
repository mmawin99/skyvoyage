"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AircraftCost, Airline, SubmitAircraftCost } from "@/types/type"
import { BanknoteIcon, Loader2, PlaneTakeoff, PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { DebouncedSearch } from "../../reusable/search"
import EditAircraftCostSheet from "./edit-aircraft-cost-sheet"
import AircraftCostTable from "./aircraft-cost-table"

export default function AircraftCostAdmin() {
    const { backend: backendURL }: BackendURLType = useBackendURL();
    const [selectedCarrier, setSelectedCarrier] = useState<Airline>()
    const [carriers, setCarriers] = useState<Airline[]>([])
    const [loadingCarrier, setLoadingCarrier] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(20)
    const [totalCount, setTotalCount] = useState<number>(0)
    const [isLoadingCosts, setIsLoadingCosts] = useState<boolean>(false)
    const [costs, setCosts] = useState<AircraftCost[]>([])

    const [isEditCostOpen, setIsEditCostOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [costDataChanged, setCostDataChanged] = useState<boolean>(false)
    const [selectedCost, setSelectedCost] = useState<SubmitAircraftCost | null>(null)
    // /flight/addAircraftCost
    // /flight/editAircraftCost
    // /flight/deleteAircraftCost/:model/:airlineCode
    // /flight/aircraftcost/:airlineCode/:pageSize/:page
    useEffect(() => {
        const fetchAircraftCosts = async () => {
            setIsLoadingCosts(true)
            if(!backendURL || backendURL === "") return
            if(!selectedCarrier) return
            if(selectedCarrier?.code === "") return
            
            try {
                const response = await fetch(`${backendURL}/flight/aircraftcost/${selectedCarrier?.code}/${pageSize}/${page}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                
                if (response.ok) {
                    const data: {
                        data: AircraftCost[], 
                        status: boolean, 
                        totalCount: number,
                        page: number,
                        pageSize: number
                    } = await response.json()
                    
                    setCosts(data?.data)
                    setTotalCount(data?.totalCount)
                } else {
                    console.error("Error fetching aircraft costs:", await response.json())
                }
            } catch (error) {
                console.error("Error fetching aircraft costs:", error)
            } finally {
                setIsLoadingCosts(false)
            }
        }
        
        fetchAircraftCosts()
    }, [page, pageSize, selectedCarrier, backendURL, costDataChanged]);

    const handleAddAircraftCost = async (newCost: SubmitAircraftCost, onSuccess: () => void, onError: () => void) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${backendURL}/flight/addAircraftCost`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCost),
            })
            
            if(response.ok) {
                const data = await response.json()
                console.log(data)
                onSuccess()
                toast.success("Aircraft cost added successfully")
                setCostDataChanged(!costDataChanged)
            } else {
                toast.error("Failed to add aircraft cost. Check console for more details.")
                console.error("Error adding aircraft cost:", await response.json())
                onError()
            }
        } catch (error) {
            console.error("Error in request:", error)
            onError()
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditAircraftCost = async (updatedCost: SubmitAircraftCost, onSuccess: () => void, onError: () => void) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${backendURL}/flight/editAircraftCost`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedCost),
            })
            
            if(response.ok) {
                const data = await response.json()
                console.log(data)
                onSuccess()
                toast.success("Aircraft cost updated successfully")
                setCostDataChanged(!costDataChanged)
            } else {
                toast.error("Failed to update aircraft cost. Check console for more details.")
                console.error("Error updating aircraft cost:", await response.json())
                onError()
            }
        } catch (error) {
            console.error("Error in request:", error)
            onError()
        } finally {
            setIsLoading(false)
        }
    }

    const confirmDeleteAircraftCost = async (index: number) => {
        toast.promise(
            async () => {
                setIsLoading(true)
                const costToDelete = costs[index]
                
                try {
                    const response = await fetch(`${backendURL}/flight/deleteAircraftCost/${costToDelete.model}/${costToDelete.ownerAirlineCode}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        }
                    })
                    
                    if (response.ok) {
                        const data = await response.json()
                        console.log(data)
                        setCostDataChanged(!costDataChanged)
                        return "Aircraft cost deleted successfully"
                    } else {
                        const error = await response.json()
                        console.error("Error deleting aircraft cost:", error)
                        throw new Error(error.message || "Failed to delete aircraft cost")
                    }
                } catch (error) {
                    console.error("Error in request:", error)
                    throw error
                } finally {
                    setIsLoading(false)
                }
            },
            {
                loading: "Deleting aircraft cost...",
                success: "Aircraft cost deleted successfully",
                error: (err) => `Failed to delete aircraft cost: ${err.message}`,
            }
        )
    }

    const handleDeleteAircraftCost = async (index: number) => {
        toast.warning("Are you sure you want to delete this aircraft cost?", {
            description: "This action cannot be undone",
            action: {
                label: "Delete",
                onClick: async () => {
                    confirmDeleteAircraftCost(index)
                }
            }
        })
    }

    const handleEditCostClick = (index: number) => {
        setSelectedCost({
            model: costs[index].model,
            ownerAirlineCode: costs[index].ownerAirlineCode,
            costPerMile: costs[index].costPerMile
        })
        setIsEditCostOpen(true)
    }

    const handleAddNewCost = () => {
        setSelectedCost(null)
        setIsEditCostOpen(true)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Aircraft Cost Management</h1>
                <Button onClick={handleAddNewCost} className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Add Aircraft Cost
                </Button>
            </div>
            <div className="flex flex-row gap-2">
                <div className="w-75">
                    <DebouncedSearch<Airline>
                        title="Search for airline"
                        Icon={BanknoteIcon}
                        selected={selectedCarrier ?? null}
                        onSelect={(sel) => {
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
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <CustomPagination 
                        className="w-full flex flex-row justify-start" 
                        currentPage={parseInt(String(page))} 
                        totalCount={totalCount} 
                        pageSize={pageSize} 
                        onPageChange={setPage}
                        siblingCount={1}
                    />
                </div>
            </div>
            {
                selectedCarrier && (isLoadingCosts || loadingCarrier) ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                ) : selectedCarrier ? (
                    <Card className="col-span-2 md:col-span-3 lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold">
                                {selectedCarrier?.name} ({selectedCarrier?.code}) - {totalCount} Aircraft Costs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col">
                                {costs.length > 0 ? (
                                    <AircraftCostTable 
                                        costs={costs} 
                                        isLoading={isLoadingCosts} 
                                        handleEditAircraftCost={handleEditCostClick}
                                        handleDeleteAircraftCost={handleDeleteAircraftCost}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-6 py-6 w-full">
                                        <BanknoteIcon className="h-24 w-24 text-blue-600" />
                                        <div className="text-xl font-semibold">No aircraft costs found</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="flex flex-col items-center justify-center gap-6 py-20 w-full">
                        <PlaneTakeoff className="h-24 w-24 text-blue-600" />
                        <div className="text-xl font-semibold">No airline selected</div>
                    </Card>
                )
            }
            <EditAircraftCostSheet
                open={isEditCostOpen}
                onOpenChange={setIsEditCostOpen}
                onAddAircraftCost={handleAddAircraftCost}
                onEditAircraftCost={handleEditAircraftCost}
                isLoading={isLoading}
                carrier={{
                    name: selectedCarrier?.name ?? "",
                    code: selectedCarrier?.code ?? "",
                }}
                defaultValue={selectedCost}
            />
        </div>
    )
}