import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generatePairing } from "../src/services/pairing.service";

function buildEmptyMeetingCount(playerIds: string[]) {
  const map: Record<string, Record<string, number>> = {};
  for (const a of playerIds) {
    map[a] = {};
    for (const b of playerIds) {
      map[a][b] = 0;
    }
  }
  return map;
}

function buildEmptyByeCount(playerIds: string[]) {
  const map: Record<string, number> = {};
  for (const id of playerIds) map[id] = 0;
  return map;
}

describe("Pairing Engine (FSD 8.2)", () => {
  it("6 pemain menghasilkan 3 pasangan tanpa bye dan tanpa duplikat", () => {
    const players = ["p1", "p2", "p3", "p4", "p5", "p6"];
    const { pairs, bye } = generatePairing(
      players,
      buildEmptyMeetingCount(players),
      buildEmptyByeCount(players)
    );

    assert.equal(pairs.length, 3);
    assert.equal(bye, null);
    const flat = pairs.flat();
    assert.equal(new Set(flat).size, 6);
  });

  it("5 pemain menghasilkan 2 pasangan dan 1 bye", () => {
    const players = ["p1", "p2", "p3", "p4", "p5"];
    const { pairs, bye } = generatePairing(
      players,
      buildEmptyMeetingCount(players),
      buildEmptyByeCount(players)
    );

    assert.equal(pairs.length, 2);
    assert.ok(bye && players.includes(bye));
    const flat = [...pairs.flat(), bye];
    assert.equal(new Set(flat).size, 5);
  });

  it("8 pemain menghasilkan 4 pasangan", () => {
    const players = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"];
    const { pairs, bye } = generatePairing(
      players,
      buildEmptyMeetingCount(players),
      buildEmptyByeCount(players)
    );

    assert.equal(pairs.length, 4);
    assert.equal(bye, null);
    assert.equal(new Set(pairs.flat()).size, 8);
  });

  it("9 pemain menghasilkan 4 pasangan dan 1 bye", () => {
    const players = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"];
    const { pairs, bye } = generatePairing(
      players,
      buildEmptyMeetingCount(players),
      buildEmptyByeCount(players)
    );

    assert.equal(pairs.length, 4);
    assert.ok(bye && players.includes(bye));
    assert.equal(new Set([...pairs.flat(), bye]).size, 9);
  });

  it("memprioritaskan pasangan yang belum pernah bertemu", () => {
    const players = ["p1", "p2", "p3", "p4"];
    const meetings = buildEmptyMeetingCount(players);
    // p1 sudah bertemu p2 (5x) dan p3 (5x), belum pernah bertemu p4
    meetings["p1"]["p2"] = 5;
    meetings["p2"]["p1"] = 5;
    meetings["p1"]["p3"] = 5;
    meetings["p3"]["p1"] = 5;
    meetings["p2"]["p4"] = 5;
    meetings["p4"]["p2"] = 5;
    meetings["p3"]["p4"] = 5;
    meetings["p4"]["p3"] = 5;

    const { pairs } = generatePairing(players, meetings, buildEmptyByeCount(players));
    const hasP1P4 = pairs.some(
      ([a, b]) => (a === "p1" && b === "p4") || (a === "p4" && b === "p1")
    );
    assert.equal(hasP1P4, true);
  });

  it("memberikan bye kepada pemain dengan jumlah bye paling sedikit", () => {
    const players = ["p1", "p2", "p3", "p4", "p5"];
    const byeCount = { p1: 2, p2: 2, p3: 2, p4: 2, p5: 0 };

    const { bye } = generatePairing(
      players,
      buildEmptyMeetingCount(players),
      byeCount
    );
    assert.equal(bye, "p5");
  });
});
