"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div key={pathname} className="page-transition-wrapper flex-1 flex flex-col min-h-full w-full">
      {/* 顶部微光转场指示条 (Top ambient progress glow bar) */}
      <div
        className={`page-route-glow-bar ${isTransitioning ? "animating" : ""}`}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
