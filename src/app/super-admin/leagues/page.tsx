import { requireSuperAdmin } from "@/lib/permissions";
import { getAllLeagues } from "@/services/league.service";
import { formatMonth } from "@/lib/utils";
import Link from "next/link";

export default async function SuperAdminLeaguesPage() {
  await requireSuperAdmin();
  const leagues = await getAllLeagues();

  const statusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    ARCHIVED: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Semua Liga (Super Admin)</h1>

      {leagues.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">Belum ada liga.</div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nama</th>
                <th className="text-left px-4 py-3 font-medium">Periode</th>
                <th className="text-center px-4 py-3 font-medium">Peserta</th>
                <th className="text-center px-4 py-3 font-medium">Ronde</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leagues.map((league) => (
                <tr key={league.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{league.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatMonth(league.month, league.year)}</td>
                  <td className="px-4 py-3 text-center">{league._count.players}</td>
                  <td className="px-4 py-3 text-center">{league._count.rounds}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[league.status]}`}>
                      {league.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leagues/${league.id}`} className="text-xs text-primary hover:underline">
                      Kelola →
                    </Link>
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
