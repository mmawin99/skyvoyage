/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import FlightScheduleTable from "@/components/schedule/flight-schedule-table"
import AddScheduleSheet from "./add-schedule-sheet"
import { Schedule, SubmitSchedule } from "@/types/type"
import { BackendURLType, useBackendURL } from "../backend-url-provider"


export default function FlightScheduleAdmin() {
  const { backend:backendURL }: BackendURLType = useBackendURL();
  const [flights, setFlights] = useState<Schedule[]>([])
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  //Pagination state
  const [page, setPage] = useState<number>(1)
  const handleAddFlight = async (newFlight: SubmitSchedule,onSuccess: ()=> void, onError: ()=> void) => {
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Flight Schedule Management</h1>
        <Button onClick={() => setIsAddScheduleOpen(true)} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Flights</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Flight Schedules</CardTitle>
              <CardDescription>
                View and manage all flight schedules. Click on a flight to edit details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlightScheduleTable flights={flights} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Flights</CardTitle>
              <CardDescription>View and manage upcoming flight schedules.</CardDescription>
            </CardHeader>
            <CardContent>
              <FlightScheduleTable
                flights={flights.filter((flight) => new Date(flight.departureTime) > new Date())}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Flights</CardTitle>
              <CardDescription>View history of completed flight schedules.</CardDescription>
            </CardHeader>
            <CardContent>
              <FlightScheduleTable
                flights={flights.filter((flight) => new Date(flight.arrivalTime) < new Date())}
                isLoading={isLoading}
              />
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
