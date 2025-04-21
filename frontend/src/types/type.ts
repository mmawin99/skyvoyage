// export interface Airline {
//     airlineCode: string,
//     airlineName: string
// };
  
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
    aircraftModelName: string,
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
    airline_code: string,
    depart_airport: string,
    arrive_airport: string,
    arrival_time: string,
    departure_time: string,
}

export interface AircraftModel {
    model: string,
    model_name: string,
    airline_code: string,
}

export interface AircraftRegistration {
    registration: string,
    model: string,
    airline_code: string,
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
    price: number;
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
    arrivalTime: string
    aircraftId: string
    departAirportId: string
    departureAirport: string
    arriveAirportId: string
    arrivalAirport: string
    aircraftModel: string
}
