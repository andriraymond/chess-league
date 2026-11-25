import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="text-2xl font-bold mb-3">Menunggu Persetujuan</h1>
        <p className="text-muted-foreground mb-6">
          Akun kamu sudah terdaftar dan sedang menunggu persetujuan Super Admin.
          Kamu akan mendapat akses setelah akun disetujui.
        </p>
        <Link
          href="/auth/login"
          className="text-primary hover:underline text-sm"
        >
          ← Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
