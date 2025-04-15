
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  username: 'username',
  password: 'password',
  fullname: 'fullname',
  permission: 'permission'
};

exports.Prisma.AirlineScalarFieldEnum = {
  airlineCode: 'airlineCode',
  airlineName: 'airlineName'
};

exports.Prisma.AircraftScalarFieldEnum = {
  aircraftId: 'aircraftId',
  ownerAirlineCode: 'ownerAirlineCode',
  model: 'model'
};

exports.Prisma.AircraftCostScalarFieldEnum = {
  model: 'model',
  ownerAirlineCode: 'ownerAirlineCode',
  costPerMile: 'costPerMile'
};

exports.Prisma.AirportScalarFieldEnum = {
  airportCode: 'airportCode',
  name: 'name',
  country: 'country',
  city: 'city',
  timezone: 'timezone',
  latitude: 'latitude',
  longitude: 'longitude',
  altitude: 'altitude'
};

exports.Prisma.BookingScalarFieldEnum = {
  bookingId: 'bookingId',
  bookingDate: 'bookingDate',
  status: 'status',
  userId: 'userId'
};

exports.Prisma.Booking_flightScalarFieldEnum = {
  bookingId: 'bookingId',
  flightId: 'flightId'
};

exports.Prisma.FlightScalarFieldEnum = {
  flightNum: 'flightNum',
  airlineCode: 'airlineCode',
  departAirportId: 'departAirportId',
  arriveAirportId: 'arriveAirportId'
};

exports.Prisma.FlightOperateScalarFieldEnum = {
  flightId: 'flightId',
  flightNum: 'flightNum',
  airlineCode: 'airlineCode',
  departureTime: 'departureTime',
  arrivalTime: 'arrivalTime',
  departureGate: 'departureGate',
  aircraftId: 'aircraftId'
};

exports.Prisma.PassengerScalarFieldEnum = {
  passportNum: 'passportNum',
  passportCountry: 'passportCountry',
  passportExpiry: 'passportExpiry',
  firstName: 'firstName',
  lastName: 'lastName',
  dateOfBirth: 'dateOfBirth',
  nationality: 'nationality',
  ageRange: 'ageRange',
  userId: 'userId'
};

exports.Prisma.Passenger_bookingScalarFieldEnum = {
  bookingId: 'bookingId',
  passportNum: 'passportNum'
};

exports.Prisma.PaymentScalarFieldEnum = {
  paymentId: 'paymentId',
  amount: 'amount',
  method: 'method',
  paymentDate: 'paymentDate',
  bookingId: 'bookingId'
};

exports.Prisma.Aircraft_seatmapScalarFieldEnum = {
  aircraftId: 'aircraftId',
  seatMapId: 'seatMapId'
};

exports.Prisma.Seatmap_infoScalarFieldEnum = {
  seatMapId: 'seatMapId',
  airlineCode: 'airlineCode',
  aircraftModel: 'aircraftModel',
  version: 'version'
};

exports.Prisma.SeatScalarFieldEnum = {
  seatMapId: 'seatMapId',
  seatId: 'seatId',
  seatNum: 'seatNum',
  row: 'row',
  class: 'class',
  price: 'price',
  features: 'features',
  floor: 'floor'
};

exports.Prisma.TicketScalarFieldEnum = {
  ticketNum: 'ticketNum',
  farePackage: 'farePackage',
  baggageAllowanceWeight: 'baggageAllowanceWeight',
  baggageAllowancePrice: 'baggageAllowancePrice',
  mealSelection: 'mealSelection',
  mealPrice: 'mealPrice',
  ticketPrice: 'ticketPrice',
  bookingId: 'bookingId',
  flightId: 'flightId',
  passportNum: 'passportNum',
  seatNum: 'seatNum'
};

exports.Prisma.TransitScalarFieldEnum = {
  flightNumFrom: 'flightNumFrom',
  airlineCodeFrom: 'airlineCodeFrom',
  flightNumTo: 'flightNumTo',
  airlineCodeTo: 'airlineCodeTo'
};

