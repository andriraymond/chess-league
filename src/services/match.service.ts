import "server-only";
import { prisma } from "@/lib/prisma";
import { GameResult, MatchStatus } from "@prisma/client";
import { createAuditLog } from "@/services/audit.service";

/**
 * Input satu game hasil dalam pertandingan BO3.
 */
export async function inputGameResult(
  matchId: string,
  result: GameResult,
  actorId: string,
  note?: string
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { round: { include: { league: true } } },
  });

  if (!match) throw new Error("Pertandingan tidak ditemukan.");
  if (match.status === MatchStatus.COMPLETED) {
    throw new Error("Pertandingan sudah selesai. Gunakan mekanisme koreksi jika diperlukan.");
  }
  if (match.status === MatchStatus.CANCELLED) {
    throw new Error("Pertandingan telah dibatalkan.");
  }
  if (!match.playerBId) {
    throw new Error("Pertandingan bye tidak memerlukan input hasil.");
  }

  const gameNumber = match.games.length + 1;
  const newGame = {
    gameNumber,
    result,
    playedAt: new Date(),
    note: note ?? null,
  };

  // Hitung skor baru
  let newScoreA = match.scoreA;
  let newScoreB = match.scoreB;

  if (result === GameResult.PLAYER_A) newScoreA += 1;
  else if (result === GameResult.PLAYER_B) newScoreB += 1;
  // DRAW tidak mengubah skor kemenangan

  // Cek apakah pertandingan sudah selesai (ada yang capai 2 kemenangan)
  let newStatus: MatchStatus = match.status === MatchStatus.SCHEDULED
    ? MatchStatus.IN_PROGRESS
    : match.status;
  let winnerPlayerId = match.winnerPlayerId;
  let completedAt = match.completedAt;

  if (newScoreA >= 2 || newScoreB >= 2) {
    newStatus = MatchStatus.COMPLETED;
    winnerPlayerId = newScoreA >= 2 ? match.playerAId : match.playerBId;
    completedAt = new Date();
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: {
      games: { push: newGame },
      scoreA: newScoreA,
      scoreB: newScoreB,
      status: newStatus,
      winnerPlayerId,
      completedAt,
    },
  });

  await createAuditLog({
    actorId,
    leagueId: match.round.leagueId,
    action: "INPUT_GAME_RESULT",
    entity: "Match",
    entityId: matchId,
    newData: {
      gameNumber,
      result,
      scoreA: newScoreA,
      scoreB: newScoreB,
      status: newStatus,
      winner: winnerPlayerId,
    },
  });

  return updated;
}

/**
 * Koreksi hasil pertandingan (hanya Super Admin atau Admin liga dengan otorisasi).
 */
export async function correctMatchResult(
  matchId: string,
  winnerPlayerId: string,
  reason: string,
  actorId: string
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { round: { include: { league: true } } },
  });

  if (!match) throw new Error("Pertandingan tidak ditemukan.");
  if (match.status !== MatchStatus.COMPLETED) {
    throw new Error("Hanya pertandingan yang sudah selesai yang dapat dikoreksi.");
  }
  if (winnerPlayerId !== match.playerAId && winnerPlayerId !== match.playerBId) {
    throw new Error("Pemenang harus salah satu dari kedua pemain.");
  }

  const oldData = {
    winnerPlayerId: match.winnerPlayerId,
    scoreA: match.scoreA,
    scoreB: match.scoreB,
  };

  const newScoreA = winnerPlayerId === match.playerAId ? 2 : 0;
  const newScoreB = winnerPlayerId === match.playerBId ? 2 : 0;

  const corrected = await prisma.match.update({
    where: { id: matchId },
    data: { winnerPlayerId, scoreA: newScoreA, scoreB: newScoreB },
  });

  await createAuditLog({
    actorId,
    leagueId: match.round.leagueId,
    action: "CORRECT_MATCH",
    entity: "Match",
    entityId: matchId,
    oldData,
    newData: { winnerPlayerId, scoreA: newScoreA, scoreB: newScoreB },
    reason,
  });

  return corrected;
}

export async function getMatchById(matchId: string) {
  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      playerA: true,
      playerB: true,
      winner: true,
      round: { include: { league: true } },
    },
  });
}

export async function getMatchesByLeague(leagueId: string) {
  return prisma.match.findMany({
    where: { round: { leagueId } },
    include: { playerA: true, playerB: true, winner: true, round: true },
    orderBy: { createdAt: "asc" },
  });
}
