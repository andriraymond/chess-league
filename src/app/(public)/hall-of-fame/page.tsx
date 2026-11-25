import { prisma } from "@/lib/prisma";
import { LeagueStatus, MatchStatus } from "@prisma/client";
import { formatMonth } from "@/lib/utils";
import Link from "next/link";

export default async function HallOfFamePage() {
  // Ambil semua liga yang sudah selesai
  const completedLeagues = await prisma.league.findMany({
    where: { status: { in: [LeagueStatus.COMPLETED, LeagueStatus.ARCHIVED] } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Untuk setiap liga, cari pemenang (player dengan win terbanyak)
  const champions: {
    league: typeof completedLeagues[0];
    champion: { name: string; id: string; wins: number } | null;
    runnerUp: { name: string; id: string; wins: number } | null;
  }[] = [];

  for (const league of completedLeagues) {
    const matches = await prisma.match.findMany({
      where: { round: { leagueId: league.id }, status: MatchStatus.COMPLETED },
      include: { winner: true },
    });

    const wins: Record<string, { name: string; count: number }> = {};
    for (const m of matches) {
      if (m.winnerPlayerId && m.winner) {
        if (!wins[m.winnerPlayerId]) {
          wins[m.winnerPlayerId] = { name: m.winner.name, count: 0 };
        }
        wins[m.winnerPlayerId].count += 1;
      }
    }

    const sorted = Object.entries(wins)
      .map(([id, data]) => ({ id, name: data.name, wins: data.count }))
      .sort((a, b) => b.wins - a.wins);

    champions.push({
      league,
      champion: sorted[0] ?? null,
      runnerUp: sorted[1] ?? null,
    });
  }

  // Hitung jumlah gelar per pemain
  const titleCounts: Record<string, { name: string; titles: number; runnerUps: number }> = {};
  for (const c of champions) {
    if (c.champion) {
      if (!titleCounts[c.champion.id]) titleCounts[c.champion.id] = { name: c.champion.name, titles: 0, runnerUps: 0 };
      titleCounts[c.champion.id].titles += 1;
    }
    if (c.runnerUp) {
      if (!titleCounts[c.runnerUp.id]) titleCounts[c.runnerUp.id] = { name: c.runnerUp.name, titles: 0, runnerUps: 0 };
      titleCounts[c.runnerUp.id].runnerUps += 1;
    }
  }
  const hallOfFameEntries = Object.entries(titleCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.titles - a.titles || b.runnerUps - a.runnerUps);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">🏆 Hall of Fame</h1>
      <p className="text-muted-foreground mb-8">Juara liga bulanan dan rekor pencapaian pemain.</p>

      {/* Statistik karier */}
      {hallOfFameEntries.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">👑 Statistik Karier</h2>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">Pemain</th>
                  <th className="text-center px-4 py-3 font-medium">🥇 Gelar</th>
                  <th className="text-center px-4 py-3 font-medium">🥈 Runner-up</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {hallOfFameEntries.map((entry, idx) => (
                  <tr key={entry.id} className={idx === 0 ? "bg-yellow-50/50 font-medium" : "hover:bg-muted/30"}>
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {idx === 0 && "👑 "}{entry.name}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-yellow-600">{entry.titles}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{entry.runnerUps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Juara per liga */}
      <section>
        <h2 className="text-xl font-semibold mb-4">📅 Juara per Liga</h2>
        {champions.length === 0 ? (
          <div className="border rounded-xl p-8 text-center text-muted-foreground">
            <div className="text-5xl mb-4">🏆</div>
            <p>Belum ada liga yang selesai.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {champions.map((c) => (
              <Link
                key={c.league.id}
                href={`/league/${c.league.slug}`}
                className="border rounded-xl p-5 flex items-center justify-between hover:border-primary transition group block"
              >
                <div>
                  <div className="font-semibold group-hover:text-primary transition">{c.league.name}</div>
                  <div className="text-sm text-muted-foreground">{formatMonth(c.league.month, c.league.year)}</div>
                </div>
                <div className="text-right">
                  {c.champion ? (
                    <>
                      <div className="font-semibold">🥇 {c.champion.name}</div>
                      {c.runnerUp && (
                        <div className="text-sm text-muted-foreground">🥈 {c.runnerUp.name}</div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Belum ada data</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
