import { requireSuperAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserStatus } from "@prisma/client";

async function approveUser(formData: FormData) {
  "use server";
  const actorUser = await requireSuperAdmin();
  const userId = formData.get("userId") as string;
  await prisma.user.update({ where: { id: userId }, data: { status: UserStatus.APPROVED } });
  // Audit log
  const { createAuditLog } = await import("@/services/audit.service");
  await createAuditLog({ actorId: actorUser.id, action: "APPROVE_USER", entity: "User", entityId: userId, newData: { status: "APPROVED" } });
  revalidatePath("/super-admin/users");
}

async function rejectUser(formData: FormData) {
  "use server";
  const actorUser = await requireSuperAdmin();
  const userId = formData.get("userId") as string;
  await prisma.user.update({ where: { id: userId }, data: { status: UserStatus.REJECTED } });
  const { createAuditLog } = await import("@/services/audit.service");
  await createAuditLog({ actorId: actorUser.id, action: "REJECT_USER", entity: "User", entityId: userId, newData: { status: "REJECTED" } });
  revalidatePath("/super-admin/users");
}

export default async function SuperAdminUsersPage() {
  await requireSuperAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statusLabel: Record<string, string> = {
    PENDING: "Menunggu",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
    INACTIVE: "Nonaktif",
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    INACTIVE: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Kelola User Admin</h1>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nama</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[user.status] ?? ""}`}>
                    {statusLabel[user.status] ?? user.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.status === "PENDING" && (
                    <div className="flex gap-2">
                      <form action={approveUser}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                          Setujui
                        </button>
                      </form>
                      <form action={rejectUser}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                          Tolak
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
