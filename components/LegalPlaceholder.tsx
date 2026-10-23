import Link from "next/link";

export default function LegalPlaceholder({ title }: { title: string }) {
  return (
    <main id="main" className="flex min-h-svh items-center py-24">
      <div className="container-x max-w-2xl">
        <Link href="/" className="font-display text-sm font-semibold tracking-[0.32em] text-fg hover:text-gold-2">
          JACE SULLIVAN
        </Link>
        <span className="dev-tag mt-12">Placeholder page</span>
        <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-6 leading-relaxed text-fg-2">
          This page is a placeholder. The final {title.toLowerCase()} has not been published yet and must be added
          before the site collects real applications.
        </p>
        <Link href="/" className="btn btn-ghost mt-10">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
