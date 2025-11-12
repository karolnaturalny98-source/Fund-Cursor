import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { AdminScrollLock } from "@/components/admin/admin-scroll-lock";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const role = (user.publicMetadata?.role ?? user.privateMetadata?.role ?? user.unsafeMetadata?.role) as string | undefined;
  if (!role || role.toLowerCase() !== "admin") {
    redirect("/");
  }

  return (
    <div className="relative h-screen overflow-hidden">
      <AdminScrollLock />
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
