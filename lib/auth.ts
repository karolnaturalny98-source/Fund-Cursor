import { auth, currentUser } from "@clerk/nextjs/server";

export type AppRole = "admin" | "user";

function extractRole(metadata: Record<string, unknown> | null | undefined) {
  const raw = metadata?.role;
  if (typeof raw === "string" && raw.toLowerCase() === "admin") {
    return "admin" as const;
  }
  return null;
}

export function getRoleFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): AppRole {
  return extractRole(metadata) ?? "user";
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const role =
    extractRole(user.publicMetadata) ||
    extractRole(user.privateMetadata) ||
    extractRole((user.unsafeMetadata as Record<string, unknown> | undefined) ?? null) ||
    null;

  if (role !== "admin") {
    throw new Error("User is not authorized.");
  }

  return { user, role };
}

export async function getAuthRole(): Promise<AppRole> {
  const { sessionClaims } = await auth();
  return (
    extractRole(
      (sessionClaims?.metadata as Record<string, unknown> | undefined) ?? null,
    ) ||
    extractRole(
      (sessionClaims?.publicMetadata as Record<string, unknown> | undefined) ??
        null,
    ) ||
    extractRole(
      (sessionClaims?.privateMetadata as Record<string, unknown> | undefined) ??
        null,
    ) ||
    "user"
  );
}

export async function assertAdminRequest() {
  const user = await currentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const role =
    extractRole(user.publicMetadata) ||
    extractRole(user.privateMetadata) ||
    extractRole((user.unsafeMetadata as Record<string, unknown> | undefined) ?? null) ||
    null;

  if (role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return { userId: user.id, role };
}
