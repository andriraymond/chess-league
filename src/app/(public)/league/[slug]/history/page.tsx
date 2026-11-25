import { getLeagueBySlug } from "@/services/league.service";
import { getLeagueStatistics } from "@/services/standings.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMonth } from "@/lib/utils";

export default async function LeagueHistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);
  if (!league || league.status === "DRAFT") notFound();

  const stats = await getLeagueStatistics(league.id);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <Link href={`/league/${slug}`} className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← Kembali ke Klasemen
      </Link>

      <h1 className="text-2xl font-bold mb-2">Riwayat & Statistik — {league.name}</h1>
      <p className="text-muted-foreground mb-6">{formatMonth(league.month, league.year)}</p>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="border rounded-xl p-5 text-center">
          <div className="text-3xl font-bold">{stats.totalPlayers}</div>
          <div className="text-sm text-muted-foreground">Total Peserta</div>
        </div>
        <div className="border rounded-xl p-5 text-center">
          <div className="text-3xl font-bold">{stats.totalMatches}</div>
          <div className="text-sm text-muted-foreground">Pertandingan Selesai</div>
        </div>
        <div className="border rounded-xl p-5 text-center">
          <div className="text-3xl font-bold">{stats.totalDrawGames}</div>
          <div className="text-sm text-muted-foreground">Game Remis</div>
        </div>
        <div className="border rounded-xl p-5 text-center">
          {stats.topWinner ? (
            <>
              <div className="text-lg font-bold">🏆 {stats.topWinner.name}</div>
              <div className="text-sm text-muted-foreground">{stats.topWinner.count} kemenangan</div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-muted-foreground">—</div>
              <div className="text-sm text-muted-foreground">Top Winner</div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link href={`/league/${slug}`} className="border rounded-lg px-4 py-2 text-sm hover:border-primary transition">
          📊 Klasemen
        </Link>
        <Link href={`/league/${slug}/matches`} className="border rounded-lg px-4 py-2 text-sm hover:border-primary transition">
          ⚔️ Pertandingan
        </Link>
        <Link href={`/league/${slug}/players`} className="border rounded-lg px-4 py-2 text-sm hover:border-primary transition">
          👥 Pemain
        </Link>
      </div>
    </main>
  );
}
