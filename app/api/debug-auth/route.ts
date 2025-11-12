import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const a = await auth();
  const u = await currentUser();

  const roleFromSession =
    ((a.sessionClaims?.metadata as Record<string, unknown> | undefined)?.role as string | undefined) ||
    ((a.sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.role as string | undefined) ||
    ((a.sessionClaims?.privateMetadata as Record<string, unknown> | undefined)?.role as string | undefined) ||
    null;

  const roleFromUser = u
    ? ((u.publicMetadata?.role as string | undefined) ??
        (u.privateMetadata?.role as string | undefined) ??
        ((u.unsafeMetadata as Record<string, unknown> | undefined)?.role as string | undefined) ??
        null)
    : null;

  return NextResponse.json(
    {
      auth: {
        userId: a.userId,
        sessionId: a.sessionId,
        orgId: a.orgId,
        sessionClaims: a.sessionClaims ?? null,
      },
      roles: {
        session: roleFromSession,
        userPublic: (u?.publicMetadata?.role as string | undefined) ?? null,
        userPrivate: (u?.privateMetadata?.role as string | undefined) ?? null,
        userUnsafe:
          ((u?.unsafeMetadata as Record<string, unknown> | undefined)?.role as string | undefined) ??
          null,
        resolved: roleFromSession ?? roleFromUser ?? null,
      },
      user: u
        ? {
            id: u.id,
            email: u.primaryEmailAddress?.emailAddress ?? null,
            publicMetadata: u.publicMetadata ?? {},
            privateMetadata: u.privateMetadata ?? {},
            unsafeMetadata: u.unsafeMetadata ?? {},
          }
        : null,
    },
    { status: 200 },
  );
}
