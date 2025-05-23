 
"use client"

import FlightScheduleTable from "@/components/admin/schedule/flight-schedule-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScheduleListAdmin, SubmitSchedule } from "@/types/type"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import AddScheduleSheet from "./add-schedule-sheet"
import { useDebounce } from "@uidotdev/usehooks"

interface ScheduleFetchResponse {
  message: string
  data: ScheduleListAdmin[]
  size: number
  page: number
  status: boolean
  totalCount: number
}

export default function ScheduleAdmin() {
    const { backend:backendURL }: BackendURLType = useBackendURL();
    const [flights, setFlights] = useState<ScheduleListAdmin[]>([])
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)


    //Pagination state
    const [page, setPage] = useState<number>(1)
    const [kind, setKind] = useState<"all" | "upcoming" | "inflight" | "completed">("all")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [pageSize, setPageSize] = useState<number>(20)
    const [totalCount, setTotalCount] = useState<number>(0)
    const debounceSearchQuery = useDebounce(searchQuery, 500)
    const [defaultValue, setDefaultValue] = useState<SubmitSchedule | null>(null)
    const [defaultDAirport, setDefaultDAirport] = useState<string>("")
    const [defaultAAirport, setDefaultAAirport] = useState<string>("")
    const [defaultFlightId, setDefaultFlightId] = useState<string>("")
    const [IneedUpdate, setIneedUpdate] = useState(false)
    useEffect(()=>{
        const fetchFlights = async () => {
        setIsLoading(true)
        setIneedUpdate(false)
        if(!backendURL || backendURL == "") return
        try {
            const response = await fetch(`${backendURL}/flight/schedule/${pageSize}/${kind}/${page}?query=${debounceSearchQuery}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            if (response.ok) {
            const data: ScheduleFetchResponse = await response.json()
            console.log(data)
            setFlights(data?.data)
            setTotalCount(data?.totalCount)
            // setPage(data?.page)
            } else {
            console.error("Error fetching flights:", await response.json())
            }
        } catch (error) {
            toast.error("Failed to fetch flights, Check console for more details.")
            console.error("Error fetching flights:", error)
        } finally {
            setIsLoading(false)
        }
        }

        fetchFlights()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounceSearchQuery, page, pageSize, kind, IneedUpdate])
    const handleAddFlight = async (newFlight: SubmitSchedule, onSuccess: ()=> void, onError: ()=> void) => {
        setIsLoading(true)
        // Simulate API call
        console.log("New flight added:", newFlight)
        const response = await fetch(`${backendURL}/flight/addSchedule`,{
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
            toast.success("Schedule added successfully")
        }else{
            console.error("Error adding Schedule:", await response.json())
            onError()
            toast.error("Failed to add schedule, Check console for more details.")
        }

        setIsLoading(false)
    }

    const handleEditSchedule = async (newFlight: SubmitSchedule) => {
        // setIsAddScheduleOpen(false)
        toast.promise(
            async () => {
                const response = await fetch(`${backendURL}/flight/editSchedule/${defaultFlightId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newFlight),
                })
                if (response.ok) {
                    const data = await response.json()
                    console.log(data)
                    toast.success("Schedule updated successfully")
                    setIsAddScheduleOpen(false)
                    setDefaultValue(null)
                    setDefaultDAirport("")
                    setDefaultAAirport("")
                    setDefaultFlightId("")
                    setPage(1)
                    setTimeout(() => {
                        setIneedUpdate(true)
                    }, 600)
                } else {
                    console.error("Error updating schedule:", await response.json())
                    toast.error("Failed to update schedule, Check console for more details.")
                }
            },
            {
                loading: "Updating schedule...",
                success: "Schedule updated successfully",
                error: "Failed to update schedule",
            }
        )
    }

    const promptEditSchedule = (index: number) => {
        const flight = flights[index]
        setDefaultValue({
            flightNum: flight.flightNum,
            departureDate: flight.departureTime,
            arrivalDate: flight.arrivalTime,
            airlineCode: flight.airlineCode,
            model: flight.aircraftModel,
            registration: flight.aircraftId,
            type: "single"
        })
        setDefaultDAirport(flight.departAirportId)
        setDefaultAAirport(flight.arriveAirportId)
        setDefaultFlightId(flight.flightId)
        setIsAddScheduleOpen(true)
    }
    const confirmDeleteSchedule = async (index: number) => {
        const flight = flights[index]
        setIsLoading(true)
        try {
            const response = await fetch(`${backendURL}/flight/deleteSchedule/${flight.flightId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            if (response.ok) {
                const data = await response.json()
                console.log(data)
                toast.success("Schedule deleted successfully")
                setPage(1)
                setTimeout(() => {
                    setIneedUpdate(true)
                }, 600)
            } else {
                console.error("Error deleting schedule:", await response.json())
                toast.error("Failed to delete schedule, Check console for more details.")
            }
        } catch (error) {
            toast.error("Failed to delete schedule, Check console for more details.")
            console.error("Error deleting schedule:", error)
        } finally {
            setIsLoading(false)
        }
    }
    const handleDeleteSchedule = async (index: number) => {
        toast.warning("Are you sure you want to delete this schedule?", {
            description: "This action cannot be undone.",
            action:{
                label: "Delete",
                onClick: ()=>{
                    confirmDeleteSchedule(index)
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
            <h1 className="text-3xl font-bold tracking-tight">Flight Schedule Management</h1>
            <Button onClick={() => setIsAddScheduleOpen(true)} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Schedule
            </Button>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => {
            setKind(value as "all" | "upcoming" | "inflight" | "completed")
            setPage(1)
        }}>
            <TabsList>
            <TabsTrigger value="all">All Flights</TabsTrigger>
            <TabsTrigger value="upcoming">Scheduled</TabsTrigger>
            <TabsTrigger value="inflight">In-Flight</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>
                    Flight Schedule
                    <span className="text-sm text-muted-foreground"> ({isLoading ? "..." : totalCount} scheduled)</span>
                </CardTitle>
                <CardDescription>
                    View and manage all flights schedules, Click on the flight to view more details
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
                <FlightScheduleTable handleDeleteSchedule={handleDeleteSchedule} handleEditSchedule={promptEditSchedule} searchQuery={searchQuery} setSearchQuery={setSearchQuery} flights={flights} isLoading={isLoading} />
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
            </TabsContent>
            <TabsContent value="upcoming" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>
                    Upcoming Flight Schedule
                    <span className="text-sm text-muted-foreground"> ({isLoading ? "..." : totalCount} upcoming flights)</span>
                </CardTitle>
                <CardDescription>
                    View and manage upcoming flights schedules, Click on the flight to view more details
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
                <FlightScheduleTable handleDeleteSchedule={handleDeleteSchedule} handleEditSchedule={promptEditSchedule} searchQuery={searchQuery} setSearchQuery={setSearchQuery} flights={flights} isLoading={isLoading} />
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
            </TabsContent>
            <TabsContent value="inflight" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>
                    In-Flight Schedule
                    <span className="text-sm text-muted-foreground"> ({isLoading ? "..." : totalCount} in-flight)</span>
                </CardTitle>
                <CardDescription>
                    View and manage in-flight schedules, Click on the flight to view more details
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
                <FlightScheduleTable handleDeleteSchedule={handleDeleteSchedule} handleEditSchedule={promptEditSchedule} searchQuery={searchQuery} setSearchQuery={setSearchQuery} flights={flights} isLoading={isLoading} />
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
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle>
                    Completed Flight Schedule
                    <span className="text-sm text-muted-foreground"> ({isLoading ? "..." : totalCount} schedule completed)</span>
                </CardTitle>
                <CardDescription>
                    View and manage completed schedules, Click on the flight to view more details
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
                <FlightScheduleTable handleDeleteSchedule={handleDeleteSchedule} handleEditSchedule={promptEditSchedule} searchQuery={searchQuery} setSearchQuery={setSearchQuery} flights={flights} isLoading={isLoading} />
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
            </TabsContent>
        </Tabs>

        <AddScheduleSheet
            open={isAddScheduleOpen}
            onOpenChange={()=>{
                setIsAddScheduleOpen(false)
                setDefaultValue(null)
                setDefaultDAirport("")
                setDefaultAAirport("")
                setDefaultFlightId("")
            }}
            handleEditSchedule={handleEditSchedule}
            onAddFlight={handleAddFlight}
            defaultValue={defaultValue}
            defaultArriveAirport={defaultAAirport}
            defaultDepartAirport={defaultDAirport}
            isLoading={isLoading}
        />
        </div>
    )
}
