"use client";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

export interface Slide {
  type: "image" | "video";
  media: string;
  badge?: string;
  title: string;
  description: string;
  cta?: {
    primary: string;
    secondary?: string;
  };
}

interface HeroCarouselProps {
  slides: Slide[];
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  onPrimaryClick,
  onSecondaryClick,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  const DURATION = 5000;

  useEffect(() => {
    setProgress(0);
    if (!isAutoPlaying) return;

    const startTime = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
    }, 30);

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setProgress(0);
    }, DURATION);

    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [isAutoPlaying, currentSlide, slides.length]);

  const pause = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    pause();
  };
  const nextSlide = () => {
    setCurrentSlide((p) => (p + 1) % slides.length);
    pause();
  };
  const prevSlide = () => {
    setCurrentSlide((p) => (p - 1 + slides.length) % slides.length);
    pause();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0",
          )}
        >
          {/* Media */}
          {slide.type === "image" && (
            <img
              src={slide.media}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {slide.type === "video" && (
            <video
              src={slide.media}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Scrim — bottom + left weighted for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

          {/* Content — anchored to bottom-left */}
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-8 md:px-16 pb-20 md:pb-28">
              <div
                className={cn(
                  "max-w-xl transition-all duration-700 ease-out",
                  index === currentSlide
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6",
                )}
              >
                {slide.badge && (
                  <span className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 text-xs font-semibold tracking-widest uppercase text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    {slide.badge}
                  </span>
                )}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="mt-4 max-w-lg text-base md:text-lg text-white/80 leading-relaxed drop-shadow">
                  {slide.description}
                </p>
                {slide.cta && (
                  <div className="flex flex-wrap items-center gap-3 mt-7">
                    <Button
                      onClick={onPrimaryClick}
                      size="lg"
                      className="group rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-7 shadow-lg"
                    >
                      {slide.cta.primary}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    {slide.cta.secondary && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={onSecondaryClick}
                        className="rounded-full border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white backdrop-blur-sm font-medium px-7"
                      >
                        {slide.cta.secondary}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      {[
        {
          fn: prevSlide,
          side: "left-4 md:left-6",
          Icon: ChevronLeft,
          label: "Previous slide",
        },
        {
          fn: nextSlide,
          side: "right-4 md:right-6",
          Icon: ChevronRight,
          label: "Next slide",
        },
      ].map(({ fn, side, Icon, label }) => (
        <button
          key={label}
          onClick={fn}
          aria-label={label}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-20",
            "p-2.5 rounded-full",
            "bg-white/10 hover:bg-white/20 backdrop-blur-md",
            "border border-white/20 hover:border-white/40",
            "text-white transition-all duration-200 group",
            side,
          )}
        >
          <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>
      ))}

      {/* Bottom controls: slide counter + progress dots */}
      <div className="absolute bottom-7 right-8 md:right-16 z-20 flex items-center gap-3">
        {/* Slide counter */}
        <span className="text-xs font-medium text-white/50 tabular-nums">
          {currentSlide + 1} / {slides.length}
        </span>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="relative h-0.5 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: index === currentSlide ? 32 : 16 }}
            >
              {/* Track */}
              <span className="absolute inset-0 bg-white/30 rounded-full" />
              {/* Fill */}
              <span
                className="absolute inset-y-0 left-0 bg-white rounded-full transition-none"
                style={{
                  width:
                    index === currentSlide
                      ? `${progress}%`
                      : index < currentSlide
                        ? "100%"
                        : "0%",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
