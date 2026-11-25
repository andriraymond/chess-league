import { getLeagueBySlug } from "@/services/league.service";
import { calculateStandings } from "@/services/standings.service";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function LeagueStandingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Redirect ke halaman utama liga (yang sudah menampilkan klasemen)
  redirect(`/league/${slug}`);
}
