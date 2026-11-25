/**
 * Pairing Engine untuk Chess League.
 *
 * Prioritas:
 * 1. Pasangkan pemain yang belum pernah bertemu.
 * 2. Jika semua sudah pernah bertemu, minimasi jumlah pertemuan.
 * 3. Distribusi bye yang adil.
 * 4. Jumlah pertandingan per pemain seimbang.
 *
 * Algoritma: Backtracking dengan bitmask untuk 5–10 pemain.
 */

export type PairingResult = {
  pairs: [string, string][];
  bye: string | null;
};

/**
 * Generate pasangan untuk satu ronde.
 * @param playerIds Daftar ID pemain aktif.
 * @param meetingCount Frekuensi pertemuan [a][b] = jumlah pertemuan.
 * @param byeCount Jumlah bye per pemain.
 */
export function generatePairing(
  playerIds: string[],
  meetingCount: Record<string, Record<string, number>>,
  byeCount: Record<string, number>
): PairingResult {
  const n = playerIds.length;
  let byePlayer: string | null = null;
  let candidates = [...playerIds];

  // Jika ganjil, pilih pemain bye (yang paling sedikit dapat bye, random di antara yang sama)
  if (n % 2 === 1) {
    const minBye = Math.min(...candidates.map((id) => byeCount[id] ?? 0));
    const byeCandidates = candidates.filter((id) => (byeCount[id] ?? 0) === minBye);
    byePlayer = byeCandidates[Math.floor(Math.random() * byeCandidates.length)];
    candidates = candidates.filter((id) => id !== byePlayer);
  }

  const best = findBestPairing(candidates, meetingCount);

  return { pairs: best, bye: byePlayer };
}

/**
 * Backtracking untuk menemukan pasangan dengan total "cost" terendah.
 * Cost = total jumlah pertemuan sebelumnya di semua pasangan.
 */
function findBestPairing(
  players: string[],
  meetingCount: Record<string, Record<string, number>>
): [string, string][] {
  const n = players.length;
  let bestPairs: [string, string][] = [];
  let bestCost = Infinity;

  function backtrack(remaining: string[], current: [string, string][], cost: number) {
    if (remaining.length === 0) {
      if (cost < bestCost) {
        bestCost = cost;
        bestPairs = [...current];
      }
      return;
    }

    // Prune: kalau cost sudah >= best, skip
    if (cost >= bestCost) return;

    const first = remaining[0];
    const rest = remaining.slice(1);

    // Coba pasangkan first dengan setiap pemain di rest
    // Shuffle untuk randomness di antara pilihan dengan cost sama
    const shuffled = [...rest].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      const partner = shuffled[i];
      const pairCost = meetingCount[first]?.[partner] ?? 0;
      const newRemaining = rest.filter((p) => p !== partner);

      backtrack(
        newRemaining,
        [...current, [first, partner]],
        cost + pairCost
      );
    }
  }

  backtrack(players, [], 0);

  // Fallback: jika backtracking tidak menemukan (tidak mungkin), buat pairs berurutan
  if (bestPairs.length === 0) {
    for (let i = 0; i < players.length; i += 2) {
      bestPairs.push([players[i], players[i + 1]]);
    }
  }

  return bestPairs;
}
