import { requireSuperAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  await requireSuperAdmin();

  const [users, leagues] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.league.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] }),
  ]);

  const pendingUsers = users.filter((u) => u.status === "PENDING");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Super Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="border rounded-xl p-6">
          <div className="text-3xl font-bold mb-1">{pendingUsers.length}</div>
          <div className="text-muted-foreground text-sm">Admin Menunggu Approval</div>
          {pendingUsers.length > 0 && (
            <Link href="/super-admin/users" className="text-xs text-primary hover:underline mt-2 block">
              Review sekarang →
            </Link>
          )}
        </div>
        <div className="border rounded-xl p-6">
          <div className="text-3xl font-bold mb-1">{users.length}</div>
          <div className="text-muted-foreground text-sm">Total Admin</div>
        </div>
        <div className="border rounded-xl p-6">
          <div className="text-3xl font-bold mb-1">{leagues.length}</div>
          <div className="text-muted-foreground text-sm">Total Liga</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-semibold mb-3">Admin Pending</h2>
          {pendingUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground border rounded-lg p-4">
              Tidak ada admin yang menunggu approval.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingUsers.map((u) => (
                <div key={u.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <Link
                    href={`/super-admin/users`}
                    className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-3">Navigasi Cepat</h2>
          <div className="space-y-2">
            {[
              { href: "/super-admin/users", label: "👤 Kelola User Admin" },
              { href: "/super-admin/leagues", label: "🏆 Kelola Semua Liga" },
              { href: "/super-admin/audit-logs", label: "📋 Audit Log" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block border rounded-lg p-3 hover:border-primary transition text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
