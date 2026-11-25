import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const createLeagueSchema = z.object({
  name: z.string().min(3, "Nama liga minimal 3 karakter").max(100),
  description: z.string().max(500).optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2024).max(2100),
  targetMatchesPerPlayer: z.number().int().min(4).max(20).default(8),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const createPlayerSchema = z.object({
  name: z.string().min(2, "Nama pemain minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
});

export const bo3ResultSchema = z.object({
  matchId: z.string(),
  result: z.enum(["PLAYER_A", "PLAYER_B", "DRAW"]),
  note: z.string().max(500).optional(),
});

export const correctMatchSchema = z.object({
  matchId: z.string(),
  winnerPlayerId: z.string(),
  reason: z.string().min(10, "Alasan koreksi minimal 10 karakter").max(500),
});
