import "server-only";
import { prisma } from "@/lib/prisma";

type AuditLogData = {
  actorId: string;
  leagueId?: string;
  action: string;
  entity: string;
  entityId: string;
  oldData?: unknown;
  newData?: unknown;
  reason?: string;
};

export async function createAuditLog(data: AuditLogData) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        leagueId: data.leagueId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldData: data.oldData ? JSON.parse(JSON.stringify(data.oldData)) : undefined,
        newData: data.newData ? JSON.parse(JSON.stringify(data.newData)) : undefined,
        reason: data.reason,
      },
    });
  } catch (err) {
    // Audit log failure should not break main flow
    console.error("[AuditLog] Gagal menyimpan audit log:", err);
  }
}

export async function getAuditLogs(options?: {
  leagueId?: string;
  actorId?: string;
  limit?: number;
}) {
  return prisma.auditLog.findMany({
    where: {
      ...(options?.leagueId && { leagueId: options.leagueId }),
      ...(options?.actorId && { actorId: options.actorId }),
    },
    include: {
      actor: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 100,
  });
}
