import { requireAdmin } from "@/lib/permissions";
import { getAllLeagues } from "@/services/league.service";
import { formatMonth } from "@/lib/utils";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createLeague } from "@/services/league.service";
import { assignAdminToLeague } from "@/services/league.service";
import { createLeagueSchema } from "@/lib/validations";

async function createLeagueAction(formData: FormData) {
  "use server";
  const user = await requireAdmin();

  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    month: parseInt(formData.get("month") as string),
    year: parseInt(formData.get("year") as string),
    targetMatchesPerPlayer: parseInt(formData.get("target") as string) || 8,
  };

  const parsed = createLeagueSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const league = await createLeague(parsed.data, user.id);
  // Auto-assign creator sebagai admin liga
  await assignAdminToLeague(league.id, user.id, user.id);

  revalidatePath("/admin/leagues");
}

export default async function AdminLeaguesPage() {
  const user = await requireAdmin();
  const allLeagues = await getAllLeagues();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Kelola Liga</h1>
      </div>

      {/* Form buat liga baru */}
      <div className="border rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4">➕ Buat Liga Baru</h2>
        <form action={createLeagueAction} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Liga</label>
            <input
              name="name"
              required
              minLength={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Liga Catur November"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bulan</label>
            <select
              name="month"
              defaultValue={currentMonth}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
              ].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tahun</label>
            <input
              name="year"
              type="number"
              defaultValue={currentYear}
              min={2024}
              max={2100}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Pertandingan/Pemain</label>
            <input
              name="target"
              type="number"
              defaultValue={8}
              min={4}
              max={20}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium mb-1">Deskripsi (opsional)</label>
            <input
              name="description"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Kompetisi catur bulanan kantor"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition text-sm"
            >
              Buat Liga
            </button>
          </div>
        </form>
      </div>

      {/* Daftar liga */}
      <div>
        <h2 className="font-semibold mb-4">📋 Semua Liga</h2>
        {allLeagues.length === 0 ? (
          <div className="border rounded-xl p-8 text-center text-muted-foreground">
            Belum ada liga. Buat liga pertama di atas!
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Nama Liga</th>
                  <th className="text-left px-4 py-3 font-medium">Periode</th>
                  <th className="text-center px-4 py-3 font-medium">Peserta</th>
                  <th className="text-center px-4 py-3 font-medium">Ronde</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allLeagues.map((league) => {
                  const statusColor: Record<string, string> = {
                    DRAFT: "bg-gray-100 text-gray-600",
                    ACTIVE: "bg-green-100 text-green-700",
                    COMPLETED: "bg-blue-100 text-blue-700",
                    ARCHIVED: "bg-purple-100 text-purple-700",
                  };
                  const statusLabel: Record<string, string> = {
                    DRAFT: "Draft",
                    ACTIVE: "Aktif",
                    COMPLETED: "Selesai",
                    ARCHIVED: "Arsip",
                  };
                  return (
                    <tr key={league.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{league.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatMonth(league.month, league.year)}</td>
                      <td className="px-4 py-3 text-center">{league._count.players}</td>
                      <td className="px-4 py-3 text-center">{league._count.rounds}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[league.status]}`}>
                          {statusLabel[league.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/leagues/${league.id}`} className="text-xs text-primary hover:underline font-medium">
                          Kelola →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
