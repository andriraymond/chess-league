import "server-only";
import { prisma } from "@/lib/prisma";
import { MatchStatus } from "@prisma/client";

export type StandingEntry = {
  rank: number;
  player: { id: string; name: string };
  played: number;
  won: number;
  lost: number;
  points: number;
  bye: number;
};

/**
 * Hitung klasemen liga.
 * Urutan: Poin → Head-to-Head → Mini-table → Playoff (manual).
 */
export async function calculateStandings(leagueId: string): Promise<StandingEntry[]> {
  const [leaguePlayers, completedMatches, byeMatches] = await Promise.all([
    prisma.leaguePlayer.findMany({
      where: { leagueId },
      include: { player: true },
    }),
    prisma.match.findMany({
      where: {
        round: { leagueId },
        status: MatchStatus.COMPLETED,
      },
      include: { playerA: true, playerB: true },
    }),
    prisma.match.findMany({
      where: {
        round: { leagueId },
        playerBId: null,
      },
      select: { playerAId: true },
    }),
  ]);

  // Inisialisasi stats
  const stats: Record<string, { played: number; won: number; lost: number; bye: number }> = {};

  for (const lp of leaguePlayers) {
    stats[lp.playerId] = { played: 0, won: 0, lost: 0, bye: 0 };
  }

  // Hitung dari match selesai
  for (const match of completedMatches) {
    if (!match.playerAId || !match.playerBId) continue;

    if (stats[match.playerAId]) {
      stats[match.playerAId].played += 1;
      if (match.winnerPlayerId === match.playerAId) {
        stats[match.playerAId].won += 1;
      } else {
        stats[match.playerAId].lost += 1;
      }
    }

    if (stats[match.playerBId]) {
      stats[match.playerBId].played += 1;
      if (match.winnerPlayerId === match.playerBId) {
        stats[match.playerBId].won += 1;
      } else {
        stats[match.playerBId].lost += 1;
      }
    }
  }

  // Hitung bye
  for (const bye of byeMatches) {
    if (bye.playerAId && stats[bye.playerAId]) {
      stats[bye.playerAId].bye += 1;
    }
  }

  // Build standings array
  const entries: (Omit<StandingEntry, "rank">)[] = leaguePlayers.map((lp) => {
    const s = stats[lp.playerId] ?? { played: 0, won: 0, lost: 0, bye: 0 };
    return {
      player: { id: lp.playerId, name: lp.player.name },
      played: s.played,
      won: s.won,
      lost: s.lost,
      points: s.won * 2,
      bye: s.bye,
    };
  });

  // Sort: Poin DESC, lalu head-to-head (simplified: won DESC)
  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    // Head-to-head tiebreaker
    const h2h = getHeadToHead(a.player.id, b.player.id, completedMatches);
    if (h2h !== 0) return h2h;

    return b.won - a.won;
  });

  // Assign rank
  return entries.map((entry, idx) => ({ rank: idx + 1, ...entry }));
}

function getHeadToHead(
  playerAId: string,
  playerBId: string,
  matches: Array<{ playerAId: string | null; playerBId: string | null; winnerPlayerId: string | null }>
): number {
  let aWins = 0;
  let bWins = 0;

  for (const match of matches) {
    const involves =
      (match.playerAId === playerAId && match.playerBId === playerBId) ||
      (match.playerAId === playerBId && match.playerBId === playerAId);

    if (!involves) continue;

    if (match.winnerPlayerId === playerAId) aWins++;
    else if (match.winnerPlayerId === playerBId) bWins++;
  }

  if (aWins > bWins) return -1; // A lebih tinggi
  if (bWins > aWins) return 1;  // B lebih tinggi
  return 0;
}

/**
 * Statistik agregat liga.
 */
export async function getLeagueStatistics(leagueId: string) {
  const [totalPlayers, completedMatches, drawGames] = await Promise.all([
    prisma.leaguePlayer.count({ where: { leagueId } }),
    prisma.match.findMany({
      where: { round: { leagueId }, status: MatchStatus.COMPLETED },
      include: { playerA: true, playerB: true, winner: true },
    }),
    prisma.match.findMany({
      where: { round: { leagueId } },
      select: { games: true },
    }),
  ]);

  const totalDraws = drawGames.flatMap((m) => m.games).filter((g) => g.result === "DRAW").length;

  // Pemain dengan kemenangan terbanyak
  const winCounts: Record<string, { name: string; count: number }> = {};
  for (const match of completedMatches) {
    if (match.winnerPlayerId && match.winner) {
      if (!winCounts[match.winnerPlayerId]) {
        winCounts[match.winnerPlayerId] = { name: match.winner.name, count: 0 };
      }
      winCounts[match.winnerPlayerId].count += 1;
    }
  }

  const topWinner = Object.values(winCounts).sort((a, b) => b.count - a.count)[0] ?? null;

  return {
    totalPlayers,
    totalMatches: completedMatches.length,
    totalDrawGames: totalDraws,
    topWinner,
  };
}
