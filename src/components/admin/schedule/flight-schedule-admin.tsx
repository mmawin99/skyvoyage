/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import FlightScheduleTable from "@/components/admin/schedule/flight-schedule-table"
import AddScheduleSheet from "./add-schedule-sheet"
import { Schedule, ScheduleListAdmin, SubmitSchedule } from "@/types/type"
import { BackendURLType, useBackendURL } from "../../backend-url-provider"
import { CustomPagination } from "../../custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

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
  useEffect(()=>{
    const fetchFlights = async () => {
      setIsLoading(true)
      if(!backendURL || backendURL == "") return
      try {
        const response = await fetch(`${backendURL}/flight/schedule/${pageSize}/${kind}/${page}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery
          })
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
        console.error("Error fetching flights:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlights()

  }, [searchQuery, page, pageSize, backendURL, kind])
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
    }else{
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
        <h1 className="text-3xl font-bold tracking-tight">Flight Schedule Management</h1>
        <Button onClick={() => setIsAddScheduleOpen(true)} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setKind(value as "all" | "upcoming" | "inflight" | "completed")}>
        <TabsList>
          <TabsTrigger value="all">All Flights</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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
              <FlightScheduleTable searchQuery={searchQuery} setSearchQuery={setSearchQuery} flights={flights} isLoading={isLoading} />
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
              <FlightScheduleTable searchQuery={searchQuery} setSearchQuery={setSearchQuery} flights={flights} isLoading={isLoading} />
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
              <FlightScheduleTable searchQuery={searchQuery} setSearchQuery={setSearchQuery} flights={flights} isLoading={isLoading} />
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
              <FlightScheduleTable searchQuery={searchQuery} setSearchQuery={setSearchQuery} flights={flights} isLoading={isLoading} />
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
        onOpenChange={setIsAddScheduleOpen}
        onAddFlight={handleAddFlight}
        isLoading={isLoading}
      />
    </div>
  )
}
