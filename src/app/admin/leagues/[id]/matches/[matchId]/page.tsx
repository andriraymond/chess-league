import { requireLeagueAdmin } from "@/lib/permissions";
import { getMatchById, inputGameResult, correctMatchResult } from "@/services/match.service";
import { GameResult } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

async function inputResultAction(formData: FormData) {
  "use server";
  const matchId = formData.get("matchId") as string;
  const leagueId = formData.get("leagueId") as string;
  const result = formData.get("result") as GameResult;
  const note = formData.get("note") as string;
  const user = await requireLeagueAdmin(leagueId);

  await inputGameResult(matchId, result, user.id, note || undefined);
  revalidatePath(`/admin/leagues/${leagueId}/matches/${matchId}`);
}

async function correctResultAction(formData: FormData) {
  "use server";
  const matchId = formData.get("matchId") as string;
  const leagueId = formData.get("leagueId") as string;
  const winnerPlayerId = formData.get("winnerPlayerId") as string;
  const reason = formData.get("reason") as string;
  const user = await requireLeagueAdmin(leagueId);

  if (!reason || reason.length < 10) throw new Error("Alasan koreksi minimal 10 karakter.");
  await correctMatchResult(matchId, winnerPlayerId, reason, user.id);
  revalidatePath(`/admin/leagues/${leagueId}/matches/${matchId}`);
}

export default async function AdminMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = await params;
  await requireLeagueAdmin(id);
  const match = await getMatchById(matchId);
  if (!match) notFound();

  const isCompleted = match.status === "COMPLETED";
  const isBye = !match.playerBId;

  if (isBye) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href={`/admin/leagues/${id}/matches`} className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold mb-4">Bye — {match.playerA?.name}</h1>
        <p className="text-muted-foreground">Pemain ini mendapat bye pada ronde ini. Tidak ada pertandingan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/admin/leagues/${id}/matches`} className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
        ← Kembali ke Pertandingan
      </Link>

      <h1 className="text-2xl font-bold mb-2">
        {match.playerA?.name} vs {match.playerB?.name}
      </h1>
      <p className="text-muted-foreground mb-6">
        {match.round.league.name} · Ronde {match.round.roundNumber}
      </p>

      {/* Skor besar */}
      <div className="border rounded-xl p-8 mb-6 text-center">
        <div className="flex items-center justify-center gap-8">
          <div>
            <div className={`text-4xl font-bold ${match.winnerPlayerId === match.playerAId ? "text-green-600" : ""}`}>
              {match.scoreA}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{match.playerA?.name}</div>
          </div>
          <div className="text-2xl text-muted-foreground">–</div>
          <div>
            <div className={`text-4xl font-bold ${match.winnerPlayerId === match.playerBId ? "text-green-600" : ""}`}>
              {match.scoreB}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{match.playerB?.name}</div>
          </div>
        </div>
        {isCompleted && match.winner && (
          <div className="mt-4 text-green-600 font-semibold">
            🏆 Pemenang: {match.winner.name}
          </div>
        )}
        {!isCompleted && (
          <div className="mt-4">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
              Pertandingan belum selesai — butuh {2 - Math.max(match.scoreA, match.scoreB)} kemenangan lagi
            </span>
          </div>
        )}
      </div>

      {/* Riwayat game */}
      <div className="border rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-3">📝 Riwayat Game (BO3)</h2>
        {match.games.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada game dicatat.</p>
        ) : (
          <div className="space-y-2">
            {match.games.map((game, idx) => {
              const resultLabel = game.result === "PLAYER_A"
                ? `${match.playerA?.name} menang`
                : game.result === "PLAYER_B"
                ? `${match.playerB?.name} menang`
                : "Remis (tidak dihitung)";
              const resultColor = game.result === "DRAW"
                ? "text-muted-foreground"
                : "text-foreground font-medium";
              return (
                <div key={idx} className="flex items-center justify-between border rounded-lg px-4 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      Game {game.gameNumber}
                    </span>
                    <span className={`text-sm ${resultColor}`}>
                      {game.result === "DRAW" ? "🤝" : "⚔️"} {resultLabel}
                    </span>
                  </div>
                  {game.note && (
                    <span className="text-xs text-muted-foreground italic">{game.note}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input game result — hanya jika belum selesai */}
      {!isCompleted && (
        <div className="border-2 border-primary rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-4">🎮 Input Hasil Game {match.games.length + 1}</h2>
          <form action={inputResultAction} className="space-y-4">
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="leagueId" value={id} />

            <div className="grid grid-cols-3 gap-3">
              <label className="border rounded-xl p-4 cursor-pointer hover:border-green-500 transition text-center has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                <input type="radio" name="result" value="PLAYER_A" required className="sr-only" />
                <div className="font-semibold mb-1">{match.playerA?.name}</div>
                <div className="text-xs text-muted-foreground">Menang</div>
              </label>
              <label className="border rounded-xl p-4 cursor-pointer hover:border-gray-400 transition text-center has-[:checked]:border-gray-400 has-[:checked]:bg-gray-50">
                <input type="radio" name="result" value="DRAW" className="sr-only" />
                <div className="font-semibold mb-1">🤝</div>
                <div className="text-xs text-muted-foreground">Remis</div>
              </label>
              <label className="border rounded-xl p-4 cursor-pointer hover:border-blue-500 transition text-center has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input type="radio" name="result" value="PLAYER_B" className="sr-only" />
                <div className="font-semibold mb-1">{match.playerB?.name}</div>
                <div className="text-xs text-muted-foreground">Menang</div>
              </label>
            </div>

            <input
              name="note"
              placeholder="Catatan (opsional)"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition">
              Simpan Hasil Game {match.games.length + 1}
            </button>
          </form>
        </div>
      )}

      {/* Koreksi hasil — hanya jika sudah selesai */}
      {isCompleted && (
        <details className="border rounded-xl p-5">
          <summary className="cursor-pointer font-semibold text-sm text-destructive">
            ⚠️ Koreksi Hasil Pertandingan
          </summary>
          <form action={correctResultAction} className="mt-4 space-y-3">
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="leagueId" value={id} />
            <div>
              <label className="block text-sm font-medium mb-1">Pemenang yang benar:</label>
              <select name="winnerPlayerId" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Pilih pemenang...</option>
                <option value={match.playerAId!}>{match.playerA?.name}</option>
                <option value={match.playerBId!}>{match.playerB?.name}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alasan koreksi (min. 10 karakter):</label>
              <textarea
                name="reason"
                required
                minLength={10}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Jelaskan alasan koreksi..."
              />
            </div>
            <button type="submit" className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
              Koreksi Hasil
            </button>
          </form>
        </details>
      )}
    </div>
  );
}
