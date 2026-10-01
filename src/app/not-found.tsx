import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
      <p className="text-8xl font-mediumer text-neutral-200">404</p>
      <h1 className="mt-2 text-3xl font-medium">Page not found</h1>
      <p className="mt-2 text-muted">Looks like this dish isn&apos;t on the menu.</p>
      <Link href="/" className="btn-press mt-6 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-cream hover:bg-primary-dark">Back home</Link>
    </div>
  );
}
