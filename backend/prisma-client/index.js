
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
  createParam,
} = require('./runtime/library.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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




  const path = require('path')

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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\mmawin99\\Desktop\\DEV\\skyvoyage\\backend\\prisma-client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\mmawin99\\Desktop\\DEV\\skyvoyage\\backend\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../.env",
    "schemaEnvPath": "../.env"
  },
  "relativePath": "../prisma",
  "clientVersion": "6.6.0",
  "engineVersion": "f676762280b54cd07c770017ed3711ddde35f37a",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "mysql",
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": "mysql://root:1234@localhost:3306/skyvoyage"
      }
    }
  },
  "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions \n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../prisma-client\"\n}\n\ndatasource db {\n  provider = \"mysql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel admin {\n  id         Int        @id @default(autoincrement())\n  username   String     @db.VarChar(40)\n  password   String     @db.LongText\n  fullname   String?    @db.VarChar(30)\n  permission Permission\n}\n\nmodel airline {\n  airlineCode  String         @id @db.VarChar(3)\n  airlineName  String         @db.VarChar(50)\n  aircraft     aircraft[]\n  aircraftCost aircraftCost[]\n  flight       flight[]\n}\n\nmodel aircraft {\n  aircraftId       String             @id @db.VarChar(13)\n  ownerAirlineCode String             @db.VarChar(3)\n  model            String             @db.VarChar(10)\n  airline          airline            @relation(fields: [ownerAirlineCode], references: [airlineCode])\n  flightOperate    flightOperate[]\n  aircraftSeatmap  aircraft_seatmap[]\n}\n\nmodel aircraftCost {\n  model            String  @db.VarChar(10)\n  ownerAirlineCode String  @db.VarChar(3)\n  costPerMile      Float\n  airline          airline @relation(fields: [ownerAirlineCode], references: [airlineCode])\n\n  @@id([model, ownerAirlineCode])\n}\n\nmodel airport {\n  airportCode String @id @db.VarChar(4)\n  name        String @db.VarChar(100)\n  country     String @db.VarChar(100)\n  city        String @db.VarChar(100)\n  timezone    String @db.VarChar(30)\n  latitude    Float?\n  longitude   Float?\n  altitude    Int?\n\n  departFlights flight[] @relation(\"DepartAirport\")\n  arriveFlights flight[] @relation(\"ArriveAirport\")\n}\n\nmodel booking {\n  bookingId         String              @id @db.VarChar(36)\n  bookingDate       DateTime            @default(now()) @db.DateTime(3)\n  status            BookingStatus       @default(UNPAID)\n  userId            String              @db.VarChar(36)\n  user              user                @relation(fields: [userId], references: [uuid])\n  bookingFlights    booking_flight[]\n  passengerBookings passenger_booking[]\n  tickets           ticket[]\n  payment           payment?\n}\n\nmodel booking_flight {\n  bookingId String        @db.VarChar(36)\n  flightId  String        @db.VarChar(36)\n  booking   booking       @relation(fields: [bookingId], references: [bookingId])\n  flight    flightOperate @relation(fields: [flightId], references: [flightId])\n\n  @@id([bookingId, flightId])\n}\n\nmodel flight {\n  flightNum       String          @db.VarChar(10)\n  airlineCode     String          @db.VarChar(3)\n  departAirportId String          @db.VarChar(4)\n  arriveAirportId String          @db.VarChar(4)\n  airline         airline         @relation(fields: [airlineCode], references: [airlineCode])\n  departAirport   airport         @relation(\"DepartAirport\", fields: [departAirportId], references: [airportCode])\n  arriveAirport   airport         @relation(\"ArriveAirport\", fields: [arriveAirportId], references: [airportCode])\n  flightOperates  flightOperate[]\n  transitFrom     transit[]       @relation(\"FromFlight\")\n  transitTo       transit[]       @relation(\"ToFlight\")\n\n  @@id([flightNum, airlineCode])\n}\n\nmodel flightOperate {\n  flightId       String           @id @db.VarChar(36)\n  flightNum      String           @db.VarChar(10)\n  airlineCode    String           @db.VarChar(3)\n  departureTime  DateTime         @db.DateTime(3)\n  arrivalTime    DateTime         @db.DateTime(3)\n  departureGate  String           @db.VarChar(5)\n  aircraftId     String           @db.VarChar(13)\n  aircraft       aircraft         @relation(fields: [aircraftId], references: [aircraftId])\n  flight         flight           @relation(fields: [flightNum, airlineCode], references: [flightNum, airlineCode])\n  bookingFlights booking_flight[]\n  tickets        ticket[]\n\n  @@unique([flightNum, airlineCode, departureTime])\n}\n\nmodel passenger {\n  passportNum       String              @id @db.VarChar(9)\n  passportCountry   String              @db.VarChar(30)\n  passportExpiry    DateTime            @db.DateTime(3)\n  firstName         String              @db.VarChar(30)\n  lastName          String              @db.VarChar(30)\n  dateOfBirth       DateTime            @db.DateTime(3)\n  nationality       String              @db.VarChar(100)\n  ageRange          AgeRange\n  userId            String              @db.VarChar(36)\n  user              user                @relation(fields: [userId], references: [uuid])\n  passengerBookings passenger_booking[]\n  tickets           ticket[]\n}\n\nmodel passenger_booking {\n  bookingId   String    @db.VarChar(36)\n  passportNum String    @db.VarChar(9)\n  booking     booking   @relation(fields: [bookingId], references: [bookingId])\n  passenger   passenger @relation(fields: [passportNum], references: [passportNum])\n\n  @@id([bookingId, passportNum])\n}\n\nmodel payment {\n  paymentId   String   @id @db.VarChar(36)\n  amount      Float    @default(0)\n  method      String   @db.VarChar(30)\n  paymentDate DateTime @default(now()) @db.DateTime(3)\n  bookingId   String   @unique @db.VarChar(36)\n  booking     booking  @relation(fields: [bookingId], references: [bookingId])\n}\n\nmodel aircraft_seatmap {\n  aircraftId String       @db.VarChar(13)\n  seatMapId  String       @db.VarChar(32)\n  aircraft   aircraft     @relation(fields: [aircraftId], references: [aircraftId])\n  seatmap    seatmap_info @relation(fields: [seatMapId], references: [seatMapId])\n\n  @@id([aircraftId, seatMapId])\n}\n\nmodel seatmap_info {\n  seatMapId     String             @id @db.VarChar(32)\n  airlineCode   String             @db.VarChar(3)\n  aircraftModel String             @db.VarChar(10)\n  version       String             @db.VarChar(10)\n  seat          seat[]\n  aircraft      aircraft_seatmap[]\n}\n\nmodel seat {\n  seatMapId String       @db.VarChar(32)\n  seatId    String       @unique @db.VarChar(16)\n  seatNum   String       @db.VarChar(4)\n  row       Int          @default(1)\n  class     SeatClass    @default(Y)\n  price     Float        @default(0)\n  features  String       @db.MediumText\n  floor     Int          @default(1)\n  tickets   ticket[]\n  seatmap   seatmap_info @relation(fields: [seatMapId], references: [seatMapId])\n\n  @@id([seatMapId, seatId])\n}\n\nmodel ticket {\n  ticketNum              String      @id @db.VarChar(13)\n  farePackage            FarePackage @default(STANDARD)\n  baggageAllowanceWeight Int         @default(0)\n  baggageAllowancePrice  Float       @default(0)\n  mealSelection          String      @db.VarChar(10)\n  mealPrice              Float       @default(0)\n  ticketPrice            Float       @default(0)\n  bookingId              String      @db.VarChar(36)\n  flightId               String      @db.VarChar(36)\n  passportNum            String      @db.VarChar(9)\n  seatNum                String      @db.VarChar(4)\n\n  booking   booking       @relation(fields: [bookingId], references: [bookingId])\n  passenger passenger     @relation(fields: [passportNum], references: [passportNum])\n  flight    flightOperate @relation(fields: [flightId], references: [flightId])\n  seat      seat          @relation(fields: [seatNum], references: [seatId])\n}\n\nmodel transit {\n  flightNumFrom   String\n  airlineCodeFrom String\n  flightNumTo     String\n  airlineCodeTo   String\n\n  from flight @relation(\"FromFlight\", fields: [flightNumFrom, airlineCodeFrom], references: [flightNum, airlineCode])\n  to   flight @relation(\"ToFlight\", fields: [flightNumTo, airlineCodeTo], references: [flightNum, airlineCode])\n\n  @@id([flightNumFrom, airlineCodeFrom, flightNumTo, airlineCodeTo])\n}\n\nmodel user {\n  uuid         String      @id @default(uuid()) @db.VarChar(36)\n  password     String      @db.LongText\n  firstname    String      @db.VarChar(50)\n  lastname     String      @db.VarChar(50)\n  email        String      @db.VarChar(50)\n  phone        String      @db.VarChar(20)\n  registerDate DateTime    @default(now()) @db.DateTime(3)\n  bookings     booking[]\n  passengers   passenger[]\n}\n\nenum Permission {\n  SUPER\n  DATA_ENTRY\n}\n\nenum BookingStatus {\n  PAID\n  UNPAID\n  CANCELLED\n}\n\nenum AgeRange {\n  Adult\n  Children\n  Infant\n}\n\nenum SeatClass {\n  F\n  C\n  Y\n  W\n}\n\nenum FarePackage {\n  SUPER_SAVER\n  SAVER\n  STANDARD\n  FLEXI\n  FULL_FLEX\n}\n",
  "inlineSchemaHash": "278fbb0be34eef007dd60a5afee3d977514f21b34c3a84841b6bbe938b8455d0",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "prisma-client",
    "",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"admin\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"40\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"LongText\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fullname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"30\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"permission\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Permission\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"airline\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"airlineCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"3\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"airlineName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aircraft\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"aircraft\",\"nativeType\":null,\"relationName\":\"aircraftToairline\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aircraftCost\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"aircraftCost\",\"nativeType\":null,\"relationName\":\"aircraftCostToairline\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flight\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"flight\",\"nativeType\":null,\"relationName\":\"airlineToflight\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"aircraft\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"aircraftId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"13\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ownerAirlineCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"3\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"model\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"10\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"airline\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"airline\",\"nativeType\":null,\"relationName\":\"aircraftToairline\",\"relationFromFields\":[\"ownerAirlineCode\"],\"relationToFields\":[\"airlineCode\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flightOperate\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"flightOperate\",\"nativeType\":null,\"relationName\":\"aircraftToflightOperate\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aircraftSeatmap\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"aircraft_seatmap\",\"nativeType\":null,\"relationName\":\"aircraftToaircraft_seatmap\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"aircraftCost\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"model\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"10\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ownerAirlineCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"3\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"costPerMile\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"airline\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"airline\",\"nativeType\":null,\"relationName\":\"aircraftCostToairline\",\"relationFromFields\":[\"ownerAirlineCode\"],\"relationToFields\":[\"airlineCode\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"model\",\"ownerAirlineCode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"airport\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"airportCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"4\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timezone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"30\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"longitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"altitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departFlights\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"flight\",\"nativeType\":null,\"relationName\":\"DepartAirport\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"arriveFlights\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"flight\",\"nativeType\":null,\"relationName\":\"ArriveAirport\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"booking\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"bookingId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"3\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BookingStatus\",\"nativeType\":null,\"default\":\"UNPAID\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user\",\"nativeType\":null,\"relationName\":\"bookingTouser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"uuid\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingFlights\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking_flight\",\"nativeType\":null,\"relationName\":\"bookingTobooking_flight\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passengerBookings\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"passenger_booking\",\"nativeType\":null,\"relationName\":\"bookingTopassenger_booking\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tickets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ticket\",\"nativeType\":null,\"relationName\":\"bookingToticket\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payment\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"payment\",\"nativeType\":null,\"relationName\":\"bookingTopayment\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"booking_flight\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"bookingId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flightId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"booking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking\",\"nativeType\":null,\"relationName\":\"bookingTobooking_flight\",\"relationFromFields\":[\"bookingId\"],\"relationToFields\":[\"bookingId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flight\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"flightOperate\",\"nativeType\":null,\"relationName\":\"booking_flightToflightOperate\",\"relationFromFields\":[\"flightId\"],\"relationToFields\":[\"flightId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"bookingId\",\"flightId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"flight\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"flightNum\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"10\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"airlineCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"3\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departAirportId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"4\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"arriveAirportId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"4\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"airline\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"airline\",\"nativeType\":null,\"relationName\":\"airlineToflight\",\"relationFromFields\":[\"airlineCode\"],\"relationToFields\":[\"airlineCode\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departAirport\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"airport\",\"nativeType\":null,\"relationName\":\"DepartAirport\",\"relationFromFields\":[\"departAirportId\"],\"relationToFields\":[\"airportCode\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"arriveAirport\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"airport\",\"nativeType\":null,\"relationName\":\"ArriveAirport\",\"relationFromFields\":[\"arriveAirportId\"],\"relationToFields\":[\"airportCode\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flightOperates\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"flightOperate\",\"nativeType\":null,\"relationName\":\"flightToflightOperate\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transitFrom\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"transit\",\"nativeType\":null,\"relationName\":\"FromFlight\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transitTo\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"transit\",\"nativeType\":null,\"relationName\":\"ToFlight\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"flightNum\",\"airlineCode\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"flightOperate\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"flightId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flightNum\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"10\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"airlineCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"3\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departureTime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"3\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"arrivalTime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"3\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departureGate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"5\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aircraftId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"13\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aircraft\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"aircraft\",\"nativeType\":null,\"relationName\":\"aircraftToflightOperate\",\"relationFromFields\":[\"aircraftId\"],\"relationToFields\":[\"aircraftId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flight\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"flight\",\"nativeType\":null,\"relationName\":\"flightToflightOperate\",\"relationFromFields\":[\"flightNum\",\"airlineCode\"],\"relationToFields\":[\"flightNum\",\"airlineCode\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingFlights\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking_flight\",\"nativeType\":null,\"relationName\":\"booking_flightToflightOperate\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tickets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ticket\",\"nativeType\":null,\"relationName\":\"flightOperateToticket\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"flightNum\",\"airlineCode\",\"departureTime\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"flightNum\",\"airlineCode\",\"departureTime\"]}],\"isGenerated\":false},\"passenger\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"passportNum\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"9\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passportCountry\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"30\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passportExpiry\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"3\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"30\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"30\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dateOfBirth\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"3\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nationality\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"100\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ageRange\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AgeRange\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"user\",\"nativeType\":null,\"relationName\":\"passengerTouser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"uuid\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passengerBookings\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"passenger_booking\",\"nativeType\":null,\"relationName\":\"passengerTopassenger_booking\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tickets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ticket\",\"nativeType\":null,\"relationName\":\"passengerToticket\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"passenger_booking\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"bookingId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passportNum\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"9\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"booking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking\",\"nativeType\":null,\"relationName\":\"bookingTopassenger_booking\",\"relationFromFields\":[\"bookingId\"],\"relationToFields\":[\"bookingId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passenger\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"passenger\",\"nativeType\":null,\"relationName\":\"passengerTopassenger_booking\",\"relationFromFields\":[\"passportNum\"],\"relationToFields\":[\"passportNum\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"bookingId\",\"passportNum\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"payment\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"paymentId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"method\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"30\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"3\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"booking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking\",\"nativeType\":null,\"relationName\":\"bookingTopayment\",\"relationFromFields\":[\"bookingId\"],\"relationToFields\":[\"bookingId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"aircraft_seatmap\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"aircraftId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"13\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seatMapId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"32\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aircraft\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"aircraft\",\"nativeType\":null,\"relationName\":\"aircraftToaircraft_seatmap\",\"relationFromFields\":[\"aircraftId\"],\"relationToFields\":[\"aircraftId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seatmap\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"seatmap_info\",\"nativeType\":null,\"relationName\":\"aircraft_seatmapToseatmap_info\",\"relationFromFields\":[\"seatMapId\"],\"relationToFields\":[\"seatMapId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"aircraftId\",\"seatMapId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"seatmap_info\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"seatMapId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"32\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"airlineCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"3\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aircraftModel\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"10\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"10\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seat\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"seat\",\"nativeType\":null,\"relationName\":\"seatToseatmap_info\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"aircraft\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"aircraft_seatmap\",\"nativeType\":null,\"relationName\":\"aircraft_seatmapToseatmap_info\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"seat\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"seatMapId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"32\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seatId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"16\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seatNum\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"4\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"row\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"class\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"SeatClass\",\"nativeType\":null,\"default\":\"Y\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"features\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"MediumText\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"floor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tickets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ticket\",\"nativeType\":null,\"relationName\":\"seatToticket\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seatmap\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"seatmap_info\",\"nativeType\":null,\"relationName\":\"seatToseatmap_info\",\"relationFromFields\":[\"seatMapId\"],\"relationToFields\":[\"seatMapId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"seatMapId\",\"seatId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ticket\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"ticketNum\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"13\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"farePackage\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"FarePackage\",\"nativeType\":null,\"default\":\"STANDARD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"baggageAllowanceWeight\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"baggageAllowancePrice\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mealSelection\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"10\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mealPrice\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ticketPrice\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookingId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flightId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passportNum\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"9\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seatNum\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"4\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"booking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking\",\"nativeType\":null,\"relationName\":\"bookingToticket\",\"relationFromFields\":[\"bookingId\"],\"relationToFields\":[\"bookingId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passenger\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"passenger\",\"nativeType\":null,\"relationName\":\"passengerToticket\",\"relationFromFields\":[\"passportNum\"],\"relationToFields\":[\"passportNum\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flight\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"flightOperate\",\"nativeType\":null,\"relationName\":\"flightOperateToticket\",\"relationFromFields\":[\"flightId\"],\"relationToFields\":[\"flightId\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seat\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"seat\",\"nativeType\":null,\"relationName\":\"seatToticket\",\"relationFromFields\":[\"seatNum\"],\"relationToFields\":[\"seatId\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"transit\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"flightNumFrom\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"airlineCodeFrom\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flightNumTo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"airlineCodeTo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"from\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"flight\",\"nativeType\":null,\"relationName\":\"FromFlight\",\"relationFromFields\":[\"flightNumFrom\",\"airlineCodeFrom\"],\"relationToFields\":[\"flightNum\",\"airlineCode\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"to\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"flight\",\"nativeType\":null,\"relationName\":\"ToFlight\",\"relationFromFields\":[\"flightNumTo\",\"airlineCodeTo\"],\"relationToFields\":[\"flightNum\",\"airlineCode\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"flightNumFrom\",\"airlineCodeFrom\",\"flightNumTo\",\"airlineCodeTo\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"user\":{\"dbName\":null,\"schema\":null,\"fields\":[{\"name\":\"uuid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"36\"]],\"default\":{\"name\":\"uuid\",\"args\":[4]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"LongText\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastname\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"50\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"VarChar\",[\"20\"]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"registerDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":[\"DateTime\",[\"3\"]],\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bookings\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"booking\",\"nativeType\":null,\"relationName\":\"bookingTouser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"passengers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"passenger\",\"nativeType\":null,\"relationName\":\"passengerTouser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"Permission\":{\"values\":[{\"name\":\"SUPER\",\"dbName\":null},{\"name\":\"DATA_ENTRY\",\"dbName\":null}],\"dbName\":null},\"BookingStatus\":{\"values\":[{\"name\":\"PAID\",\"dbName\":null},{\"name\":\"UNPAID\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"AgeRange\":{\"values\":[{\"name\":\"Adult\",\"dbName\":null},{\"name\":\"Children\",\"dbName\":null},{\"name\":\"Infant\",\"dbName\":null}],\"dbName\":null},\"SeatClass\":{\"values\":[{\"name\":\"F\",\"dbName\":null},{\"name\":\"C\",\"dbName\":null},{\"name\":\"Y\",\"dbName\":null},{\"name\":\"W\",\"dbName\":null}],\"dbName\":null},\"FarePackage\":{\"values\":[{\"name\":\"SUPER_SAVER\",\"dbName\":null},{\"name\":\"SAVER\",\"dbName\":null},{\"name\":\"STANDARD\",\"dbName\":null},{\"name\":\"FLEXI\",\"dbName\":null},{\"name\":\"FULL_FLEX\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined
config.compilerWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "prisma-client/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "prisma-client/schema.prisma")
