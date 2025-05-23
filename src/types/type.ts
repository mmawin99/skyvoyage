// /* eslint-disable @typescript-eslint/no-explicit-any */
// export interface Airline {
//     airlineCode: string,
//     airlineName: string
// };

import Stripe from "stripe"
  
// export interface Aircraft {
//     aircraftId: string,
//     ownerAirlineCode: string,
//     model: string,
//     seatMapId: string
// };
  
// export interface AircraftCost {
//     model: string,
//     ownerAirlineCode: string,
//     costPerMile: number
// };
  
// export interface Airport {
//     airportCode: string,
//     name: string,
//     country: string,
//     city: string,
//     timezone: string,
//     latitude: number,
//     longitude: number,
//     altitude: number
// };
  
// export interface Booking {
//     bookingId: string,
//     bookingDate: string,
//     status: string,
//     userId: string
// };
  
// export interface Booking_flight {
//     bookingId: string,
//     flightId: string
// };
  
// export interface Flight {
//     flightNum: string,
//     airlineCode: string,
//     departAirportId: string,
//     arriveAirportId: string,
//     departureTime: string,
//     arrivalTime: string
// };
  
// export interface FlightOperate {
//     flightId: 'flightId',
//     flightNum: string,
//     airlineCode: string,
//     departureTime: string,
//     arrivalTime: string,
//     departureGate: string,
//     aircraftId: string
// };
  
// export interface Passenger {
//     passportNum: string,
//     passportCountry: string,
//     passportExpiry: string,
//     firstName: string,
//     lastName: string,
//     dateOfBirth: string,
//     nationality: string,
//     ageRange: string,
//     userId: string
// };
  
// export interface Passenger_booking {
//     bookingId: string,
//     passportNum: string
// };
  
// export interface Payment {
//     paymentId: string,
//     amount: number,
//     method: string,
//     paymentDate: string,
//     bookingId: string
// };
  
// export interface Seatmap_info {
//     seatMapId: string,
//     airlineCode: string,
//     aircraftModel: string,
//     version: number
// };
  
// export interface Seat {
//     seatMapId: string,
//     seatId: string,
//     seatNum: string,
//     row: number,
//     class: string,
//     price: number,
//     features: string,
//     floor: string
// };
  
// export interface Ticket {
//     ticketNum: 'ticketNum',
//     farePackage: 'farePackage',
//     baggageAllowanceWeight: 'baggageAllowanceWeight',
//     baggageAllowancePrice: 'baggageAllowancePrice',
//     mealSelection: 'mealSelection',
//     mealPrice: 'mealPrice',
//     ticketPrice: 'ticketPrice',
//     bookingId: string,
//     flightId: 'flightId',
//     passportNum: string,
//     seatNum: 'seatNum'
// };
  
// export interface Transit {
//     flightNumFrom: 'flightNumFrom',
//     airlineCodeFrom: 'airlineCodeFrom',
//     flightNumTo: 'flightNumTo',
//     airlineCodeTo: 'airlineCodeTo'
// };
  
// export interface User {
//     uuid: 'uuid',
//     password: 'password',
//     firstname: 'firstname',
//     lastname: 'lastname',
//     email: 'email',
//     phone: 'phone',
//     registerDate: 'registerDate'
// };
  
export interface Schedule {
    flightId: string,
    flightNum: string,
    airlineCode: string,
    airlineName: string,
    departureTime: string,
    arrivalTime: string,
    departureGate: string,
    aircraftId: string,
    aircraftModel: string,
    aircraftModelName?: string,
    departureAirport: string,
    departureAirportCode: string,
    arrivalAirport: string,
    arrivalAirportCode: string
}

export interface Airport {
    code: string,
    name: string,
    country: string,
    short_country: string,
    city: string,
}

export interface Airline {
    code: string,
    name: string
}
export interface Flight {
    flight_number: string,
    airlineCode: string,
    depart_airport: string,
    arrive_airport: string,
    arrival_time: string,
    departure_time: string,
}

export interface AircraftModel {
    model: string,
    model_name: string,
    airlineCode: string,
}

export interface AircraftRegistration {
    registration: string,
    model: string,
    airlineCode: string,
    totalFlight: number
}

export interface AuthUser {
    role: string,
    id?: string, // Optional, only for admin
    username?: string, // Optional, only for admin
    permission?: string, // Optional, only for admin
    uuid?: string, // Optional, only for user
    email?: string, // Optional, only for user
    firstname?: string, // Optional, only for user
    lastname?: string, // Optional, only for user
}

