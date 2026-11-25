import "server-only";
import { prisma } from "@/lib/prisma";
import { LeagueStatus, Prisma } from "@prisma/client";
import { slugify } from "@/lib/utils";
import { createAuditLog } from "@/services/audit.service";

export async function getPublicLeagues() {
  return prisma.league.findMany({
    where: {
      status: { in: [LeagueStatus.ACTIVE, LeagueStatus.COMPLETED, LeagueStatus.ARCHIVED] },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { players: { include: { player: true } } },
  });
}

export async function getLeagueBySlug(slug: string) {
  return prisma.league.findUnique({
    where: { slug },
    include: {
      admins: { include: { user: { select: { id: true, name: true, email: true } } } },
      players: { include: { player: true } },
      rounds: { orderBy: { roundNumber: "asc" } },
    },
  });
}

export async function getLeagueById(id: string) {
  return prisma.league.findUnique({
    where: { id },
    include: {
      admins: { include: { user: { select: { id: true, name: true, email: true } } } },
      players: { include: { player: true } },
      rounds: {
        orderBy: { roundNumber: "asc" },
        include: { matches: { include: { playerA: true, playerB: true, winner: true } } },
      },
    },
  });
}

export async function getAllLeagues() {
  return prisma.league.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      _count: { select: { players: true, rounds: true } },
    },
  });
}

export async function createLeague(
  data: {
    name: string;
    description?: string;
    month: number;
    year: number;
    targetMatchesPerPlayer?: number;
    startDate?: string;
    endDate?: string;
  },
  actorId: string
) {
  const slug = slugify(`${data.name}-${data.month}-${data.year}`);

  const league = await prisma.league.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      month: data.month,
      year: data.year,
      targetMatchesPerPlayer: data.targetMatchesPerPlayer ?? 8,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });

  await createAuditLog({
    actorId,
    leagueId: league.id,
    action: "CREATE_LEAGUE",
    entity: "League",
    entityId: league.id,
    newData: league,
  });

  return league;
}

export async function updateLeagueStatus(
  leagueId: string,
  status: LeagueStatus,
  actorId: string
) {
  const old = await prisma.league.findUnique({ where: { id: leagueId } });

  const updated = await prisma.league.update({
    where: { id: leagueId },
    data: { status },
  });

  await createAuditLog({
    actorId,
    leagueId,
    action: "UPDATE_LEAGUE_STATUS",
    entity: "League",
    entityId: leagueId,
    oldData: { status: old?.status },
    newData: { status },
  });

  return updated;
}

export async function assignAdminToLeague(leagueId: string, userId: string, actorId: string) {
  const assignment = await prisma.leagueAdmin.upsert({
    where: { leagueId_userId: { leagueId, userId } },
    create: { leagueId, userId },
    update: {},
  });

  await createAuditLog({
    actorId,
    leagueId,
    action: "ASSIGN_ADMIN",
    entity: "LeagueAdmin",
    entityId: assignment.id,
    newData: { userId, leagueId },
  });

  return assignment;
}
