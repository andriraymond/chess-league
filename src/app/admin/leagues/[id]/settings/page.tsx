import { requireLeagueAdmin } from "@/lib/permissions";
import { getLeagueById, updateLeagueStatus } from "@/services/league.service";
import { LeagueStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/services/audit.service";

async function updateStatusAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId") as string;
  const status = formData.get("status") as LeagueStatus;
  const user = await requireLeagueAdmin(leagueId);
  await updateLeagueStatus(leagueId, status, user.id);
  revalidatePath(`/admin/leagues/${leagueId}/settings`);
  revalidatePath(`/admin/leagues/${leagueId}`);
  revalidatePath(`/admin/leagues`);
  revalidatePath(`/league`);
}

async function updateSettingsAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId") as string;
  const user = await requireLeagueAdmin(leagueId);

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const target = parseInt(formData.get("target") as string) || 8;

  const old = await prisma.league.findUnique({ where: { id: leagueId } });
  await prisma.league.update({
    where: { id: leagueId },
    data: { name, description, targetMatchesPerPlayer: target },
  });

  await createAuditLog({
    actorId: user.id,
    leagueId,
    action: "UPDATE_LEAGUE_SETTINGS",
    entity: "League",
    entityId: leagueId,
    oldData: { name: old?.name, target: old?.targetMatchesPerPlayer },
    newData: { name, target },
  });

  revalidatePath(`/admin/leagues/${leagueId}/settings`);
}

export default async function AdminLeagueSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireLeagueAdmin(id);
  const league = await getLeagueById(id);
  if (!league) notFound();

  const statusTransitions: Record<string, LeagueStatus[]> = {
    DRAFT: [LeagueStatus.ACTIVE],
    ACTIVE: [LeagueStatus.COMPLETED],
    COMPLETED: [LeagueStatus.ARCHIVED],
    ARCHIVED: [],
  };
  const nextStatuses = statusTransitions[league.status] || [];
  const statusLabels: Record<string, string> = {
    ACTIVE: "Mulai Liga (In Progress)",
    COMPLETED: "Selesaikan Liga (Completed)",
    ARCHIVED: "Arsipkan Liga (Archived)",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/admin/leagues/${id}`} className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← Kembali ke {league.name}
      </Link>

      <h1 className="text-2xl font-bold mb-6">Pengaturan — {league.name}</h1>

      {/* Edit info liga */}
      <div className="border rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">📝 Informasi Liga</h2>
        <form action={updateSettingsAction} className="space-y-4">
          <input type="hidden" name="leagueId" value={id} />
          <div>
            <label className="block text-sm font-medium mb-1">Nama Liga</label>
            <input name="name" defaultValue={league.name} required minLength={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea name="description" defaultValue={league.description ?? ""} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Pertandingan per Pemain</label>
            <input name="target" type="number" defaultValue={league.targetMatchesPerPlayer} min={4} max={20} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
            Simpan Perubahan
          </button>
        </form>
      </div>

      {/* Status transition */}
      <div className="border rounded-xl p-6">
        <h2 className="font-semibold mb-4">🔄 Status Liga</h2>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm">Status saat ini:</span>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            league.status === "DRAFT" ? "bg-gray-100 text-gray-600" :
            league.status === "ACTIVE" ? "bg-green-100 text-green-700" :
            league.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
          }`}>
            {league.status}
          </span>
        </div>
        {nextStatuses.length > 0 ? (
          <div className="flex gap-3">
            {nextStatuses.map((s) => (
              <form key={s} action={updateStatusAction}>
                <input type="hidden" name="leagueId" value={id} />
                <input type="hidden" name="status" value={s} />
                <button type="submit" className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  s === "ACTIVE" ? "bg-green-600 text-white hover:bg-green-700" :
                  s === "COMPLETED" ? "bg-blue-600 text-white hover:bg-blue-700" :
                  "bg-purple-600 text-white hover:bg-purple-700"
                }`}>
                  {statusLabels[s] ?? s}
                </button>
              </form>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Liga sudah diarsipkan. Tidak ada perubahan status yang tersedia.</p>
        )}
      </div>
    </div>
  );
}