export interface AuthToken {
    role: string,
    id?: string, // Optional, only for admin
    username?: string, // Optional, only for admin
    permission?: string, // Optional, only for admin
    uuid?: string, // Optional, only for user
    email?: string, // Optional, only for user
    firstname?: string, // Optional, only for user
    lastname?: string, // Optional, only for user
}

interface DefaultUserAuth {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
}

export interface AuthSession {
    user: AuthUser & DefaultUserAuth & {
      role: string,
      id?: string,
      username?: string,
      permission?: string,
      uuid?: string,
      email?: string,
      firstname?: string,
      lastname?: string,
    }
}

export interface Country {
    iso2: string;
    name: string;
    dialCode: string;
};

export interface UniversalFlightSegmentSchedule{
    flightId: string;
    flightNum: string;
    airlineCode: string;
    airlineName: string;
    departureTime: string;
    arrivalTime: string;
    aircraftModel: string;
    departureAirport: string;
    arrivalAirport: string;
    departTimezone: string;
    arriveTimezone: string;
}
export interface UniversalFlightSchedule {
    id: string;
    price: {
        SUPER_SAVER: number;
        SAVER: number;
        STANDARD: number;
        FLEXI: number;
        FULL_FLEX: number;
    };
    duration: number;
    stopCount: number;
    segments: UniversalFlightSegmentSchedule[];
    departureAirport: string;
    arrivalAirport: string;
}

export interface ScheduleListAdmin{
    flightId: string
    flightNum: string
    airlineCode: string
    airlineName: string
    departureTime: string
    departureTimezone: string
    arrivalTime: string
    arrivalTimezone: string
    aircraftId: string
    departAirportId: string
    departureAirport: string
    arriveAirportId: string
    arrivalAirport: string
    aircraftModel: string
}

export type FareType = "SUPER_SAVER" | "SAVER" | "STANDARD" | "FLEXI" | "FULL_FLEX"


export interface searchSelectedFlight {
    selectedFare:FareType, 
    flightId: string,
    flight: UniversalFlightSchedule
    price: number
}

export interface PassengerTicket{
    tid: string, // ticket id (only frontend use)
    fid: string, //flight reference id
    baggageAllowanceWeight: number // in kg
    baggageAllowancePrice: number // in USD
    mealSelection: string //
    mealPrice: number // in USD
    seatId: string | null // seat id
    seatPrice: number
}

export interface PassengerFillOut{
    label: string
    pid: string // passenger id (only frontend use)
    status: "UNFILLED" | "FILLED" // frotnend use only status of filling passenger info
    passportNum: string // 9 charactors
    passportCountry: string // 2 charactors
    passportExpiry: string // YYYY-MM-DD
    titleName: string
    firstName: string
    lastName: string
    dateOfBirth: string // YYYY-MM-DD
    nationality: string // 2 charactors
    ageRange: "Adult" | "Children" | "Infant"
    ticket: PassengerTicket[]
}

export interface searchSelectedRoutes{
    departRoute: UniversalFlightSchedule[],
    selectedDepartRoute: searchSelectedFlight,
    returnRoute?: UniversalFlightSchedule[],
    selectedReturnRoute?: searchSelectedFlight,
    queryString:{
        origin: string,
        destination: string,
        departDateStr: string,
        returnDateStr: string,
        passengersStr: string,
        cabinClass: CabinClassType,
        tripType: string,
    }
    totalFare: number,
    passenger?: PassengerFillOut[],
    ticket?: string
}

// Fare package types

export interface FarePackage {
    type: FareType
    price: number
    baggage: string
    carryOn: string
    seatSelection: boolean
    changes: string
    cancellation: string
    priorityBoarding: boolean
    recommended?: boolean
    label?: string
    mileage?: string
    refundable?: boolean
    loungeAccess?: boolean
    available?: boolean
    mealSelection?: boolean
  }

export type CabinClassType = "Y" | "C" | "W" | "F"

export interface SeatmapAPI{
    seatId: string;
    seatNum: string;
    row: number;
    column: string;
    class: string;
    price: number;
    features: {
        s: {
            p: string; //seat_pitch
            w: string; //seat_width
            r: string; //seat_recline
        },
        f: number[] //features_id
    };
    floor: number;
    seatStatus: 'available' | 'reserved';
}

export interface SeatmapAPIAdmin{
    seatId: string;
    seatNum: string;
    row: number;
    column: string;
    class: string;
    price: number;
    features: {
        s: {
            p: string; //seat_pitch
            w: string; //seat_width
            r: string; //seat_recline
        },
        f: number[] //features_id
    };
    floor: number;
}

export interface SeatmapFetch{
    status: boolean,
    msg: string,
    flightId: string,
    cabinClass: string,
    data: SeatmapAPI[]
}

