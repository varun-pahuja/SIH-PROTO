import { useEffect, useRef, useState } from 'react';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Count a number up to target with ease-out. Respects prefers-reduced-motion. */
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(() => (prefersReduced() ? target : 0));
  const rafRef = useRef(0);

  useEffect(() => {
    if (prefersReduced()) {
      setValue(target);
      return;
    }
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}
