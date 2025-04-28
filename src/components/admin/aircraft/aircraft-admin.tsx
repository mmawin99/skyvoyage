/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { Edit, Eye, Loader2, PlaneIcon, PlaneTakeoff, PlusCircle, Trash2 } from "lucide-react"
import { AircraftRegistration, Airline, Schedule, ScheduleListAdmin, SubmitSchedule } from "@/types/type"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { useEffect, useState } from "react"
import { DebouncedSearch } from "../../reusable/search"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"


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
    useEffect(() => {
        const fetchAircraft = async () => {
            setIsLoadingAircraft(true)
            if(!backendURL || backendURL == "") return
            if(!selectedCarrier) return
            if(selectedCarrier?.code == "") return
            try {
                const response = await fetch(`${backendURL}/autocomplete/aircraft/${selectedCarrier?.code}/${pageSize}/${page}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: selectedCarrier?.code
                    })
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
    }, [page, pageSize, selectedCarrier, backendURL]);


  return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Aircraft Management</h1>
                <Button onClick={() => {}} className="gap-1">
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
                        onSelect={setSelectedCarrier}
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
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {aircraft.length > 0 ? aircraft.map((aircraft, index) => (
                                        <div key={index} className="relative group hover:scale-105 hover:border-[1px] hover:border-gray-500 hover:rounded-lg">
                                            <div className={`
                                                flex flex-col items-center justify-center gap-2 p-4 border-[1px]
                                                border-gray-500 rounded-lg shadow-sm group-hover:shadow-lg
                                            `}>
                                                <PlaneIcon className="h-16 w-16 text-blue-600" />
                                                <div className="text-lg font-semibold">{aircraft.registration}</div>
                                                <div className="text-sm text-gray-500">{aircraft.model}</div>
                                            </div>
                                        <div className={`absolute top-0 left-0 z-10 w-full h-full bg-white bg-opacity-10 
                                        flex flex-row items-center gap-2 opacity-0
                                        justify-center group-hover:opacity-100 transition-opacity cursor-pointer 
                                        duration-300 rounded-lg shadow-lg`}>
                                            <div className="flex flex-col items-start">
                                                <div className="text-lg font-bold">{aircraft.registration}</div>
                                                <div className="text-base text-gray-400 font-medium">{aircraft.model}</div>
                                                <div className="text-sm text-gray-500 font-normal">{aircraft.totalFlight} Flights</div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Button className={`cursor-pointer`} variant={"default"}><Eye /> View Details</Button>
                                                <Button className={`cursor-pointer`} variant={"secondary"}><Edit /> Edit</Button>
                                                <Button className={`cursor-pointer`} variant={"destructive"}><Trash2 /> Delete</Button>
                                            </div>
                                        </div>
                                      </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center gap-6 py-6">
                                            <PlaneTakeoff className="h-24 w-24 text-blue-600" />
                                            <div className="text-xl font-semibold">No aircraft found</div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                    <div className="flex flex-col items-center justify-center gap-6 py-6">
                        <PlaneTakeoff className="h-24 w-24 text-blue-600" />
                        <div className="text-3xl font-semibold">Select an airline to view aircraft</div>
                    </div>
                    )
            }
        </div>
  )
}
