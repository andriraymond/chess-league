import Link from "next/link";
import { auth } from "@/lib/auth";

export async function PublicNavbar() {
  const session = await auth();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span>♟️</span>
          <span>Chess League</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/league" className="text-sm text-muted-foreground hover:text-foreground transition">
            Liga
          </Link>
          <Link href="/hall-of-fame" className="text-sm text-muted-foreground hover:text-foreground transition">
            Hall of Fame
          </Link>
          {session?.user ? (
            <Link
              href="/admin"
              className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
