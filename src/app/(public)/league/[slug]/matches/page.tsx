import { getLeagueBySlug } from "@/services/league.service";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchStatus } from "@prisma/client";

export default async function LeagueMatchesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);

  if (!league || league.status === "DRAFT") notFound();

  const allMatches = league.rounds.flatMap((round) =>
    (round as any).matches?.map((m: any) => ({ ...m, roundNumber: round.roundNumber })) ?? []
  );

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <Link href={`/league/${slug}`} className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← Kembali ke Klasemen
      </Link>

      <h1 className="text-2xl font-bold mb-6">Pertandingan — {league.name}</h1>

      <div className="space-y-3">
        {allMatches.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">Belum ada pertandingan.</div>
        ) : (
          allMatches.map((match: any) => (
            <div key={match.id} className="border rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-medium">
                  {match.playerBId === null ? (
                    <span>{match.playerA?.name} <span className="text-muted-foreground font-normal">(Bye)</span></span>
                  ) : (
                    <span>
                      {match.playerA?.name ?? "?"}{" "}
                      <span className="text-muted-foreground font-normal">vs</span>{" "}
                      {match.playerB?.name ?? "?"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {match.status === MatchStatus.COMPLETED && (
                    <span className="text-sm font-bold">
                      {match.scoreA} – {match.scoreB}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    match.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    match.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {match.status === "COMPLETED" ? "Selesai" :
                     match.status === "IN_PROGRESS" ? "Berlangsung" : "Terjadwal"}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Ronde {match.roundNumber}
                {match.winner && ` · Pemenang: ${match.winner.name}`}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
