import { UserRole, UserStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
};

/**
 * Ambil session user dari server component / server action.
 * Throw redirect ke /auth/login jika belum login.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }
  return session.user as unknown as SessionUser;
}

/**
 * Pastikan user adalah Super Admin.
 */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== UserRole.SUPER_ADMIN) {
    redirect("/admin");
  }
  return user;
}

/**
 * Pastikan user adalah Admin (atau Super Admin) dengan status APPROVED.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.status !== UserStatus.APPROVED) {
    redirect("/auth/pending");
  }
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    redirect("/");
  }
  return user;
}

/**
 * Periksa apakah user adalah admin dari liga tertentu (atau Super Admin).
 */
export async function requireLeagueAdmin(leagueId: string): Promise<SessionUser> {
  const { prisma } = await import("@/lib/prisma");
  const user = await requireAdmin();

  if (user.role === UserRole.SUPER_ADMIN) return user;

  const assignment = await prisma.leagueAdmin.findFirst({
    where: { leagueId, userId: user.id },
  });

  if (!assignment) {
    redirect("/admin");
  }

  return user;
}

export function isSuperAdmin(user: SessionUser): boolean {
  return user.role === UserRole.SUPER_ADMIN;
}

export function isApprovedAdmin(user: SessionUser): boolean {
  return user.status === UserStatus.APPROVED;
}
