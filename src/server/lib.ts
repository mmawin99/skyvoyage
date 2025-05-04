/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
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


/**
 * Helper for parsing date ranges from query parameters
 * @param {Object} query - The query parameters
 * @param {string} defaultRange - Default time range if not specified
 * @returns {Object} Start and end date objects
 */
export function getDateRange(query: { range?: string }, defaultRange: string = '30d'): { start: string; end: string } {
  const range = query.range || defaultRange;
  console.log("Range", range)
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
  end.setHours(23, 59, 59, 999);
  console.log("Start", start.toISOString())
  console.log("End", end.toISOString())
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