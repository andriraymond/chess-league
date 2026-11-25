import Link from "next/link";
import { getPublicLeagues } from "@/services/league.service";
import { formatMonth } from "@/lib/utils";

export default async function HomePage() {
  const leagues = await getPublicLeagues().catch(() => []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">♟️</div>
          <h1 className="text-4xl font-bold mb-4">Chess League</h1>
          <p className="text-xl opacity-90 mb-8">
            Sistem pengelolaan kompetisi catur internal kantor
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/league"
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Lihat Semua Liga
            </Link>
            <Link
              href="/auth/login"
              className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Liga Aktif */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Liga Terbaru</h2>
        {leagues.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-4">🏆</div>
            <p>Belum ada liga yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {leagues.slice(0, 4).map((league) => (
              <Link
                key={league.id}
                href={`/league/${league.slug}`}
                className="border rounded-xl p-6 hover:border-primary transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition">
                    {league.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      league.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : league.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {league.status === "ACTIVE"
                      ? "Berlangsung"
                      : league.status === "COMPLETED"
                      ? "Selesai"
                      : "Arsip"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {formatMonth(league.month, league.year)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {league.players.length} peserta
                </p>
              </Link>
            ))}
          </div>
        )}

        {leagues.length > 4 && (
          <div className="text-center mt-6">
            <Link href="/league" className="text-primary hover:underline font-medium">
              Lihat semua liga →
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 text-center text-sm text-muted-foreground">
        <p>Chess League — Sistem Kompetisi Catur Internal</p>
      </footer>
    </main>
  );
}
