import { requireSuperAdmin } from "@/lib/permissions";
import { getAuditLogs } from "@/services/audit.service";
import { formatDate } from "@/lib/utils";

export default async function SuperAdminAuditLogsPage() {
  await requireSuperAdmin();
  const logs = await getAuditLogs({ limit: 200 });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>

      {logs.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          Belum ada aktivitas yang tercatat.
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Waktu</th>
                <th className="text-left px-4 py-3 font-medium">Aktor</th>
                <th className="text-left px-4 py-3 font-medium">Aksi</th>
                <th className="text-left px-4 py-3 font-medium">Entity</th>
                <th className="text-left px-4 py-3 font-medium">Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{log.actor.name}</div>
                    <div className="text-xs text-muted-foreground">{log.actor.role}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-muted px-2 py-1 rounded font-mono">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{log.entity}</td>
                  <td className="px-4 py-3 text-xs">{log.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
