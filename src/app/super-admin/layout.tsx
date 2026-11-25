import { AdminNavbar } from "@/components/admin-navbar";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}
