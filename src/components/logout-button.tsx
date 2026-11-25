"use client";

import { signOut } from "next-auth/react";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className ?? "text-sm text-muted-foreground hover:text-destructive transition"}
    >
      Logout
    </button>
  );
}
