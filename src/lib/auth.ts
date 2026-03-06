import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/db";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashStr: string): Promise<boolean> {
  return compare(password, hashStr);
}

export function userToJson(u: { id: string; email: string; name: string | null; phone: string | null; isAdmin?: boolean; isSeller?: boolean }) {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? undefined,
    phone: u.phone ?? undefined,
    isAdmin: u.isAdmin === true,
    isSeller: (u as { isSeller?: boolean }).isSeller === true,
  };
}

export function adminToJson(a: { id: string; email: string; name: string | null }) {
  return {
    id: a.id,
    email: a.email,
    name: a.name ?? undefined,
    phone: undefined,
    isAdmin: true,
  };
}
