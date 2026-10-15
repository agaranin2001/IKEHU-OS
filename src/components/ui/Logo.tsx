import Image from "next/image";
import { BRAND } from "@/config/brand";
import { cn } from "./cn";

/** Brand mark: "H" bond inside a rounded square. The light file is a cream-to-mint recolour for dark surfaces. */
export function LogoMark({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return <Image src={tone === "dark" ? "/brand/logo-mark.png" : "/brand/logo-mark-light.png"} alt="" width={256} height={256} className={cn("size-7", className)} aria-hidden />;
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark tone={tone} />
      <span className={cn("text-[22px] font-normal tracking-tight", tone === "dark" ? "text-forest" : "text-cream")}>{BRAND.name}</span>
    </span>
  );
}
