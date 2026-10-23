import { redirect } from "next/navigation";
import { adminPassword, isAdmin } from "@/lib/adminAuth";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main id="main" className="flex min-h-svh items-center justify-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        <p className="text-center font-display text-sm font-semibold tracking-[0.32em]">JACE SULLIVAN</p>
        <div className="mt-8 rounded-[18px] border border-line bg-card p-7 sm:p-9">
          <p className="eyebrow">Team dashboard</p>
          <h1 className="mt-3 text-2xl font-semibold">Sign in</h1>
          {adminPassword() ? (
            <LoginForm />
          ) : (
            <p className="mt-5 rounded-[10px] border border-dashed border-gold/40 bg-gold/[0.05] p-4 text-sm leading-relaxed text-fg-2">
              The dashboard password hasn’t been set yet. In Vercel, go to <strong className="text-fg">Settings → Environment
              Variables</strong>, add <code className="text-gold-2">ADMIN_PASSWORD</code> (at least 8 characters), then redeploy.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
