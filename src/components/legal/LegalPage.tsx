import Link from "next/link";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#05070c] px-5 py-16 text-slate-200">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-[#0ef2b1] hover:underline">← Back to beew.ai</Link>
        <h1 className="mt-8 text-4xl font-black text-white">{title}</h1>
        <p className="mt-3 text-sm text-slate-400">Effective date: July 15, 2026</p>
        <div className="mt-10 space-y-7 leading-7 text-slate-300 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_a]:text-[#0ef2b1] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
          {children}
        </div>
      </article>
    </main>
  );
}
