"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number): void => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = (): void => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = (): void => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          }`}
        >
          {/* Media Background */}
          {slide.type === "image" && (
            <img
              src={slide.media}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-fill brightness-90"
            />
          )}
          {slide.type === "video" && (
            <video
              src={slide.media}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover brightness-90"
            />
          )}

          {/* Lighter Gradient Overlay - More visible images */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-16 md:px-20 lg:px-24">
              <div className="max-w-2xl">
                <div className="space-y-6 animate-fade-in">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/95 leading-relaxed drop-shadow-lg font-medium">
                    {slide.description}
                  </p>
                  {slide.cta && (
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button variant="outline" onClick={onPrimaryClick}>
                        {slide.cta.primary}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full transition-all border border-white/40 group shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full transition-all border border-white/40 group shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all shadow-lg ${
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/60 hover:bg-white/80"
            } h-2 rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
