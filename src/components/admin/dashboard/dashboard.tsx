/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DashboardData, TimeRangeType } from "@/types/dashboard"
import React, { useCallback, useEffect, useState } from "react"
import { format, subDays, subWeeks, subMonths, subYears, set } from "date-fns"
import { CalendarIcon, FilterIcon, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import MetricsCard from "./metrics"

const refreshInterval = 60

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<TimeRangeType>("30d")
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: subDays(new Date(), 30),
        to: new Date(),
    })
    const [timeInterval, setTimeInterval] = useState<string>("day")
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [nextRefresh, setNextRefresh] = useState(refreshInterval) // seconds until next refresh
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isFirstRan, setIsFirstRan] = useState<boolean>(false)
    const [isFiltering, setIsFiltering] = useState<boolean>(false)
    // Calculate date range based on time range type
    const calculateDateRange = useCallback((type: TimeRangeType): { from: Date; to: Date } => {
        const now = new Date()
        switch (type) {
          case "30d":
            return { from: subDays(now, 30), to: now }
          case "2w":
            return { from: subWeeks(now, 2), to: now }
          case "3m":
            return { from: subMonths(now, 3), to: now }
          case "6m":
            return { from: subMonths(now, 6), to: now }
          case "1y":
            return { from: subYears(now, 1), to: now }
          case "2y":
            return { from: subYears(now, 2), to: now }
          case "custom":
          default:
            return dateRange
        }
    }, [dateRange])
  
    // Function to fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        if(isCalendarOpen) return // Prevent updating data on selecting date
        setIsRefreshing(true)
        setLoading(true)
        try {
            const range = timeRange === "custom" ? dateRange : calculateDateRange(timeRange)
            const fromDate = format(range.from, "yyyy-MM-dd")
            const toDate = format(range.to, "yyyy-MM-dd")
    
            // Try to fetch from API
            try {
            const response = await fetch(`/api/admin/overview?range=${fromDate},${toDate}&interval=${timeInterval}`)
            const result = await response.json()
    
            if (result.success) {
                setData(result.data)
                setIsRefreshing(false)
                setLoading(false)
                return
            }
            } catch (apiError) {
                setLoading(false)
                console.error(apiError)
                console.log("API not available, using mock data")
            }
    
            // If API fails, use mock data
            const mockData = {
            recentFlights: [
                {
                airlineCode: "ET",
                flightNum: "608-1",
                generatedRevenue: 0,
                departAirportCode: "ADD",
                arriveAirportCode: "BKK",
                departureTime: "2025-05-04T20:55:00.000Z",
                arrivalTime: "2025-05-05T05:30:00.000Z",
                status: "In-flight",
                nearDiff: "727",
                },
                {
                airlineCode: "CX",
                flightNum: "615",
                generatedRevenue: 0,
                departAirportCode: "HKG",
                arriveAirportCode: "BKK",
                departureTime: "2025-05-05T01:55:00.000Z",
                arrivalTime: "2025-05-05T05:05:00.000Z",
                status: "Completed",
                nearDiff: "773",
                },
                {
                airlineCode: "SQ",
                flightNum: "705",
                generatedRevenue: 0,
                departAirportCode: "BKK",
                arriveAirportCode: "SIN",
                departureTime: "2025-05-05T02:35:00.000Z",
                arrivalTime: "2025-05-05T05:05:00.000Z",
                status: "Completed",
                nearDiff: "773",
                },
                {
                airlineCode: "EK",
                flightNum: "384-1",
                generatedRevenue: 0,
                departAirportCode: "DXB",
                arriveAirportCode: "BKK",
                departureTime: "2025-05-04T23:05:00.000Z",
                arrivalTime: "2025-05-05T05:05:00.000Z",
                status: "Completed",
                nearDiff: "773",
                },
                {
                airlineCode: "TG",
                flightNum: "920",
                generatedRevenue: 0,
                departAirportCode: "BKK",
                arriveAirportCode: "FRA",
                departureTime: "2025-05-04T16:40:00.000Z",
                arrivalTime: "2025-05-05T04:55:00.000Z",
                status: "Completed",
                nearDiff: "1373",
                },
            ],
            bookingsOverTime: [
                {
                timeInterval: "2025-05-04",
                totalBookings: "3",
                },
                {
                timeInterval: "2025-05-05",
                totalBookings: "5",
                },
                {
                timeInterval: "2025-05-06",
                totalBookings: "7",
                },
            ],
            totalRevenue: [
                {
                timeInterval: "2025-05-04",
                totalRevenue: 264546.67,
                percentChange: 0,
                },
                {
                timeInterval: "2025-05-05",
                totalRevenue: 285000.5,
                percentChange: 7.73,
                },
                {
                timeInterval: "2025-05-06",
                totalRevenue: 312750.25,
                percentChange: 9.74,
                },
            ],
            revenueByRoute: [
                {
                timeInterval: "2025-05-04",
                origin: "BKK",
                destination: "CNX",
                revenue: 659,
                },
                {
                timeInterval: "2025-05-04",
                origin: "BKK",
                destination: "DXB",
                revenue: 1500,
                },
                {
                timeInterval: "2025-05-04",
                origin: "CNX",
                destination: "BKK",
                revenue: 891,
                },
                {
                timeInterval: "2025-05-04",
                origin: "CNX",
                destination: "DMK",
                revenue: 472,
                },
                {
                timeInterval: "2025-05-04",
                origin: "DMK",
                destination: "CNX",
                revenue: 305,
                },
                {
                timeInterval: "2025-05-04",
                origin: "DXB",
                destination: "BKK",
                revenue: 1500,
                },
            ],
            bookingStatus: [
                {
                status: "PAID",
                count: "3",
                },
                {
                status: "PENDING",
                count: "1",
                },
                {
                status: "CANCELLED",
                count: "1",
                },
            ],
            seatUtilization: [
                {
                flightId: "458675d5-12a7-423e-9b91-adbb583e65f1",
                flightNum: "102",
                airlineCode: "TG",
                departureTime: "2025-05-13T00:25:00.000Z",
                arrivalTime: "2025-05-13T01:45:00.000Z",
                total_seats: "168",
                seats_sold: "1",
                seat_utilization_percentage: "0.5952",
                },
                {
                flightId: "bce710c8-fa0f-46a7-b7b2-979a874629ed",
                flightNum: "103",
                airlineCode: "TG",
                departureTime: "2025-05-24T02:25:00.000Z",
                arrivalTime: "2025-05-24T03:50:00.000Z",
                total_seats: "174",
                seats_sold: "1",
                seat_utilization_percentage: "0.5747",
                },
                {
                flightId: "b5a7c560-1df4-45c2-8220-83705b1191c5",
                flightNum: "123",
                airlineCode: "DD",
                departureTime: "2025-05-05T00:00:00.000Z",
                arrivalTime: "2025-05-05T01:05:00.000Z",
                total_seats: "189",
                seats_sold: "1",
                seat_utilization_percentage: "0.5291",
                },
                {
                flightId: "6cbb1752-f226-4d76-8b31-faa800bcfacb",
                flightNum: "122",
                airlineCode: "DD",
                departureTime: "2025-05-06T22:15:00.000Z",
                arrivalTime: "2025-05-06T23:30:00.000Z",
                total_seats: "189",
                seats_sold: "1",
                seat_utilization_percentage: "0.5291",
                },
                {
                flightId: "110d55c7-bd34-47ad-94e7-3d9d7e6014bc",
                flightNum: "370",
                airlineCode: "EK",
                departureTime: "2025-05-18T04:55:00.000Z",
                arrivalTime: "2025-05-18T11:05:00.000Z",
                total_seats: "312",
                seats_sold: "1",
                seat_utilization_percentage: "0.3205",
                },
            ],
            revenuePassengerKilometers: [
                {
                flightId: "110d55c7-bd34-47ad-94e7-3d9d7e6014bc",
                flightNum: "370",
                airlineCode: "EK",
                departureTime: "2025-05-18T04:55:00.000Z",
                arrivalTime: "2025-05-18T11:05:00.000Z",
                distance_km: 4903.712108428036,
                seats_sold: "1",
                RPK: 4903.712108428036,
                },
                {
                flightId: "12277a95-f031-460d-8935-8f6788f54031",
                flightNum: "371",
                airlineCode: "EK",
                departureTime: "2025-06-15T20:10:00.000Z",
                arrivalTime: "2025-06-16T03:00:00.000Z",
                distance_km: 4903.712108428036,
                seats_sold: "1",
                RPK: 4903.712108428036,
                },
                {
                flightId: "458675d5-12a7-423e-9b91-adbb583e65f1",
                flightNum: "102",
                airlineCode: "TG",
                departureTime: "2025-05-13T00:25:00.000Z",
                arrivalTime: "2025-05-13T01:45:00.000Z",
                distance_km: 596.7081267163222,
                seats_sold: "1",
                RPK: 596.7081267163222,
                },
            ],
            topRoutes: [
                {
                origin: "BKK",
                destination: "CNX",
                bookingCount: "1",
                },
                {
                origin: "BKK",
                destination: "DXB",
                bookingCount: "1",
                },
                {
                origin: "CNX",
                destination: "BKK",
                bookingCount: "1",
                },
                {
                origin: "CNX",
                destination: "DMK",
                bookingCount: "1",
                },
                {
                origin: "DMK",
                destination: "CNX",
                bookingCount: "1",
                },
                {
                origin: "DXB",
                destination: "BKK",
                bookingCount: "1",
                },
            ],
            avgTicketPrice: [
                {
                origin: "CNX",
                destination: "DMK",
                averagePrice: 472,
                },
                {
                origin: "DXB",
                destination: "BKK",
                averagePrice: 1500,
                },
                {
                origin: "BKK",
                destination: "DXB",
                averagePrice: 1500,
                },
                {
                origin: "DMK",
                destination: "CNX",
                averagePrice: 305,
                },
                {
                origin: "CNX",
                destination: "BKK",
                averagePrice: 891,
                },
                {
                origin: "BKK",
                destination: "CNX",
                averagePrice: 659,
                },
            ],
            passengerDemographics: [
                {
                ageRange: "Adult",
                nationality: "TH",
                count: "1",
                },
            ],
            }
    
            setData(mockData)
        } catch (error) {
                console.error("Error in dashboard:", error)
        } finally {
                setLoading(false)
                setIsRefreshing(false)
                setNextRefresh(refreshInterval) // Reset the countdown
        }
    }, [timeRange, dateRange, timeInterval, calculateDateRange, isCalendarOpen])
  
    // Handle time range change
    const handleTimeRangeChange = (newRange: TimeRangeType) => {
      setTimeRange(newRange)
      if (newRange !== "custom") {
        setDateRange(calculateDateRange(newRange))
      }
    }
  
    // Format date for display
    const formatDateRange = () => {
      if (timeRange !== "custom") {
        return timeRange.toUpperCase()
      }
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
    }
  
    // Auto refresh countdown
    useEffect(() => {
      const timer = setInterval(() => {
        setNextRefresh((prev) => {
          if (prev <= 1) {
            fetchDashboardData()
            return refreshInterval
          }
          return prev - 1
        })
      }, 1000)
  
      return () => clearInterval(timer)
    }, [fetchDashboardData])
  
    // Fetch data on initial load and when parameters change
    useEffect(() => {
        fetchDashboardData()
        setIsFirstRan(true)
    }, [])

    useEffect(()=>{
        if(isFirstRan){
            fetchDashboardData()
            setIsFiltering(false)
        }
    }, [dateRange, timeRange, timeInterval, isFiltering])
  
    // Colors for charts
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]
  
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive overview of flight operations and revenue metrics
            </p>
            <p className="text-muted-foreground">
                {isRefreshing ? (
                    <span className="inline-flex items-center">
                    <RefreshCcw className="h-3 w-3 animate-spin mr-1" />
                    Refreshing...
                    </span>
                ) : (
                    <span className="text-sm">Next refresh in {nextRefresh}s</span>
                )}
            </p>
          </div>
  
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="flex space-x-1">
              <Button
                variant={timeRange === "2w" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeRangeChange("2w")}
              >
                2W
              </Button>
              <Button
                variant={timeRange === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeRangeChange("30d")}
              >
                30D
              </Button>
              <Button
                variant={timeRange === "3m" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeRangeChange("3m")}
              >
                3M
              </Button>
              <Button
                variant={timeRange === "6m" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeRangeChange("6m")}
              >
                6M
              </Button>
              <Button
                variant={timeRange === "1y" ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeRangeChange("1y")}
              >
                1Y
              </Button>
            </div>
  
            <Popover open={isCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button
                    variant={timeRange === "custom" ? "default" : "outline"}
                    className="w-full justify-start text-left font-normal sm:w-[250px]"
                    onClick={() => {
                        setTimeRange("custom")
                        setIsCalendarOpen(true)
                    }}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                    <div className="flex flex-col space-y-4">
                    {/* Header for the calendars */}
                    <div className="flex justify-between items-center">
                        <div className="text-base font-bold">From Date</div>
                        <div className="text-base font-bold">To Date</div>
                    </div>
                    
                    {/* Calendar containers */}
                    <div className="flex space-x-4">
                        {/* From Date Calendar */}
                        <div className="border rounded-md shadow-sm">
                        <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => {
                            if (!date) return;
                            
                            // If selected date is after current "to" date, adjust "to" date
                            if (dateRange.to && date > dateRange.to) {
                                setDateRange({ from: date, to: date });
                            } else {
                                setDateRange({ from: date, to: dateRange.to });
                            }
                            }}
                            numberOfMonths={1}
                            defaultMonth={dateRange.from}
                        />
                        </div>
                        
                        {/* To Date Calendar */}
                        <div className="border rounded-md shadow-sm">
                        <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => {
                            if (!date) return;
                            
                            // If selected date is before current "from" date, adjust "from" date
                            if (dateRange.from && date < dateRange.from) {
                                setDateRange({ from: date, to: date });
                            } else {
                                setDateRange({ from: dateRange.from, to: date });
                            }
                            }}
                            numberOfMonths={1}
                            defaultMonth={dateRange.to}
                        />
                        </div>
                    </div>
                    
                    {/* Current selection display */}
                    <div className="pt-4 border-t flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                        {dateRange.from ? (
                            <span>
                            {dateRange.from.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
                            </span>
                        ) : (
                            <span>Pick a date range</span>
                        )}
                        </div>
                        
                        {/* Optional: Add buttons for common ranges */}
                        <div className="flex space-x-2">
                            <Button
                                variant="default"
                                onClick={()=>{
                                    setIsCalendarOpen(false)
                                    setIsFiltering(true)
                                    setTimeRange("custom")
                                }}
                            >
                                <FilterIcon className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                    </div>
                </PopoverContent>
            </Popover>
  
            <Select value={timeInterval} onValueChange={setTimeInterval}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Hourly</SelectItem>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
  
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricsCard
                title="Total Revenue"
                desc={((data?.totalRevenue[0]?.percentChange ?? 0) > 0 ? "+" : "") + data?.totalRevenue[0]?.percentChange + "% from previous period"}
                value={`฿ ${data?.totalRevenue[0]?.totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 2 }) || "0"}`}
                loading={loading}
            />
            <MetricsCard
                title="Total Bookings"
                desc={"For the selected period"}
                value={`${data?.bookingsOverTime.reduce((sum, item) => sum + Number.parseInt(item.totalBookings), 0) || 0}`}
                loading={loading}
            />
            <MetricsCard
                title="Recent Active Flights"
                desc={"Currently in-flight"}
                value={`${data?.recentFlights.filter((flight) => flight.status === "In-flight").length || 0}`}
                loading={loading}
            />
            <MetricsCard
                title="Seat Utilization"
                desc={"Average across all flights"}
                value={`${data?.seatUtilization.length ? (((data.seatUtilization.reduce(
                              (sum, item) => sum + Number.parseFloat(item.seat_utilization_percentage),
                              0) / data.seatUtilization.length) * 100).toFixed(2)) : "0"} %`}
                loading={loading}
            />
        </div>
        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Over Time */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                    <CardDescription>Total revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    {loading ? (
                    <div className="flex items-center justify-center h-64"> {/* fallback height for loading */}
                        <Skeleton className="h-full w-full rounded-md" />
                    </div>
                    ) : (
                    <div className="w-full h-[300px]"> {/* Set fixed or responsive height here */}
                        <ChartContainer
                        config={{
                            revenue: {
                            label: "Revenue",
                            color: "hsl(var(--chart-1))",
                            },
                        }}
                        >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                            data={data?.totalRevenue.map((item) => ({
                                date: item.timeInterval,
                                revenue: item.totalRevenue,
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => {
                                try {
                                    return format(new Date(value), "MMM d")
                                } catch (e) {
                                    return value
                                }
                                }}
                            />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                            />
                            </LineChart>
                        </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                    )}
                </CardContent>
            </Card>
  
          {/* Bookings Over Time */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Bookings Over Time</CardTitle>
              <CardDescription>Number of bookings for the selected period</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
              ) : (
                <ChartContainer
                  config={{
                    bookings: {
                      label: "Bookings",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data?.bookingsOverTime.map((item) => ({
                        date: item.timeInterval,
                        bookings: Number.parseInt(item.totalBookings),
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          try {
                            return format(new Date(value), "MMM d")
                          } catch (e) {
                            return value
                          }
                        }}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="bookings" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>


        {/* Recent Flights Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Flights</CardTitle>
            <CardDescription>Latest flight operations and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flight</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-5 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-28" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-28" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-20" />
                            </TableCell>
                          </TableRow>
                        ))
                    : data?.recentFlights.sort((a,b)=>{
                        return b.status.localeCompare(a.status)
                    }).map((flight, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {flight.airlineCode} {flight.flightNum.split("-")[0]}
                            {
                                flight.flightNum.includes("-") && 
                                <Badge variant="outline" className="ml-2">
                                  Segment {flight.flightNum.split("-")[1]}
                                </Badge>
                            }
                          </TableCell>
                          <TableCell>
                            {flight.departAirportCode} → {flight.arriveAirportCode}
                          </TableCell>
                          <TableCell>{format(new Date(flight.departureTime), "MMM d, HH:mm")}</TableCell>
                          <TableCell>{format(new Date(flight.arrivalTime), "MMM d, HH:mm")}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                flight.status === "Completed"
                                  ? "outline"
                                  : flight.status === "In-flight"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {flight.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>


        {/* Second Row of Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Routes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Routes</CardTitle>
              <CardDescription>Most popular routes by booking count</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: {
                      label: "Bookings",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={data?.topRoutes.map((route) => ({
                        route: `${route.origin} → ${route.destination}`,
                        count: Number.parseInt(route.bookingCount),
                      }))}
                      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="route" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
  
          {/* Booking Status */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
              <CardDescription>Distribution of booking statuses</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.bookingStatus.map((status) => ({
                        name: status.status,
                        value: Number.parseInt(status.count),
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data?.bookingStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} bookings`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

  
        {/* Additional Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Average Ticket Price */}
          <Card>
            <CardHeader>
              <CardTitle>Average Ticket Price</CardTitle>
              <CardDescription>By route</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead className="text-right">Avg. Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading
                      ? Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Skeleton className="h-5 w-32" />
                              </TableCell>
                              <TableCell className="text-right">
                                <Skeleton className="h-5 w-16 ml-auto" />
                              </TableCell>
                            </TableRow>
                          ))
                      : data?.avgTicketPrice.map((price, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {price.origin} → {price.destination}
                            </TableCell>
                            <TableCell className="text-right">${price.averagePrice.toLocaleString("en-US")}</TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
  
          {/* Seat Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Seat Utilization</CardTitle>
              <CardDescription>Top flights by seat utilization percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flight</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading
                      ? Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Skeleton className="h-5 w-20" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-28" />
                              </TableCell>
                              <TableCell className="text-right">
                                <Skeleton className="h-5 w-12 ml-auto" />
                              </TableCell>
                            </TableRow>
                          ))
                      : data?.seatUtilization
                          .sort(
                            (a, b) =>
                              Number.parseFloat(b.seat_utilization_percentage) -
                              Number.parseFloat(a.seat_utilization_percentage),
                          )
                          .slice(0, 5)
                          .map((seat, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {seat.airlineCode} {seat.flightNum}
                              </TableCell>
                              <TableCell>{format(new Date(seat.departureTime), "MMM d, yyyy")}</TableCell>
                              <TableCell className="text-right">
                                {(Number.parseFloat(seat.seat_utilization_percentage) * 100).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
}
  