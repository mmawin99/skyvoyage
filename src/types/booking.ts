export interface BookingRow {
    bookingId: string;
    bookingDate: Date;
    status: string;
    userId: string;
    paymentId: string | null;
    totalAmount: number | null;
    paymentMethod: string | null;
    paymentDate: Date | null;
}
  
export interface FlightOperationRow {
    flightId: string;
    flightNum: string;
    airlineCode: string;
    departureTime: Date;
    arrivalTime: Date;
    departureGate: string;
    aircraftId: string;
    aircraftModel: string;
    departAirportId: string;
    arriveAirportId: string;
    departureAirportName: string;
    departureAirportTimezone: string;
    arrivalAirportName: string;
    arrivalAirportTimezone: string;
    airlineName: string;
}
  
export interface PassengerRow {
    passportNum: string;
    passportCountry: string;
    passportExpiry: Date;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    ageRange: string;
}
  
export interface TicketRow {
    ticketId: string;
    farePackage: string;
    baggageAllowanceWeight: number;
    baggageAllowancePrice: number;
    mealSelection: string;
    mealPrice: number;
    ticketPrice: number;
    flightId: string;
    passportNum: string;
    seatId: string;
    seatNum: string;
    seatClass: string;
    seatPrice: number;
}