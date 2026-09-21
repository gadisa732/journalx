import { NextResponse } from "next/server";

import { destroySession } from "@/lib/auth/session";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}