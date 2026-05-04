"use client";

import { useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "zoom";
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = ref.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(entry.isIntersecting);
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -70px 0px",
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  const directionClass = {
    up: visible
      ? "translate-y-0 opacity-100 blur-0"
      : "translate-y-8 opacity-0 blur-sm",
    down: visible
      ? "translate-y-0 opacity-100 blur-0"
      : "-translate-y-8 opacity-0 blur-sm",
    left: visible
      ? "translate-x-0 opacity-100 blur-0"
      : "translate-x-8 opacity-0 blur-sm",
    right: visible
      ? "translate-x-0 opacity-100 blur-0"
      : "-translate-x-8 opacity-0 blur-sm",
    zoom: visible
      ? "scale-100 opacity-100 blur-0"
      : "scale-95 opacity-0 blur-sm",
  }[direction];

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      className={`transform-gpu transition-all duration-700 ease-out ${directionClass} ${className}`}
    >
      {children}
    </div>
  );
}