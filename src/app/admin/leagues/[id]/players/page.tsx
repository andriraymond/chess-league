import { requireLeagueAdmin } from "@/lib/permissions";
import { getLeagueById } from "@/services/league.service";
import { createPlayer, addExistingPlayerToLeague, deactivatePlayerInLeague, updatePlayerName } from "@/services/player.service";
import { getAllPlayers } from "@/services/player.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

async function addNewPlayerAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId") as string;
  const user = await requireLeagueAdmin(leagueId);
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  if (!name || name.length < 2) throw new Error("Nama minimal 2 karakter");
  await createPlayer({ name, email: email || undefined }, user.id, leagueId);
  revalidatePath(`/admin/leagues/${leagueId}/players`);
}

async function addExistingPlayerAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId") as string;
  const playerId = formData.get("playerId") as string;
  const user = await requireLeagueAdmin(leagueId);
  await addExistingPlayerToLeague(playerId, leagueId, user.id);
  revalidatePath(`/admin/leagues/${leagueId}/players`);
}

async function deactivatePlayerAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId") as string;
  const playerId = formData.get("playerId") as string;
  const user = await requireLeagueAdmin(leagueId);
  await deactivatePlayerInLeague(playerId, leagueId, user.id);
  revalidatePath(`/admin/leagues/${leagueId}/players`);
}

async function editPlayerNameAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId") as string;
  const playerId = formData.get("playerId") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!name || name.length < 2) throw new Error("Nama minimal 2 karakter");
  const user = await requireLeagueAdmin(leagueId);
  await updatePlayerName(playerId, name, user.id);
  revalidatePath(`/admin/leagues/${leagueId}/players`);
}

export default async function AdminLeaguePlayersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireLeagueAdmin(id);
  const [league, allPlayers] = await Promise.all([
    getLeagueById(id),
    getAllPlayers(),
  ]);
  if (!league) notFound();
  const leaguePlayerIds = league.players.map((lp) => lp.playerId);
  const availablePlayers = allPlayers.filter(
    (p) => !leaguePlayerIds.includes(p.id) && p.status === "ACTIVE"
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href={`/admin/leagues/${id}`} className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← Kembali ke {league.name}
      </Link>

      <h1 className="text-2xl font-bold mb-6">Peserta — {league.name}</h1>

      {/* Form tambah pemain baru */}
      <div className="border rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">➕ Tambah Pemain Baru</h2>
        <form action={addNewPlayerAction} className="flex gap-3 flex-wrap">
          <input type="hidden" name="leagueId" value={id} />
          <input name="name" required minLength={2} placeholder="Nama pemain" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary" />
          <input name="email" type="email" placeholder="Email (opsional)" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary" />
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
            Tambah
          </button>
        </form>
      </div>

      {/* Tambah pemain existing */}
      {availablePlayers.length > 0 && (
        <div className="border rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-4">👤 Tambah Pemain yang Sudah Ada</h2>
          <form action={addExistingPlayerAction} className="flex gap-3 flex-wrap">
            <input type="hidden" name="leagueId" value={id} />
            <select name="playerId" required className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Pilih pemain...</option>
              {availablePlayers.map((p) => (
                <option key={p.id} value={p.id}>{p.name} {p.email ? `(${p.email})` : ""}</option>
              ))}
            </select>
            <button type="submit" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
              Tambahkan ke Liga
            </button>
          </form>
        </div>
      )}

      {/* Daftar peserta liga */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Nama</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {league.players.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada peserta. Tambah pemain di atas.</td></tr>
            ) : (
              league.players.map((lp, idx) => (
                <tr key={lp.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    <form action={editPlayerNameAction} className="flex items-center gap-2">
                      <input type="hidden" name="leagueId" value={id} />
                      <input type="hidden" name="playerId" value={lp.playerId} />
                      <input
                        name="name"
                        defaultValue={lp.player.name}
                        required
                        minLength={2}
                        className="border border-transparent hover:border-border focus:border-primary rounded px-2 py-1 text-sm font-medium bg-transparent focus:bg-background focus:outline-none w-44"
                      />
                      <button
                        type="submit"
                        className="text-xs text-primary hover:underline shrink-0"
                      >
                        Simpan
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lp.player.email ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${lp.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {lp.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lp.status === "ACTIVE" && (
                      <form action={deactivatePlayerAction} className="inline">
                        <input type="hidden" name="leagueId" value={id} />
                        <input type="hidden" name="playerId" value={lp.playerId} />
                        <button type="submit" className="text-xs text-destructive hover:underline">
                          Nonaktifkan
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Total: {league.players.filter((p) => p.status === "ACTIVE").length} pemain aktif dari {league.players.length} terdaftar
      </p>
    </div>
  );
}
