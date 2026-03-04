import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

interface StatCounterProps {
  end: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
  decimals?: number;
}

export default function StatCounter({ end, prefix = "", suffix = "", label, duration = 2000, decimals = 0 }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const startTime = useRef<number>(0);
  const animationFrame = useRef<number>(0);

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
      startTime.current = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(eased * end);

        if (progress < 1) {
          animationFrame.current = requestAnimationFrame(animate);
        }
      };

      animationFrame.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [inView, hasAnimated, end, duration]);

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toString();

  return (
    <div ref={ref} className="text-center" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="font-display text-4xl sm:text-5xl lg:text-6xl text-gold tracking-wide">
        {prefix}{displayValue}{suffix}
      </div>
      <div className="text-slate-400 text-sm sm:text-base mt-2 font-medium">{label}</div>
    </div>
  );
}
