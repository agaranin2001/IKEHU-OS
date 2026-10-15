import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "mint" | "ghost" | "outline-light" | "link";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-white hover:bg-forest-2 rounded-btn",
  secondary: "border border-forest text-forest bg-transparent hover:bg-forest hover:text-white rounded-btn",
  mint: "bg-mint text-deep hover:bg-[#5dffb0] rounded-btn",
  ghost: "text-ink-2 hover:bg-stone rounded-btn",
  "outline-light": "border border-cream/60 text-cream hover:bg-cream hover:text-deep rounded-btn",
  link: "text-forest underline-offset-4 hover:underline px-0! h-auto!",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-[42px] px-6 text-base",
  lg: "h-12 px-7 text-base",
};

export interface ButtonStyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function buttonClass({ variant = "primary", size = "md", className }: ButtonStyleProps = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({ variant, size, className, ...props }: ComponentProps<"button"> & ButtonStyleProps) {
  return <button type="button" className={buttonClass({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: { href: string; children: ReactNode } & ButtonStyleProps & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}
