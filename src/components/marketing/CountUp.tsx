"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates the first number inside a formatted string (e.g. "9.47 GW", "€7.56")
 * from zero to its value when it enters the viewport, keeping prefix, suffix
 * and decimal places. Renders the final value for no-JS and reduced motion.
 */
export function CountUp({ value, duration = 1400, delay = 0 }: { value: string; duration?: number; delay?: number }) {
  const m = value.match(/^(.*?)(-?[\d,]*\.?\d+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!m || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, num, post] = m;
    const target = Number(num.replace(/,/g, ""));
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const fmt = (v: number) => pre + v.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + post;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timer = setTimeout(() => {
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(fmt(target * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }, delay);
      },
      { threshold: 0.4 },
    );
    setDisplay(fmt(0)); // eslint-disable-line react-hooks/set-state-in-effect
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, delay]);

  return (
    <span ref={ref} className="num">
      {display}
    </span>
  );
}
