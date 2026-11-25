import { requireLeagueAdmin } from "@/lib/permissions";
import { getLeagueById } from "@/services/league.service";
import { getMatchesByLeague } from "@/services/match.service";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireLeagueAdmin(id);
  const league = await getLeagueById(id);
  if (!league) notFound();

  const matches = await getMatchesByLeague(id);

  const statusColor: Record<string, string> = {
    SCHEDULED: "bg-gray-100 text-gray-600",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-600",
  };
  const statusLabel: Record<string, string> = {
    SCHEDULED: "Terjadwal",
    IN_PROGRESS: "Berlangsung",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href={`/admin/leagues/${id}`} className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← Kembali ke {league.name}
      </Link>

      <h1 className="text-2xl font-bold mb-6">Pertandingan — {league.name}</h1>

      {matches.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          Belum ada pertandingan. <Link href={`/admin/leagues/${id}/pairing`} className="text-primary hover:underline">Generate ronde</Link> terlebih dahulu.
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Ronde</th>
                <th className="text-left px-4 py-3 font-medium">Pertandingan</th>
                <th className="text-center px-4 py-3 font-medium">Skor</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Pemenang</th>
                <th className="text-left px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {matches.map((match) => (
                <tr key={match.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">R{match.round.roundNumber}</td>
                  <td className="px-4 py-3 font-medium">
                    {!match.playerBId ? (
                      <span>{match.playerA?.name} <span className="text-muted-foreground font-normal">(Bye)</span></span>
                    ) : (
                      <span>{match.playerA?.name} vs {match.playerB?.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    {match.playerBId ? `${match.scoreA}–${match.scoreB}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[match.status]}`}>
                      {statusLabel[match.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {match.winner ? match.winner.name : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {match.playerBId && (
                      <Link href={`/admin/leagues/${id}/matches/${match.id}`} className="text-xs text-primary hover:underline font-medium">
                        {match.status === "COMPLETED" ? "Detail" : "Input Hasil"} →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
