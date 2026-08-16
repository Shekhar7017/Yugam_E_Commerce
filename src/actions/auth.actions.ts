"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function registerUser(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "An account with this email already exists" };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, phone, password: hashed } });

  return { success: true };
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not signed in" };

  if (newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters" };
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) return { success: false, error: "Account not found" };

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { success: false, error: "Current password is incorrect" };

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return { success: true };
}