/*
  Warnings:

  - The values [DATAENTRY] on the enum `Admin_permission` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `aircraft` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aircraftCCap` on the `aircraft` table. All the data in the column will be lost.
  - You are about to drop the column `aircraftFCap` on the `aircraft` table. All the data in the column will be lost.
  - You are about to drop the column `aircraftID` on the `aircraft` table. All the data in the column will be lost.
  - You are about to drop the column `aircraftModel` on the `aircraft` table. All the data in the column will be lost.
  - You are about to drop the column `aircraftWCap` on the `aircraft` table. All the data in the column will be lost.
  - You are about to drop the column `aircraftYCap` on the `aircraft` table. All the data in the column will be lost.
  - You are about to drop the column `airlineName` on the `airline` table. All the data in the column will be lost.
  - You are about to drop the column `airportAlt` on the `airport` table. All the data in the column will be lost.
  - You are about to drop the column `airportCity` on the `airport` table. All the data in the column will be lost.
  - You are about to drop the column `airportCountry` on the `airport` table. All the data in the column will be lost.
  - You are about to drop the column `airportLat` on the `airport` table. All the data in the column will be lost.
  - You are about to drop the column `airportLon` on the `airport` table. All the data in the column will be lost.
  - You are about to drop the column `airportName` on the `airport` table. All the data in the column will be lost.
  - You are about to drop the column `airportTimezone` on the `airport` table. All the data in the column will be lost.
  - You are about to drop the column `bookingStatus` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `numAdultPassenger` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `numChildrenPassenger` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `numInfantPassenger` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `booking` table. All the data in the column will be lost.
  - The primary key for the `bookingflight` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `flightID` on the `bookingflight` table. All the data in the column will be lost.
  - The primary key for the `flight` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aircraftID` on the `flight` table. All the data in the column will be lost.
  - You are about to drop the column `arriveAirportCode` on the `flight` table. All the data in the column will be lost.
  - You are about to drop the column `departAirportCode` on the `flight` table. All the data in the column will be lost.
  - You are about to drop the column `flightID` on the `flight` table. All the data in the column will be lost.
  - You are about to drop the column `DoB` on the `passenger` table. All the data in the column will be lost.
  - You are about to drop the column `passportExpireDate` on the `passenger` table. All the data in the column will be lost.
  - You are about to drop the column `userUuid` on the `passenger` table. All the data in the column will be lost.
  - The primary key for the `payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `paymentAmount` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentCode` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `payment` table. All the data in the column will be lost.
  - The primary key for the `seat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `feature` on the `seat` table. All the data in the column will be lost.
  - You are about to drop the column `flightID` on the `seat` table. All the data in the column will be lost.
  - You are about to drop the column `seatFloor` on the `seat` table. All the data in the column will be lost.
  - You are about to drop the column `seatRow` on the `seat` table. All the data in the column will be lost.
  - You are about to drop the column `flightID` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the column `ticketStatus` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `ticket` table. All the data in the column will be lost.
  - You are about to alter the column `farePackage` on the `ticket` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(4))`.
  - The primary key for the `transit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `transitAirport` on the `transit` table. All the data in the column will be lost.
  - You are about to drop the column `transitDuration` on the `transit` table. All the data in the column will be lost.
  - You are about to drop the column `transitFlightNum` on the `transit` table. All the data in the column will be lost.
  - You are about to drop the column `transitFlightNum2` on the `transit` table. All the data in the column will be lost.
  - You are about to drop the column `register_date` on the `user` table. All the data in the column will be lost.
  - Added the required column `aircraftId` to the `Aircraft` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessClassCap` to the `Aircraft` table without a default value. This is not possible if the table is not empty.
  - Added the required column `economyClassCap` to the `Aircraft` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstClassCap` to the `Aircraft` table without a default value. This is not possible if the table is not empty.
  - Added the required column `premiumClassCap` to the `Aircraft` table without a default value. This is not possible if the table is not empty.
  - Added the required column `altitude` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezone` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flightId` to the `BookingFlight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aircraftId` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arriveAirportId` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departAirportId` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - The required column `flightId` was added to the `Flight` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `paymentId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `features` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flightId` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floor` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `row` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flightId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketPrice` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `airportId` to the `Transit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Transit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flightFrom` to the `Transit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flightTo` to the `Transit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_uuid_fkey`;

-- DropForeignKey
ALTER TABLE `bookingflight` DROP FOREIGN KEY `BookingFlight_flightID_fkey`;

-- DropForeignKey
ALTER TABLE `flight` DROP FOREIGN KEY `Flight_aircraftID_fkey`;

-- DropForeignKey
ALTER TABLE `flight` DROP FOREIGN KEY `Flight_arriveAirportCode_fkey`;

-- DropForeignKey
ALTER TABLE `flight` DROP FOREIGN KEY `Flight_departAirportCode_fkey`;

-- DropForeignKey
ALTER TABLE `passenger` DROP FOREIGN KEY `Passenger_userUuid_fkey`;

-- DropForeignKey
ALTER TABLE `seat` DROP FOREIGN KEY `Seat_flightID_fkey`;

-- DropForeignKey
ALTER TABLE `ticket` DROP FOREIGN KEY `Ticket_flightID_fkey`;

-- DropForeignKey
ALTER TABLE `ticket` DROP FOREIGN KEY `Ticket_flightID_seatNum_fkey`;

-- DropForeignKey
ALTER TABLE `transit` DROP FOREIGN KEY `transit_transitFlightNum2_fkey`;

-- DropForeignKey
ALTER TABLE `transit` DROP FOREIGN KEY `transit_transitFlightNum_fkey`;

-- DropIndex
DROP INDEX `Booking_uuid_fkey` ON `booking`;

-- DropIndex
DROP INDEX `BookingFlight_flightID_fkey` ON `bookingflight`;

-- DropIndex
DROP INDEX `Flight_aircraftID_fkey` ON `flight`;

-- DropIndex
DROP INDEX `Flight_arriveAirportCode_fkey` ON `flight`;

-- DropIndex
DROP INDEX `Flight_departAirportCode_fkey` ON `flight`;

-- DropIndex
DROP INDEX `Passenger_userUuid_fkey` ON `passenger`;

-- DropIndex
DROP INDEX `Ticket_flightID_seatNum_fkey` ON `ticket`;

-- DropIndex
DROP INDEX `transit_transitFlightNum2_fkey` ON `transit`;

-- AlterTable
ALTER TABLE `admin` MODIFY `permission` ENUM('SUPER', 'DATA_ENTRY') NOT NULL;

-- AlterTable
ALTER TABLE `aircraft` DROP PRIMARY KEY,
    DROP COLUMN `aircraftCCap`,
    DROP COLUMN `aircraftFCap`,
    DROP COLUMN `aircraftID`,
    DROP COLUMN `aircraftModel`,
    DROP COLUMN `aircraftWCap`,
    DROP COLUMN `aircraftYCap`,
    ADD COLUMN `aircraftId` VARCHAR(191) NOT NULL,
    ADD COLUMN `businessClassCap` INTEGER NOT NULL,
    ADD COLUMN `economyClassCap` INTEGER NOT NULL,
    ADD COLUMN `firstClassCap` INTEGER NOT NULL,
    ADD COLUMN `model` VARCHAR(191) NULL,
    ADD COLUMN `premiumClassCap` INTEGER NOT NULL,
    ADD PRIMARY KEY (`aircraftId`);

-- AlterTable
ALTER TABLE `airline` DROP COLUMN `airlineName`,
    ADD COLUMN `name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `airport` DROP COLUMN `airportAlt`,
    DROP COLUMN `airportCity`,
    DROP COLUMN `airportCountry`,
    DROP COLUMN `airportLat`,
    DROP COLUMN `airportLon`,
    DROP COLUMN `airportName`,
    DROP COLUMN `airportTimezone`,
    ADD COLUMN `altitude` INTEGER NOT NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `country` VARCHAR(191) NOT NULL,
    ADD COLUMN `latitude` DOUBLE NOT NULL,
    ADD COLUMN `longitude` DOUBLE NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `timezone` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `booking` DROP COLUMN `bookingStatus`,
    DROP COLUMN `numAdultPassenger`,
    DROP COLUMN `numChildrenPassenger`,
    DROP COLUMN `numInfantPassenger`,
    DROP COLUMN `uuid`,
    ADD COLUMN `adultPassengers` INTEGER NULL,
    ADD COLUMN `childPassengers` INTEGER NULL,
    ADD COLUMN `infantPassengers` INTEGER NULL,
    ADD COLUMN `status` ENUM('PAID', 'UNPAID', 'CANCELLED') NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `bookingflight` DROP PRIMARY KEY,
    DROP COLUMN `flightID`,
    ADD COLUMN `flightId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`bookingId`, `flightId`);

-- AlterTable
ALTER TABLE `flight` DROP PRIMARY KEY,
    DROP COLUMN `aircraftID`,
    DROP COLUMN `arriveAirportCode`,
    DROP COLUMN `departAirportCode`,
    DROP COLUMN `flightID`,
    ADD COLUMN `aircraftId` VARCHAR(191) NOT NULL,
    ADD COLUMN `arriveAirportId` VARCHAR(191) NOT NULL,
    ADD COLUMN `departAirportId` VARCHAR(191) NOT NULL,
    ADD COLUMN `flightId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`flightId`);

-- AlterTable
ALTER TABLE `passenger` DROP COLUMN `DoB`,
    DROP COLUMN `passportExpireDate`,
    DROP COLUMN `userUuid`,
    ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
    ADD COLUMN `passportExpiry` DATETIME(3) NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `payment` DROP PRIMARY KEY,
    DROP COLUMN `paymentAmount`,
    DROP COLUMN `paymentCode`,
    DROP COLUMN `paymentMethod`,
    ADD COLUMN `amount` DOUBLE NULL,
    ADD COLUMN `method` VARCHAR(191) NULL,
    ADD COLUMN `paymentId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`paymentId`);

-- AlterTable
ALTER TABLE `seat` DROP PRIMARY KEY,
    DROP COLUMN `feature`,
    DROP COLUMN `flightID`,
    DROP COLUMN `seatFloor`,
    DROP COLUMN `seatRow`,
    ADD COLUMN `features` VARCHAR(191) NOT NULL,
    ADD COLUMN `flightId` VARCHAR(191) NOT NULL,
    ADD COLUMN `floor` INTEGER NOT NULL,
    ADD COLUMN `row` INTEGER NOT NULL,
    MODIFY `class` ENUM('F', 'C', 'Y', 'W') NOT NULL,
    ADD PRIMARY KEY (`flightId`, `seatNum`);

-- AlterTable
ALTER TABLE `ticket` DROP COLUMN `flightID`,
    DROP COLUMN `ticketStatus`,
    DROP COLUMN `totalPrice`,
    ADD COLUMN `flightId` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('PAID', 'CANCELLED') NOT NULL,
    ADD COLUMN `ticketPrice` DOUBLE NOT NULL,
    MODIFY `farePackage` ENUM('SUPER_SAVER', 'SAVER', 'STANDARD', 'FLEXI', 'FULL_FLEX') NULL;

-- AlterTable
ALTER TABLE `transit` DROP PRIMARY KEY,
    DROP COLUMN `transitAirport`,
    DROP COLUMN `transitDuration`,
    DROP COLUMN `transitFlightNum`,
    DROP COLUMN `transitFlightNum2`,
    ADD COLUMN `airportId` VARCHAR(191) NOT NULL,
    ADD COLUMN `duration` INTEGER NOT NULL,
    ADD COLUMN `flightFrom` VARCHAR(191) NOT NULL,
    ADD COLUMN `flightTo` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`flightFrom`, `flightTo`);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `register_date`,
    ADD COLUMN `registerDate` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingFlight` ADD CONSTRAINT `BookingFlight_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `Aircraft`(`aircraftId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_departAirportId_fkey` FOREIGN KEY (`departAirportId`) REFERENCES `Airport`(`airportCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_arriveAirportId_fkey` FOREIGN KEY (`arriveAirportId`) REFERENCES `Airport`(`airportCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Passenger` ADD CONSTRAINT `Passenger_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_flightId_seatNum_fkey` FOREIGN KEY (`flightId`, `seatNum`) REFERENCES `Seat`(`flightId`, `seatNum`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transit` ADD CONSTRAINT `Transit_flightFrom_fkey` FOREIGN KEY (`flightFrom`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transit` ADD CONSTRAINT `Transit_flightTo_fkey` FOREIGN KEY (`flightTo`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;
