
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jwt from 'jsonwebtoken';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function verifyJwt(token: string) {
  try {
    const secret = process.env.JWT_SECRET;
     if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    const decoded = jwt.verify(token, secret);
    return decoded as jwt.JwtPayload;
  } catch (error) {
    console.error("JWT Verification failed:", error);
    return null;
  }
}
