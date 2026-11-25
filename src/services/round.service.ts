import "server-only";
import { prisma } from "@/lib/prisma";
import { RoundStatus, MatchStatus } from "@prisma/client";
import { createAuditLog } from "@/services/audit.service";
import { generatePairing } from "@/services/pairing.service";

/**
 * Generate ronde baru untuk liga.
 * Ronde dalam status DRAFT sampai admin konfirmasi.
 */
export async function generateRound(leagueId: string, actorId: string) {
  // Ambil semua pemain aktif di liga
  const leaguePlayers = await prisma.leaguePlayer.findMany({
    where: { leagueId, status: "ACTIVE" },
    include: { player: true },
  });

  if (leaguePlayers.length < 2) {
    throw new Error("Minimal 2 pemain aktif diperlukan untuk membuat ronde.");
  }

  // Ambil riwayat semua pertandingan yang sudah selesai di liga ini
  const history = await prisma.match.findMany({
    where: {
      round: { leagueId },
      status: MatchStatus.COMPLETED,
    },
    select: { playerAId: true, playerBId: true },
  });

  // Ambil bye history
  const byeHistory = await prisma.match.findMany({
    where: {
      round: { leagueId },
      playerBId: null, // bye = playerB null
    },
    select: { playerAId: true },
  });

  const playerIds = leaguePlayers.map((lp) => lp.playerId);
  const byeCount: Record<string, number> = {};
  playerIds.forEach((id) => (byeCount[id] = 0));
  byeHistory.forEach((m) => {
    if (m.playerAId) byeCount[m.playerAId] = (byeCount[m.playerAId] ?? 0) + 1;
  });

  // Hitung frekuensi pertemuan
  const meetingCount: Record<string, Record<string, number>> = {};
  playerIds.forEach((a) => {
    meetingCount[a] = {};
    playerIds.forEach((b) => {
      meetingCount[a][b] = 0;
    });
  });
  history.forEach((m) => {
    if (m.playerAId && m.playerBId) {
      meetingCount[m.playerAId][m.playerBId] =
        (meetingCount[m.playerAId][m.playerBId] ?? 0) + 1;
      meetingCount[m.playerBId][m.playerAId] =
        (meetingCount[m.playerBId][m.playerAId] ?? 0) + 1;
    }
  });

  // Jalankan algoritma pairing
  const { pairs, bye } = generatePairing(playerIds, meetingCount, byeCount);

  // Hitung nomor ronde berikutnya
  const lastRound = await prisma.round.findFirst({
    where: { leagueId },
    orderBy: { roundNumber: "desc" },
  });
  const roundNumber = (lastRound?.roundNumber ?? 0) + 1;

  // Buat ronde dan match dalam satu transaksi
  const round = await prisma.$transaction(async (tx) => {
    const newRound = await tx.round.create({
      data: { leagueId, roundNumber, status: RoundStatus.DRAFT },
    });

    // Buat match untuk setiap pasangan
    for (const [aId, bId] of pairs) {
      await tx.match.create({
        data: {
          roundId: newRound.id,
          playerAId: aId,
          playerBId: bId,
          status: MatchStatus.SCHEDULED,
        },
      });
    }

    // Buat entry bye jika ada
    if (bye) {
      await tx.match.create({
        data: {
          roundId: newRound.id,
          playerAId: bye,
          playerBId: null, // null = bye
          status: MatchStatus.SCHEDULED,
        },
      });
    }

    return newRound;
  });

  await createAuditLog({
    actorId,
    leagueId,
    action: "GENERATE_ROUND",
    entity: "Round",
    entityId: round.id,
    newData: { roundNumber, pairs, bye },
  });

  return round;
}

/**
 * Konfirmasi ronde (ubah status dari DRAFT ke PUBLISHED).
 */
export async function confirmRound(roundId: string, actorId: string) {
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { league: true },
  });

  if (!round) throw new Error("Ronde tidak ditemukan.");
  if (round.status !== RoundStatus.DRAFT) {
    throw new Error("Hanya ronde berstatus DRAFT yang dapat dikonfirmasi.");
  }

  const confirmed = await prisma.round.update({
    where: { id: roundId },
    data: { status: RoundStatus.PUBLISHED, publishedAt: new Date() },
  });

  await createAuditLog({
    actorId,
    leagueId: round.leagueId,
    action: "CONFIRM_ROUND",
    entity: "Round",
    entityId: roundId,
    oldData: { status: "DRAFT" },
    newData: { status: "PUBLISHED" },
  });

  return confirmed;
}

/**
 * Hapus ronde DRAFT (untuk regenerate).
 */
export async function deleteDraftRound(roundId: string, actorId: string) {
  const round = await prisma.round.findUnique({ where: { id: roundId } });

  if (!round) throw new Error("Ronde tidak ditemukan.");
  if (round.status !== RoundStatus.DRAFT) {
    throw new Error("Hanya ronde DRAFT yang dapat dihapus.");
  }

  await prisma.$transaction([
    prisma.match.deleteMany({ where: { roundId } }),
    prisma.round.delete({ where: { id: roundId } }),
  ]);

  await createAuditLog({
    actorId,
    leagueId: round.leagueId,
    action: "DELETE_DRAFT_ROUND",
    entity: "Round",
    entityId: roundId,
  });
}

/**
 * Hapus ronde (beserta semua pertandingan di dalamnya).
 */
export async function deleteRound(roundId: string, actorId: string) {
  const round = await prisma.round.findUnique({ where: { id: roundId } });

  if (!round) throw new Error("Ronde tidak ditemukan.");

  await prisma.$transaction([
    prisma.match.deleteMany({ where: { roundId } }),
    prisma.round.delete({ where: { id: roundId } }),
  ]);

  await createAuditLog({
    actorId,
    leagueId: round.leagueId,
    action: "DELETE_ROUND",
    entity: "Round",
    entityId: roundId,
    oldData: { roundNumber: round.roundNumber, status: round.status },
  });
}

export async function getRoundWithMatches(roundId: string) {
  return prisma.round.findUnique({
    where: { id: roundId },
    include: {
      matches: {
        include: { playerA: true, playerB: true, winner: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
