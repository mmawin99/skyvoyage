/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { UniversalFlightSchedule, UniversalFlightSegmentSchedule } from '@/types/type';
import { FlightOperationRow } from '@/types/booking';
import Stripe from 'stripe';
dotenv.config();
export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET) || (() => {
    throw new Error("JWT_SECRET is not defined in the environment variables");
})();

export async function hashDataWithSHA256AndSalt(data: string): Promise<string> {
    try {
      const sha256Hash = crypto.createHash('sha256').update(data).digest('hex');
  
      const salt = await bcrypt.genSalt(10);
  
      const finalHash = await bcrypt.hash(sha256Hash, salt);
  
      return finalHash;
    } catch (error) {
      console.error('Error hashing data:', error);
      throw error;
    }
  }

  export async function checkPasswordWithHash(password: string, storedHash: string): Promise<boolean> {
  try {
    const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
    const isMatch = await bcrypt.compare(sha256Hash, storedHash);
    return isMatch;
  } catch (error) {
    console.error('Error checking password:', error);
    throw error;
  }
}

export function sanitizeBigInt(obj: any): any {
  if (Array.isArray(obj)) {
      return obj.map(sanitizeBigInt);
  } else if (obj instanceof Date) {
      return obj; // ✅ Keep Date as-is
  } else if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
          const val = obj[key];
          newObj[key] =
              typeof val === 'bigint' ? val.toString() : sanitizeBigInt(val);
      }
      return newObj;
  }
  return obj;
}

export function getPreviousPeriod(startDate:string, endDate:string): { start: string; end: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate the difference in milliseconds
  const diff = end.getTime() - start.getTime();

  // Subtract the difference from both dates
  const newEnd = new Date(start.getTime());
  const newStart = new Date(start.getTime() - diff);

  // Format as YYYY-MM-DD
  const format = (d:Date) => d.toISOString();
  console.log("Start", startDate)
  console.log("New Start", format(newStart))
  console.log("End", endDate)
  console.log("New End", format(newEnd))
  return {
    start: format(newStart),
    end: format(newEnd),
  };
}


/**
 * Helper for parsing date ranges from query parameters
 * @param {Object} query - The query parameters
 * @param {string} defaultRange - Default time range if not specified
 * @returns {Object} Start and end date objects
 */
export function getDateRange(query: { range?: string }, defaultRange: string = '30d'): { start: string; end: string } {
  const range = query.range || defaultRange;
  // console.log("Range", range)
  let end = new Date();
  let start = new Date();

  // Parse time range
  if (range.endsWith('d')) {
    const days = parseInt(range.slice(0, -1));
    start.setDate(end.getDate() - days);
  } else if (range.endsWith('w')) {
    const weeks = parseInt(range.slice(0, -1));
    start.setDate(end.getDate() - (weeks * 7));
  } else if (range.endsWith('m')) {
    const months = parseInt(range.slice(0, -1));
    start.setMonth(end.getMonth() - months);
  } else if (range.endsWith('y')) {
    const years = parseInt(range.slice(0, -1));
    start.setFullYear(end.getFullYear() - years);
  } else {
    // Custom date range
    const dates = range.split(',');
    if (dates.length === 2) {
      start = new Date(dates[0]);
      end = new Date(dates[1]);
    }
  }
  // Set end time to the end of the day
  end.setUTCHours(0,0,0,0);
  // console.log("Start", start.toISOString())
  // console.log("End", end.toISOString())
  return { start:start.toISOString(), end:end.toISOString() };
}

/**
 * Helper to format time intervals for grouping in SQL queries
 * @param query - The query parameters
 * @param defaultInterval - Default interval if not specified
 * @returns SQL date format string
 */
export function getTimeInterval(query: { interval?: string }, defaultInterval: string = 'day'): string {
  const interval = query.interval || defaultInterval;
  
  switch (interval) {
    case 'hour':
      return '%Y-%m-%d %H:00:00';
    case 'day':
      return '%Y-%m-%d';
    case 'week':
      return '%Y-%u';
    case 'month':
      return '%Y-%m';
    case 'quarter':
      return 'CONCAT(YEAR(date), "-Q", QUARTER(date))';
    case 'year':
      return '%Y';
    default:
      return '%Y-%m-%d';
  }
}

// Helper function to create a UniversalFlightSchedule from flight operations
export function createUniversalFlightSchedule(flights: FlightOperationRow[]): UniversalFlightSchedule {
  // Generate a unique ID for this schedule
  const id = flights.map(f => f.flightId).join('-');
  
  // Calculate duration in minutes
  const startTime = new Date(flights[0].departureTime);
  const endTime = new Date(flights[flights.length - 1].arrivalTime);
  const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
  
  // Create segments
  const segments: UniversalFlightSegmentSchedule[] = flights.map(flight => ({
    flightId: flight.flightId,
    flightNum: flight.flightNum,
    airlineCode: flight.airlineCode,
    airlineName: flight.airlineName,
    departureTime: new Date(flight.departureTime).toISOString(),
    arrivalTime: new Date(flight.arrivalTime).toISOString(),
    aircraftModel: flight.aircraftModel,
    departureAirport: flight.departureAirportName,
    arrivalAirport: flight.arrivalAirportName,
    departTimezone: flight.departureAirportTimezone,
    arriveTimezone: flight.arrivalAirportTimezone
  }));
  
  return {
    id,
    price: {
      SUPER_SAVER: 0, // These values would need to be calculated based on your pricing logic
      SAVER: 0,
      STANDARD: 0,
      FLEXI: 0,
      FULL_FLEX: 0
    },
    duration: durationMinutes,
    stopCount: segments.length - 1,
    segments,
    departureAirport: flights[0].departureAirportName,
    arrivalAirport: flights[flights.length - 1].arrivalAirportName
  };
}

export const stripePayment = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil', // Use the latest API version
})