export interface ticketBaggageUpdatorType {
    passengerIndex: number,
    ticketIndex: number,
    weight: number,
    price: number
}

export interface ticketMealUpdatorType {
    passengerIndex: number,
    ticketIndex: number,
    mealIndex: number,
    mealLabel: string,
    price: number
}

export interface adminFlightListType {
    flightNum: string,
    airlineCode: string,
    airlineName: string,
    departAirportId: string,
    departAirportName: string,
    arriveAirportId: string,
    arriveAirportName: string,
    utcArrivalTime: string,
    utcDepartureTime: string,
    flightCount?: number
}

export interface adminTransitListType{
    flightNumFrom: string,
    flightNumTo: string,
    airlineCodeFrom: string,
    airlineNameFrom: string,
    airlineCodeTo: string,
    airlineNameTo: string,
    departureAirportCode: string,
    transitAirportCode: string,
    arrivalAirportCode: string,
}
export interface loadExistPassengerType{
    passportNum: string,
    passportCountry: string,
    passportExpiry: string,
    title: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    nationality: string,
    ageRange: string
}
export type BookingStatus = "PAID" | "CANCELLED" | "REFUNDED"

export interface searchSelectedBookingRoutes extends searchSelectedRoutes{
    status: BookingStatus
    payment:{
        paymentId: string | null,
        paymentDate: string | null,
        paymentMethod: string | null,
        data: Stripe.PaymentMethod | null,
        refunding:{
            status: boolean,
            data: Stripe.Refund | null,
            refundDate: string | null,
            refundId: string | null
        }
    }
    userId: string,
    bookingDate: string | null,
    userDetail?: UserDetailType
}

export interface UserDetailType {
    uuid: string,
    firstname: string,
    lastname: string,
    email: string,
}
export interface BookingRefundAndCancelType{
    status: boolean
    message: string
    refundId?: string
    bookingId: string
    amount: number
    error?: string
}

export interface SeatMapVersionType{
    id: string,
    version: number,
}

export type adminPermission = "SUPER" | "DATA_ENTRY" | "USER"

export interface UserDetailAPIType{
    uuid: string,
    firstname: string,
    lastname: string,
    password: string,
    email: string,
    phone: string,
    registerDate: string,
}

export interface AdminDetailAPIType {
    id: string,
    username: string,
    fullname: string | null,
    permission: adminPermission,
}

export interface AirportAPIType{
    airportCode: string,
    name: string,
    country: string,
    city: string,
    timezone: string,
    latitude: number,
    longitude: number,
    altitude: number,
    numAssociateFlight: number,
    numAssociateAirline: number,
}

export interface AirlineAPIType{
    airlineCode: string,
    airlineName: string,
    numAssociateFlight: number,
    numAssociateAircraft: number,
    numAssociateSchedule: number,
}


//Admin API

export interface SubmitAirline{
    airlineCode: string,
    airlineName: string,
}
export interface SubmitAirport{
    airportCode: string,
    name: string,
    country: string,
    city: string,
    timezone: string,
    latitude: number,
    longitude: number,
    altitude: number
}


export interface SubmitUser{
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    password: string
}

export interface SubmitAdmin{
    username: string,
    password: string,
    permission: adminPermission
}

export interface SubmitEditUserProps extends SubmitUser{
    uuid: string
    registerDate: string
    password: string
}

export interface SubmitEditAdminProps extends SubmitAdmin{
    id: string
}

export interface SubmitSchedule {
    type: "recurring" | "single",
    flightNum: string,
    airlineCode: string,
    model: string,
    //For single flights
    registration?: string,
    departureDate?: string,
    arrivalDate?: string,
    //End for single flights
    //For recurring flights
    daysofweek?: string,
    startDate?: string,
    endDate?: string,
    depTime?: string,
    arrTime?: string,
    //End for recurring flights
}

export interface SubmitFlight{
    flightNum: string,
    airlineCode: string,
    departAirportId: string,
    arriveAirportId: string,
    departureTime: string,
    arrivalTime: string
}

export interface SubmitTransit{
    flightNumFrom: string,
    flightNumTo: string,
    airlineCodeFrom: string,
    airlineCodeTo: string
}

export interface SubmitAircraft{
    aircraftId: string,
    ownerAirlineCode: string,
    model: string,
    seatMapId: string,
}

export interface SeatmapAPIMetadata{
    seatMapId: string
    airlineCode: string
    airlineName: string
    aircraftModel: string
    version: string
    seatCount: number
    classDistribution: string
}

export interface SubmitAircraftCost{
    model: string,
    ownerAirlineCode: string,
    costPerMile: number
}
export interface AircraftCost {
    model: string,
    ownerAirlineCode: string,
    costPerMile: number
}