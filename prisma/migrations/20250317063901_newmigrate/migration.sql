-- CreateTable
CREATE TABLE `User` (
    `uuid` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `firstname` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `register_date` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `fullname` VARCHAR(191) NULL,
    `permission` ENUM('SUPER', 'DATAENTRY') NOT NULL,

    UNIQUE INDEX `Admin_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aircraft` (
    `aircraftID` VARCHAR(191) NOT NULL,
    `ownerAirlineCode` VARCHAR(191) NOT NULL,
    `aircraftModel` VARCHAR(191) NULL,
    `costPerMile` DOUBLE NOT NULL,
    `aircraftFCap` INTEGER NOT NULL,
    `aircraftCCap` INTEGER NOT NULL,
    `aircraftYCap` INTEGER NOT NULL,
    `aircraftWCap` INTEGER NOT NULL,

    PRIMARY KEY (`aircraftID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Airline` (
    `airlineCode` VARCHAR(191) NOT NULL,
    `airlineName` VARCHAR(191) NULL,

    PRIMARY KEY (`airlineCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Airport` (
    `airportCode` VARCHAR(191) NOT NULL,
    `airportName` VARCHAR(191) NOT NULL,
    `airportCountry` VARCHAR(191) NOT NULL,
    `airportCity` VARCHAR(191) NOT NULL,
    `airportTimezone` VARCHAR(191) NOT NULL,
    `airportLat` DOUBLE NOT NULL,
    `airportLon` DOUBLE NOT NULL,
    `airportAlt` INTEGER NOT NULL,

    PRIMARY KEY (`airportCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `bookingId` VARCHAR(191) NOT NULL,
    `uuid` VARCHAR(191) NOT NULL,
    `numAdultPassenger` INTEGER NULL,
    `numChildrenPassenger` INTEGER NULL,
    `numInfantPassenger` INTEGER NULL,
    `bookingDate` DATETIME(3) NOT NULL,
    `bookingStatus` ENUM('Paid', 'Unpaid', 'Cancelled') NOT NULL,

    PRIMARY KEY (`bookingId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingFlight` (
    `bookingId` VARCHAR(191) NOT NULL,
    `flightID` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`bookingId`, `flightID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flight` (
    `flightID` VARCHAR(191) NOT NULL,
    `flightNum` VARCHAR(191) NOT NULL,
    `callsign` VARCHAR(191) NOT NULL,
    `airlineCode` VARCHAR(191) NOT NULL,
    `aircraftID` VARCHAR(191) NOT NULL,
    `departAirportCode` VARCHAR(191) NOT NULL,
    `arriveAirportCode` VARCHAR(191) NOT NULL,
    `departureTime` DATETIME(3) NOT NULL,
    `arrivalTime` DATETIME(3) NULL,

    UNIQUE INDEX `Flight_flightNum_departureTime_key`(`flightNum`, `departureTime`),
    PRIMARY KEY (`flightID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Passenger` (
    `passportNum` VARCHAR(191) NOT NULL,
    `passportCountry` VARCHAR(191) NULL,
    `passportExpireDate` DATETIME(3) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `DoB` DATETIME(3) NULL,
    `nationality` VARCHAR(191) NULL,
    `userUuid` VARCHAR(191) NULL,

    PRIMARY KEY (`passportNum`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PassengerBooking` (
    `bookingId` VARCHAR(191) NOT NULL,
    `passportNum` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`bookingId`, `passportNum`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `paymentCode` INTEGER NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `paymentAmount` DOUBLE NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `paymentDate` DATETIME(3) NULL,

    PRIMARY KEY (`paymentCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Seat` (
    `seatNum` VARCHAR(191) NOT NULL,
    `seatRow` INTEGER NOT NULL,
    `class` ENUM('C', 'Y', 'F', 'W') NOT NULL,
    `flightID` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `reserved` ENUM('YES', 'NO', 'MAYBE') NOT NULL,
    `feature` VARCHAR(191) NOT NULL,
    `seatFloor` INTEGER NOT NULL,

    PRIMARY KEY (`flightID`, `seatNum`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `ticketNum` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `flightID` VARCHAR(191) NOT NULL,
    `passportNum` VARCHAR(191) NOT NULL,
    `seatNum` VARCHAR(191) NOT NULL,
    `farePackage` ENUM('supersaver', 'saver', 'standard', 'flexi', 'fullflex') NOT NULL,
    `baggageAllowanceWeight` INTEGER NULL,
    `baggageAllowancePrice` DOUBLE NULL,
    `mealSelection` VARCHAR(191) NULL,
    `mealPrice` DOUBLE NULL,
    `totalPrice` DOUBLE NOT NULL,
    `ticketStatus` ENUM('Paid', 'Cancelled') NOT NULL,

    PRIMARY KEY (`ticketNum`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transit` (
    `transitAirport` VARCHAR(191) NOT NULL,
    `transitTime` DATETIME(3) NOT NULL,
    `transitDuration` INTEGER NOT NULL,
    `transitFlightNum` VARCHAR(191) NOT NULL,
    `transitFlightNum2` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`transitFlightNum`, `transitFlightNum2`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Aircraft` ADD CONSTRAINT `Aircraft_ownerAirlineCode_fkey` FOREIGN KEY (`ownerAirlineCode`) REFERENCES `Airline`(`airlineCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_uuid_fkey` FOREIGN KEY (`uuid`) REFERENCES `User`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingFlight` ADD CONSTRAINT `BookingFlight_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`bookingId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingFlight` ADD CONSTRAINT `BookingFlight_flightID_fkey` FOREIGN KEY (`flightID`) REFERENCES `Flight`(`flightID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_aircraftID_fkey` FOREIGN KEY (`aircraftID`) REFERENCES `Aircraft`(`aircraftID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_departAirportCode_fkey` FOREIGN KEY (`departAirportCode`) REFERENCES `Airport`(`airportCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_arriveAirportCode_fkey` FOREIGN KEY (`arriveAirportCode`) REFERENCES `Airport`(`airportCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_airlineCode_fkey` FOREIGN KEY (`airlineCode`) REFERENCES `Airline`(`airlineCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Passenger` ADD CONSTRAINT `Passenger_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `User`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PassengerBooking` ADD CONSTRAINT `PassengerBooking_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`bookingId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PassengerBooking` ADD CONSTRAINT `PassengerBooking_passportNum_fkey` FOREIGN KEY (`passportNum`) REFERENCES `Passenger`(`passportNum`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`bookingId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_flightID_fkey` FOREIGN KEY (`flightID`) REFERENCES `Flight`(`flightID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`bookingId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_flightID_fkey` FOREIGN KEY (`flightID`) REFERENCES `Flight`(`flightID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_passportNum_fkey` FOREIGN KEY (`passportNum`) REFERENCES `Passenger`(`passportNum`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_flightID_seatNum_fkey` FOREIGN KEY (`flightID`, `seatNum`) REFERENCES `Seat`(`flightID`, `seatNum`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transit` ADD CONSTRAINT `transit_transitFlightNum_fkey` FOREIGN KEY (`transitFlightNum`) REFERENCES `Flight`(`flightID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transit` ADD CONSTRAINT `transit_transitFlightNum2_fkey` FOREIGN KEY (`transitFlightNum2`) REFERENCES `Flight`(`flightID`) ON DELETE RESTRICT ON UPDATE CASCADE;