exports.Prisma.UserScalarFieldEnum = {
  uuid: 'uuid',
  password: 'password',
  firstname: 'firstname',
  lastname: 'lastname',
  email: 'email',
  phone: 'phone',
  registerDate: 'registerDate'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.adminOrderByRelevanceFieldEnum = {
  username: 'username',
  password: 'password',
  fullname: 'fullname'
};

exports.Prisma.airlineOrderByRelevanceFieldEnum = {
  airlineCode: 'airlineCode',
  airlineName: 'airlineName'
};

exports.Prisma.aircraftOrderByRelevanceFieldEnum = {
  aircraftId: 'aircraftId',
  ownerAirlineCode: 'ownerAirlineCode',
  model: 'model'
};

exports.Prisma.aircraftCostOrderByRelevanceFieldEnum = {
  model: 'model',
  ownerAirlineCode: 'ownerAirlineCode'
};

exports.Prisma.airportOrderByRelevanceFieldEnum = {
  airportCode: 'airportCode',
  name: 'name',
  country: 'country',
  city: 'city',
  timezone: 'timezone'
};

exports.Prisma.bookingOrderByRelevanceFieldEnum = {
  bookingId: 'bookingId',
  userId: 'userId'
};

exports.Prisma.booking_flightOrderByRelevanceFieldEnum = {
  bookingId: 'bookingId',
  flightId: 'flightId'
};

exports.Prisma.flightOrderByRelevanceFieldEnum = {
  flightNum: 'flightNum',
  airlineCode: 'airlineCode',
  departAirportId: 'departAirportId',
  arriveAirportId: 'arriveAirportId'
};

exports.Prisma.flightOperateOrderByRelevanceFieldEnum = {
  flightId: 'flightId',
  flightNum: 'flightNum',
  airlineCode: 'airlineCode',
  departureGate: 'departureGate',
  aircraftId: 'aircraftId'
};

exports.Prisma.passengerOrderByRelevanceFieldEnum = {
  passportNum: 'passportNum',
  passportCountry: 'passportCountry',
  firstName: 'firstName',
  lastName: 'lastName',
  nationality: 'nationality',
  userId: 'userId'
};

exports.Prisma.passenger_bookingOrderByRelevanceFieldEnum = {
  bookingId: 'bookingId',
  passportNum: 'passportNum'
};

exports.Prisma.paymentOrderByRelevanceFieldEnum = {
  paymentId: 'paymentId',
  method: 'method',
  bookingId: 'bookingId'
};

exports.Prisma.aircraft_seatmapOrderByRelevanceFieldEnum = {
  aircraftId: 'aircraftId',
  seatMapId: 'seatMapId'
};

exports.Prisma.seatmap_infoOrderByRelevanceFieldEnum = {
  seatMapId: 'seatMapId',
  airlineCode: 'airlineCode',
  aircraftModel: 'aircraftModel',
  version: 'version'
};

exports.Prisma.seatOrderByRelevanceFieldEnum = {
  seatMapId: 'seatMapId',
  seatId: 'seatId',
  seatNum: 'seatNum',
  features: 'features'
};

exports.Prisma.ticketOrderByRelevanceFieldEnum = {
  ticketNum: 'ticketNum',
  mealSelection: 'mealSelection',
  bookingId: 'bookingId',
  flightId: 'flightId',
  passportNum: 'passportNum',
  seatNum: 'seatNum'
};

exports.Prisma.transitOrderByRelevanceFieldEnum = {
  flightNumFrom: 'flightNumFrom',
  airlineCodeFrom: 'airlineCodeFrom',
  flightNumTo: 'flightNumTo',
  airlineCodeTo: 'airlineCodeTo'
};

exports.Prisma.userOrderByRelevanceFieldEnum = {
  uuid: 'uuid',
  password: 'password',
  firstname: 'firstname',
  lastname: 'lastname',
  email: 'email',
  phone: 'phone'
};
exports.Permission = exports.$Enums.Permission = {
  SUPER: 'SUPER',
  DATA_ENTRY: 'DATA_ENTRY'
};

exports.BookingStatus = exports.$Enums.BookingStatus = {
  PAID: 'PAID',
  UNPAID: 'UNPAID',
  CANCELLED: 'CANCELLED'
};

exports.AgeRange = exports.$Enums.AgeRange = {
  Adult: 'Adult',
  Children: 'Children',
  Infant: 'Infant'
};

exports.SeatClass = exports.$Enums.SeatClass = {
  F: 'F',
  C: 'C',
  Y: 'Y',
  W: 'W'
};

exports.FarePackage = exports.$Enums.FarePackage = {
  SUPER_SAVER: 'SUPER_SAVER',
  SAVER: 'SAVER',
  STANDARD: 'STANDARD',
  FLEXI: 'FLEXI',
  FULL_FLEX: 'FULL_FLEX'
};

exports.Prisma.ModelName = {
  admin: 'admin',
  airline: 'airline',
  aircraft: 'aircraft',
  aircraftCost: 'aircraftCost',
  airport: 'airport',
  booking: 'booking',
  booking_flight: 'booking_flight',
  flight: 'flight',
  flightOperate: 'flightOperate',
  passenger: 'passenger',
  passenger_booking: 'passenger_booking',
  payment: 'payment',
  aircraft_seatmap: 'aircraft_seatmap',
  seatmap_info: 'seatmap_info',
  seat: 'seat',
  ticket: 'ticket',
  transit: 'transit',
  user: 'user'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
