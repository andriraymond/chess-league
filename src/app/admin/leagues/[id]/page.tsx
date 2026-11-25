import { requireLeagueAdmin } from "@/lib/permissions";
import { getLeagueById } from "@/services/league.service";
import { calculateStandings } from "@/services/standings.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMonth } from "@/lib/utils";

export default async function AdminLeagueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireLeagueAdmin(id);
  const league = await getLeagueById(id);

  if (!league) notFound();

  const standings = await calculateStandings(id);

  const totalRounds = league.rounds.length;
  const publishedRounds = league.rounds.filter((r) => r.status !== "DRAFT").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/admin/leagues" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← Kembali
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{league.name}</h1>
          <p className="text-muted-foreground">{formatMonth(league.month, league.year)}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/admin/leagues/${id}/players`} className="border px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition">
            👥 Peserta
          </Link>
          <Link href={`/admin/leagues/${id}/pairing`} className="border px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition">
            🎲 Pairing
          </Link>
          <Link href={`/admin/leagues/${id}/matches`} className="border px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition">
            ⚔️ Pertandingan
          </Link>
          <Link href={`/admin/leagues/${id}/settings`} className="border px-4 py-2 rounded-lg text-sm font-medium hover:border-primary transition">
            ⚙️ Pengaturan
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="border rounded-xl p-5">
          <div className="text-2xl font-bold">{league.players.length}</div>
          <div className="text-sm text-muted-foreground">Peserta</div>
        </div>
        <div className="border rounded-xl p-5">
          <div className="text-2xl font-bold">{totalRounds}</div>
          <div className="text-sm text-muted-foreground">Total Ronde</div>
        </div>
        <div className="border rounded-xl p-5">
          <div className="text-2xl font-bold">{publishedRounds}</div>
          <div className="text-sm text-muted-foreground">Ronde Dikonfirmasi</div>
        </div>
        <div className="border rounded-xl p-5">
          <div className="text-2xl font-bold">{league.targetMatchesPerPlayer}</div>
          <div className="text-sm text-muted-foreground">Target Match/Pemain</div>
        </div>
      </div>

      {/* Standings preview */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Klasemen Saat Ini</h2>
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">Pemain</th>
                <th className="text-center px-3 py-3 font-medium">Main</th>
                <th className="text-center px-3 py-3 font-medium">W</th>
                <th className="text-center px-3 py-3 font-medium">L</th>
                <th className="text-center px-3 py-3 font-medium">Poin</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {standings.map((entry) => (
                <tr key={entry.player.id}>
                  <td className="px-4 py-3 text-muted-foreground">{entry.rank}</td>
                  <td className="px-4 py-3 font-medium">{entry.player.name}</td>
                  <td className="px-3 py-3 text-center">{entry.played}</td>
                  <td className="px-3 py-3 text-center text-green-600">{entry.won}</td>
                  <td className="px-3 py-3 text-center text-red-500">{entry.lost}</td>
                  <td className="px-3 py-3 text-center font-bold">{entry.points}</td>
                </tr>
              ))}
              {standings.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Belum ada pertandingan selesai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
