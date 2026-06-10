"use client";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Bird,
  Droplets,
  Sprout,
  Trash2,
  Volume2,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

const monitoringFeatures = [
  {
    icon: Wind,
    title: "Air Quality",
    description: "Monitor air pollutants like PM2.5, PM10, CO, SO2, and NO2.",
    href: "/air",
    image: "images/air1.JPG",
  },
  {
    icon: Droplets,
    title: "Water Quality",
    description:
      "Track water parameters such as pH, turbidity, and dissolved oxygen.",
    href: "/water",
    image: "images/water1.png",
  },
  {
    icon: Sprout,
    title: "Soil Quality",
    description: "Analyze soil composition, moisture, and nutrient levels.",
    href: "/soil",
    image: "images/soil.JPG",
  },
  {
    icon: Bird,
    title: "Biodiversity",
    description:
      "Record and monitor the variety of life in a particular habitat.",
    href: "/biodiversity",
    image: "images/bio1.jpeg",
  },
  {
    icon: Volume2,
    title: "Noise Quality",
    description: "Monitor noise pollution levels in various environments.",
    href: "/noise",
    image: "images/noise1.jpg",
  },
  {
    icon: Trash2,
    title: "Waste Management",
    description: "Track and manage different types of waste.",
    href: "/waste",
    image: "images/waste1.jpg",
  },
];

export default function EnvironmentalMonitoringSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="py-16 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-14"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            What we monitor
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Environmental Monitoring
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Comprehensive solutions for tracking and analyzing environmental
            data across multiple domains.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monitoringFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Link href={feature.href} className="block h-full group">
                  <div className="relative h-full rounded-2xl bg-card overflow-hidden flex flex-col shadow-md shadow-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/10 dark:shadow-black/20 dark:hover:shadow-black/40">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden flex-shrink-0 bg-muted">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      {/* Subtle bottom scrim — dark only so it doesn't bleach images in light mode */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent dark:from-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-grow p-5 gap-3">
                      {/* Icon + Title row */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {feature.title}
                        </h3>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                        {feature.description}
                      </p>

                      {/* CTA */}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-primary/80 group-hover:text-primary transition-colors pt-1">
                        <span>Explore</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
