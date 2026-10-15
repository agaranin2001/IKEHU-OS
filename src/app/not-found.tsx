import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-page px-4">
      <div className="text-center">
        <Logo className="justify-center" />
        <h1 className="mt-10 text-[40px] font-light text-ink">Page not found</h1>
        <p className="mt-3 text-ink-2">The record or page you requested is not in this dataset.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-btn border border-forest px-6 py-2.5 font-bold text-forest">Home</Link>
          <Link href="/app" className="rounded-btn bg-forest px-6 py-2.5 font-bold text-white">Open platform</Link>
        </div>
      </div>
    </div>
  );
}
