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