import { requireUser } from "@/lib/auth/require-user";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
          />

          <main className="min-w-0 flex-1 pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}