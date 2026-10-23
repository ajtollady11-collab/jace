import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";
import { isDatabaseConfigured, listBookings, listUnbookedApplications } from "@/lib/db";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  if (!isDatabaseConfigured()) {
    return (
      <main id="main" className="flex min-h-svh items-center justify-center px-5">
        <div className="max-w-lg rounded-[18px] border border-line bg-card p-8">
          <p className="eyebrow">Setup needed</p>
          <h1 className="mt-3 text-2xl font-semibold">Connect a database</h1>
          <p className="mt-4 leading-relaxed text-fg-2">
            In Vercel, open this project → <strong className="text-fg">Storage</strong> → Create Database → choose{" "}
            <strong className="text-fg">Neon (Postgres)</strong> → connect it to this project, then redeploy. Bookings
            will appear here automatically.
          </p>
        </div>
      </main>
    );
  }

  const [bookings, unbooked] = await Promise.all([listBookings(), listUnbookedApplications()]);
  return <AdminDashboard bookings={bookings} unbooked={unbooked} nowMs={Date.now()} />;
}
