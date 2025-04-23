/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import AircraftTable from "@/components/aircraft/aircraft-table"
// import AddAircraftSheet from "./add-aircraft-sheet"
import { type BackendURLType, useBackendURL } from "@/components/backend-url-provider"
import { CustomPagination } from "@/components/custom-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Aircraft {
  aircraftId: string
  ownerAirlineCode: string
  model: string
  seatMapId: string
  airline: {
    code: string
    name: string
  }
  seatmap: {
    id: string
    name: string
  }
  flightOperate: number
  status: string
  registrationDate: string
}

interface AircraftFetchResponse {
  message: string
  data: Aircraft[]
  size: number
  page: number
  status: boolean
  totalCount: number
}

export default function AircraftAdmin() {
  const { backend: backendURL }: BackendURLType = useBackendURL()
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [isAddAircraftOpen, setIsAddAircraftOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Pagination state
  const [page, setPage] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [pageSize, setPageSize] = useState<number>(20)
  const [totalCount, setTotalCount] = useState<number>(0)

  useEffect(() => {
    const fetchAircraft = async () => {
      setIsLoading(true)
      if (!backendURL || backendURL == "") return
      try {
        const response = await fetch(`${backendURL}/aircraft/${pageSize}/${page}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
          }),
        })
        if (response.ok) {
          const data: AircraftFetchResponse = await response.json()
          console.log(data)
          setAircraft(data?.data)
          setTotalCount(data?.totalCount)
          setPage(data?.page)
        } else {
          console.error("Error fetching aircraft:", await response.json())
        }
      } catch (error) {
        console.error("Error fetching aircraft:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAircraft()
  }, [searchQuery, page, pageSize, backendURL])

  const handleAddAircraft = async (newAircraft: any, onSuccess: () => void, onError: () => void) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${backendURL}/aircraft/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAircraft),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(data)
        onSuccess()
      } else {
        console.error("Error adding aircraft:", await response.json())
        onError()
      }
    } catch (error) {
      console.error("Error adding aircraft:", error)
      onError()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Aircraft Management</h1>
        <Button onClick={() => setIsAddAircraftOpen(true)} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Aircraft
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Aircraft</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Aircraft Fleet</CardTitle>
              <CardDescription>
                View and manage all aircraft in the fleet. Click on an aircraft to edit details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row justify-between mb-4">
                <CustomPagination
                  className="w-full flex flex-row justify-start"
                  currentPage={Number.parseInt(String(page))}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  siblingCount={1}
                />
                <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Items per page" />
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
              <AircraftTable
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                aircraft={aircraft}
                isLoading={isLoading}
              />
              <div className="flex flex-row justify-between mt-4">
                <CustomPagination
                  className="w-full flex flex-row justify-start"
                  currentPage={Number.parseInt(String(page))}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  siblingCount={1}
                />
                <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Items per page" />
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
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Aircraft</CardTitle>
              <CardDescription>View and manage active aircraft in the fleet.</CardDescription>
            </CardHeader>
            <CardContent>
              <AircraftTable
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                aircraft={aircraft.filter((aircraft) => aircraft.status === "active")}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="maintenance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Aircraft in Maintenance</CardTitle>
              <CardDescription>View aircraft currently in maintenance.</CardDescription>
            </CardHeader>
            <CardContent>
              <AircraftTable
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                aircraft={aircraft.filter((aircraft) => aircraft.status === "maintenance")}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inactive" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Aircraft</CardTitle>
              <CardDescription>View history of inactive aircraft.</CardDescription>
            </CardHeader>
            <CardContent>
              <AircraftTable
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                aircraft={aircraft.filter((aircraft) => aircraft.status === "inactive")}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      
    </div>
  )
}
