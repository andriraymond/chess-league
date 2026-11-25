import { requireAdmin } from "@/lib/permissions";
import Link from "next/link";
import { getAllLeagues } from "@/services/league.service";
import { formatMonth } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const allLeagues = await getAllLeagues();

  const myLeagues = allLeagues.filter((l) =>
    (l as any).admins?.some((a: any) => a.userId === user.id)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">Selamat datang, {user.name}!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="border rounded-xl p-6">
          <div className="text-3xl font-bold mb-1">{allLeagues.length}</div>
          <div className="text-muted-foreground text-sm">Total Liga</div>
        </div>
        <div className="border rounded-xl p-6">
          <div className="text-3xl font-bold mb-1">
            {allLeagues.filter((l) => l.status === "ACTIVE").length}
          </div>
          <div className="text-muted-foreground text-sm">Liga Aktif</div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Liga Saya</h2>
          <Link
            href="/admin/leagues"
            className="text-sm text-primary hover:underline"
          >
            Lihat semua →
          </Link>
        </div>

        {myLeagues.length === 0 ? (
          <div className="border rounded-xl p-8 text-center text-muted-foreground">
            Belum ada liga yang ditugaskan ke kamu.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myLeagues.map((league) => (
              <Link
                key={league.id}
                href={`/admin/leagues/${league.id}`}
                className="border rounded-xl p-5 hover:border-primary transition"
              >
                <div className="font-semibold mb-1">{league.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatMonth(league.month, league.year)} · {league.status}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
