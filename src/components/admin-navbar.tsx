import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { UserRole } from "@prisma/client";

export async function AdminNavbar() {
  const session = await auth();
  const user = session?.user as any;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
            <span>♟️</span>
            <span>Chess League</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/admin/leagues" className="text-sm text-muted-foreground hover:text-foreground transition">
              Liga
            </Link>
            {isSuperAdmin && (
              <>
                <Link href="/super-admin/users" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Users
                </Link>
                <Link href="/super-admin/leagues" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Semua Liga
                </Link>
                <Link href="/super-admin/audit-logs" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Audit Log
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition">
            Lihat Publik
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {user?.name}
              {isSuperAdmin && (
                <span className="ml-1 bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                  Super Admin
                </span>
              )}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
