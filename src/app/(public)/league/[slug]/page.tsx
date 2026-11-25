import { getLeagueBySlug } from "@/services/league.service";
import { calculateStandings } from "@/services/standings.service";
import { formatMonth, formatDate } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function LeagueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);

  if (!league || league.status === "DRAFT") notFound();

  const standings = await calculateStandings(league.id);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/league" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← Semua Liga
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">{league.name}</h1>
            <p className="text-muted-foreground">{formatMonth(league.month, league.year)}</p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            league.status === "ACTIVE" ? "bg-green-100 text-green-700" :
            league.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
          }`}>
            {league.status === "ACTIVE" ? "Berlangsung" : league.status === "COMPLETED" ? "Selesai" : "Arsip"}
          </span>
        </div>
        {league.description && (
          <p className="text-muted-foreground mt-3">{league.description}</p>
        )}
      </div>

      {/* Nav tabs */}
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {[
          { href: `/league/${slug}`, label: "Klasemen" },
          { href: `/league/${slug}/players`, label: "Pemain" },
          { href: `/league/${slug}/matches`, label: "Pertandingan" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap border-b-2 border-transparent hover:border-primary transition"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Standings Table */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Klasemen</h2>
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-12">#</th>
                <th className="text-left px-4 py-3 font-medium">Pemain</th>
                <th className="text-center px-3 py-3 font-medium">Main</th>
                <th className="text-center px-3 py-3 font-medium">Menang</th>
                <th className="text-center px-3 py-3 font-medium">Kalah</th>
                <th className="text-center px-3 py-3 font-medium">Poin</th>
                <th className="text-center px-3 py-3 font-medium">Bye</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {standings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Belum ada pertandingan selesai.
                  </td>
                </tr>
              ) : (
                standings.map((entry) => (
                  <tr key={entry.player.id} className={entry.rank <= 3 ? "font-medium" : ""}>
                    <td className="px-4 py-3 text-muted-foreground">
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                    </td>
                    <td className="px-4 py-3">{entry.player.name}</td>
                    <td className="px-3 py-3 text-center">{entry.played}</td>
                    <td className="px-3 py-3 text-center text-green-600">{entry.won}</td>
                    <td className="px-3 py-3 text-center text-red-500">{entry.lost}</td>
                    <td className="px-3 py-3 text-center font-bold">{entry.points}</td>
                    <td className="px-3 py-3 text-center text-muted-foreground">{entry.bye}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
