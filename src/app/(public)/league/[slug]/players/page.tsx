import { getLeagueBySlug } from "@/services/league.service";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function LeaguePlayersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const league = await getLeagueBySlug(slug);

  if (!league || league.status === "DRAFT") notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <Link href={`/league/${slug}`} className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← Kembali ke Klasemen
      </Link>

      <h1 className="text-2xl font-bold mb-6">Pemain — {league.name}</h1>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Nama</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {league.players.map((lp, idx) => (
              <tr key={lp.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{lp.player.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    lp.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {lp.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
