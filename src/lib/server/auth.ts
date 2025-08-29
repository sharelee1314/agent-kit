import bcrypt from 'bcryptjs'
import {SignJWT, jwtVerify} from 'jose'

export interface JWTPayload {
  password: string
  userName: string
  [key: string]: any
}


export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const secret = new TextEncoder().encode(JWT_SECRET)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({alg: 'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const {payload} = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}