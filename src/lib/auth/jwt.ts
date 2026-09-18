import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "rankquest-super-secret-jwt-key-jee-2026";
const COOKIE_NAME = "rankquest_token";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  isOnboarded: boolean;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;

    // Refresh isOnboarded status from DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, isOnboarded: true },
    });

    if (!user) return null;

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      isOnboarded: user.isOnboarded,
    };
  } catch (err) {
    return null;
  }
}
