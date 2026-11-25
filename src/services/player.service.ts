import "server-only";
import { prisma } from "@/lib/prisma";
import { PlayerStatus, LeaguePlayerStatus } from "@prisma/client";
import { createAuditLog } from "@/services/audit.service";

export async function getAllPlayers() {
  return prisma.player.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { leaguePlayers: true, matchesAsA: true, matchesAsB: true } },
    },
  });
}

export async function getPlayerById(id: string) {
  return prisma.player.findUnique({
    where: { id },
    include: {
      leaguePlayers: { include: { league: true } },
      matchesAsA: { include: { playerB: true, winner: true, round: { include: { league: true } } } },
      matchesAsB: { include: { playerA: true, winner: true, round: { include: { league: true } } } },
    },
  });
}

export async function createPlayer(
  data: { name: string; email?: string },
  actorId: string,
  leagueId: string
) {
  const player = await prisma.player.create({
    data: {
      name: data.name,
      email: data.email || undefined,
    },
  });

  // Langsung daftarkan ke liga & catat audit log secara paralel
  await Promise.all([
    prisma.leaguePlayer.create({
      data: { leagueId, playerId: player.id },
    }),
    createAuditLog({
      actorId,
      leagueId,
      action: "CREATE_PLAYER",
      entity: "Player",
      entityId: player.id,
      newData: { name: data.name, email: data.email, leagueId },
    }),
  ]);

  return player;
}

export async function addExistingPlayerToLeague(
  playerId: string,
  leagueId: string,
  actorId: string
) {
  const lp = await prisma.leaguePlayer.upsert({
    where: { leagueId_playerId: { leagueId, playerId } },
    create: { leagueId, playerId },
    update: { status: LeaguePlayerStatus.ACTIVE },
  });

  await createAuditLog({
    actorId,
    leagueId,
    action: "ADD_PLAYER_TO_LEAGUE",
    entity: "LeaguePlayer",
    entityId: lp.id,
    newData: { playerId, leagueId },
  });

  return lp;
}

export async function deactivatePlayerInLeague(
  playerId: string,
  leagueId: string,
  actorId: string
) {
  const lp = await prisma.leaguePlayer.update({
    where: { leagueId_playerId: { leagueId, playerId } },
    data: { status: LeaguePlayerStatus.INACTIVE },
  });

  await createAuditLog({
    actorId,
    leagueId,
    action: "DEACTIVATE_PLAYER",
    entity: "LeaguePlayer",
    entityId: lp.id,
    oldData: { status: "ACTIVE" },
    newData: { status: "INACTIVE" },
  });

  return lp;
}

export async function updatePlayerName(
  playerId: string,
  name: string,
  actorId: string
) {
  const old = await prisma.player.findUnique({ where: { id: playerId } });

  const updated = await prisma.player.update({
    where: { id: playerId },
    data: { name },
  });

  await createAuditLog({
    actorId,
    action: "UPDATE_PLAYER",
    entity: "Player",
    entityId: playerId,
    oldData: { name: old?.name },
    newData: { name },
  });

  return updated;
}

/**
 * Hapus pemain dari liga (hanya jika belum memiliki riwayat pertandingan di liga ini).
 */
export async function removePlayerFromLeague(
  playerId: string,
  leagueId: string,
  actorId: string
) {
  const hasMatches = await prisma.match.findFirst({
    where: {
      round: { leagueId },
      OR: [{ playerAId: playerId }, { playerBId: playerId }],
    },
    select: { id: true },
  });

  if (hasMatches) {
    throw new Error(
      "Pemain sudah memiliki riwayat pertandingan di liga ini. Gunakan Nonaktifkan."
    );
  }

  await prisma.leaguePlayer.delete({
    where: { leagueId_playerId: { leagueId, playerId } },
  });

  void createAuditLog({
    actorId,
    leagueId,
    action: "REMOVE_PLAYER_FROM_LEAGUE",
    entity: "LeaguePlayer",
    entityId: `${leagueId}:${playerId}`,
    oldData: { playerId, leagueId },
  });
}
