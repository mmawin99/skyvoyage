export interface DashboardData {
    recentFlights: RecentFlight[]
    bookingsOverTime: BookingOverTime[]
    totalRevenue: TotalRevenue[]
    previousPeriodTotalRevenue: TotalRevenue[]
    revenueByRoute: RevenueByRoute[]
    bookingStatus: BookingStats[]
    seatUtilization: SeatUtilization[]
    topRoutes: TopRoute[]
    avgTicketPrice: AvgTicketPrice[]
    passengerDemographics: PassengerDemographic[]
}
  
export interface RecentFlight {
    airlineCode: string
    flightNum: string
    generatedRevenue: number
    departAirportCode: string
    arriveAirportCode: string
    departureTime: string
    arrivalTime: string
    status: string
    nearDiff: string
}
  
export interface BookingOverTime {
    timeInterval: string
    totalBookings: string
}
  
export interface TotalRevenue {
    timeInterval: string
    totalRevenue: number
    percentChange: number
}
  
export interface RevenueByRoute {
    timeInterval: string
    origin: string
    destination: string
    revenue: number
}
  
export interface BookingStats {
    status: string
    count: string
}
  
export interface SeatUtilization {
    flightId: string
    flightNum: string
    airlineCode: string
    departureTime: string
    arrivalTime: string
    total_seats: string
    seats_sold: string
    seat_utilization_percentage: string
}
  
export interface TopRoute {
    origin: string
    destination: string
    bookingCount: string
}
  
export interface AvgTicketPrice {
    origin: string
    destination: string
    averagePrice: number
}
  
export interface PassengerDemographic {
    ageRange: string
    nationality: string
    count: string
}

export type TimeRangeType = "1d" | "30d" | "1w" | "3m" | "6m" | "1y" | "2y" | "custom"