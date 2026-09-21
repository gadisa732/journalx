import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatarUrl: true,
      tradingExperience: true,
      defaultCurrency: true,
      defaultRisk: true,
      timezone: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}