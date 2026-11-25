import { requireLeagueAdmin } from "@/lib/permissions";
import { getLeagueById } from "@/services/league.service";
import { generateRound, confirmRound, deleteDraftRound, deleteRound, getRoundWithMatches } from "@/services/round.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

async function generateRoundAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId") as string;
  const user = await requireLeagueAdmin(leagueId);
  await generateRound(leagueId, user.id);
  revalidatePath(`/admin/leagues/${leagueId}/pairing`);
}

async function confirmRoundAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId") as string;
  const roundId = formData.get("roundId") as string;
  const user = await requireLeagueAdmin(leagueId);
  await confirmRound(roundId, user.id);
  revalidatePath(`/admin/leagues/${leagueId}/pairing`);
}

async function regenerateRoundAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId") as string;
  const roundId = formData.get("roundId") as string;
  const user = await requireLeagueAdmin(leagueId);
  await deleteDraftRound(roundId, user.id);
  await generateRound(leagueId, user.id);
  revalidatePath(`/admin/leagues/${leagueId}/pairing`);
}

async function deleteRoundAction(formData: FormData) {
  "use server";
  const leagueId = formData.get("leagueId") as string;
  const roundId = formData.get("roundId") as string;
  const user = await requireLeagueAdmin(leagueId);
  await deleteRound(roundId, user.id);
  revalidatePath(`/admin/leagues/${leagueId}/pairing`);
}

export default async function AdminPairingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireLeagueAdmin(id);
  const league = await getLeagueById(id);
  if (!league) notFound();

  const activePlayers = league.players.filter((lp) => lp.status === "ACTIVE");

  // Fetch detail setiap round beserta matchnya
  const roundsWithMatches = await Promise.all(
    league.rounds.map((r) => getRoundWithMatches(r.id))
  );

  const draftRound = roundsWithMatches.find((r) => r?.status === "DRAFT");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href={`/admin/leagues/${id}`} className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← Kembali ke {league.name}
      </Link>

      <h1 className="text-2xl font-bold mb-6">Pairing — {league.name}</h1>

      <div className="mb-6 flex gap-3 items-center flex-wrap">
        <span className="text-sm text-muted-foreground">
          {activePlayers.length} pemain aktif · {league.rounds.length} ronde
        </span>
        {!draftRound && activePlayers.length >= 2 && (
          <form action={generateRoundAction}>
            <input type="hidden" name="leagueId" value={id} />
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
              🎲 Generate Ronde Baru
            </button>
          </form>
        )}
        {activePlayers.length < 2 && (
          <span className="text-sm text-destructive">Minimal 2 pemain aktif untuk generate ronde.</span>
        )}
      </div>

      {/* Draft round preview */}
      {draftRound && (
        <div className="border-2 border-dashed border-yellow-400 rounded-xl p-6 mb-6 bg-yellow-50/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">📋 Preview Ronde {draftRound.roundNumber} (DRAFT)</h2>
            <div className="flex gap-2">
              <form action={confirmRoundAction}>
                <input type="hidden" name="leagueId" value={id} />
                <input type="hidden" name="roundId" value={draftRound.id} />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                  ✅ Konfirmasi
                </button>
              </form>
              <form action={regenerateRoundAction}>
                <input type="hidden" name="leagueId" value={id} />
                <input type="hidden" name="roundId" value={draftRound.id} />
                <button type="submit" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                  🔄 Regenerate
                </button>
              </form>
              <form action={deleteRoundAction}>
                <input type="hidden" name="leagueId" value={id} />
                <input type="hidden" name="roundId" value={draftRound.id} />
                <button type="submit" className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
                  🗑️ Hapus
                </button>
              </form>
            </div>
          </div>
          <div className="space-y-2">
            {draftRound.matches?.map((match, idx) => (
              <div key={match.id} className="border rounded-lg p-3 bg-white flex items-center justify-between">
                <div className="font-medium text-sm">
                  {!match.playerBId ? (
                    <span>{match.playerA?.name} <span className="text-muted-foreground font-normal">(Bye)</span></span>
                  ) : (
                    <span>
                      {match.playerA?.name ?? "?"}
                      <span className="text-muted-foreground font-normal mx-2">vs</span>
                      {match.playerB?.name ?? "?"}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {!match.playerBId ? "Bye — tanpa poin" : "Belum pernah bertemu"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ronde yang sudah dikonfirmasi */}
      <div className="space-y-4">
        {roundsWithMatches
          .filter((r) => r && r.status !== "DRAFT")
          .sort((a, b) => (b?.roundNumber ?? 0) - (a?.roundNumber ?? 0))
          .map((round) => {
            if (!round) return null;
            const completedCount = round.matches?.filter((m) => m.status === "COMPLETED").length ?? 0;
            const totalMatches = round.matches?.filter((m) => m.playerBId).length ?? 0;

            return (
              <div key={round.id} className="border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Ronde {round.roundNumber}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${round.status === "COMPLETED" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {round.status === "COMPLETED" ? "Selesai" : "Berlangsung"}
                    </span>
                    <span className="text-xs text-muted-foreground">{completedCount}/{totalMatches} selesai</span>
                    <form action={deleteRoundAction}>
                      <input type="hidden" name="leagueId" value={id} />
                      <input type="hidden" name="roundId" value={round.id} />
                      <button type="submit" className="text-xs text-destructive hover:underline ml-2">
                        🗑️ Hapus
                      </button>
                    </form>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {round.matches?.map((match) => (
                    <div key={match.id} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                      <span>
                        {!match.playerBId ? (
                          <span>{match.playerA?.name} <span className="text-muted-foreground">(Bye)</span></span>
                        ) : (
                          <span>
                            {match.playerA?.name} <span className="text-muted-foreground">vs</span> {match.playerB?.name}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        {match.status === "COMPLETED" && (
                          <span className="font-bold text-xs">{match.scoreA}–{match.scoreB}</span>
                        )}
                        {match.playerBId && (
                          <Link
                            href={`/admin/leagues/${id}/matches/${match.id}`}
                            className="text-xs text-primary hover:underline"
                          >
                            {match.status === "COMPLETED" ? "Detail" : "Input Hasil"}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {roundsWithMatches.filter((r) => r && r.status !== "DRAFT").length === 0 && !draftRound && (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          Belum ada ronde. Generate ronde pertama dengan tombol di atas.
        </div>
      )}
    </div>
  );
}
