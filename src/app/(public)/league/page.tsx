import { getPublicLeagues } from "@/services/league.service";
import { formatMonth } from "@/lib/utils";
import Link from "next/link";

export default async function LeagueListPage() {
  const leagues = await getPublicLeagues();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
          ← Beranda
        </Link>
        <h1 className="text-2xl font-bold">Semua Liga</h1>
      </div>

      {leagues.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-5xl mb-4">🏆</div>
          <p>Belum ada liga yang dipublikasikan.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/league/${league.slug}`}
              className="border rounded-xl p-6 hover:border-primary transition group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold group-hover:text-primary transition">{league.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  league.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                  league.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {league.status === "ACTIVE" ? "Berlangsung" : league.status === "COMPLETED" ? "Selesai" : "Arsip"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{formatMonth(league.month, league.year)}</p>
              <p className="text-sm text-muted-foreground mt-1">{league.players.length} peserta</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
