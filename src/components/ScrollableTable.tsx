"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface ScrollableTableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Overlays floating left/right arrow buttons on a horizontally scrollable
 * table. An arrow is "active" (primary background, white icon) only while
 * there is more content to scroll in that direction; otherwise it fades out
 * and becomes non-interactive.
 *
 * Note: the shadcn `<Table>` renders its own `overflow-auto` wrapper, so the
 * element that actually scrolls is a descendant rather than this component's
 * wrapper. We locate that scroller at runtime and drive it directly.
 */
export function ScrollableTable({ children, className }: ScrollableTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // The real horizontal scroller is the <table>'s parent (the Table
    // component's `overflow-auto` wrapper), not our own container.
    const table = container.querySelector("table");
    const scroller = (table?.parentElement as HTMLElement | null) ?? container;
    scrollerRef.current = scroller;

    updateScrollState();
    scroller.addEventListener("scroll", updateScrollState, { passive: true });

    // Recompute when either the scroller OR the table itself resizes — the
    // table grows wider as data/columns load, which is when arrows must appear.
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(scroller);
    if (table) observer.observe(table);

    return () => {
      scroller.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, children]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const arrowBase =
    "absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-all duration-200";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll("left")}
        tabIndex={canScrollLeft ? 0 : -1}
        className={cn(
          arrowBase,
          "left-2",
          canScrollLeft
            ? "bg-primary text-white opacity-100 hover:bg-primary/90"
            : "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll("right")}
        tabIndex={canScrollRight ? 0 : -1}
        className={cn(
          arrowBase,
          "right-2",
          canScrollRight
            ? "bg-primary text-white opacity-100 hover:bg-primary/90"
            : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {children}
    </div>
  );
}
