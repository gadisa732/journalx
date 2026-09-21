import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { createSession } from "@/lib/auth/session";

const signupSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid signup data",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { firstName, lastName, email, password } = result.data;

    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        passwordHash,
        subscription: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}