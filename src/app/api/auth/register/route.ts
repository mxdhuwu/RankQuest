import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user: isOnboarded is strictly false
    const newUser = await prisma.user.create({
      data: {
        email: trimmedEmail,
        passwordHash,
        name: name.trim(),
        isOnboarded: false,
      },
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      isOnboarded: false,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isOnboarded: false,
      },
      redirectTo: "/diagnostic",
    });

    res.cookies.set("rankquest_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
