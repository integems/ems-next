"use client";
import { Card } from "@/components/ui/card";
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
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
    borderColor: "hover:border-blue-500/50",
    image:"images/air1.JPG",
  },
  {
    icon: Droplets,
    title: "Water Quality",
    description:
      "Track water parameters such as pH, turbidity, and dissolved oxygen.",
    href: "/water",
    gradient: "from-cyan-500/10 to-teal-500/10",
    iconColor: "text-cyan-500",
    borderColor: "hover:border-cyan-500/50",
    image:"images/water1.jpg",
  },
  {
    icon: Sprout,
    title: "Soil Quality",
    description: "Analyze soil composition, moisture, and nutrient levels.",
    href: "/soil",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500",
    borderColor: "hover:border-green-500/50",
    image:"images/soil1.jpg",
  },
  {
    icon: Bird,
    title: "Biodiversity",
    description:
      "Record and monitor the variety of life in a particular habitat.",
    href: "/biodiversity",
    gradient: "from-emerald-500/10 to-lime-500/10",
    iconColor: "text-emerald-500",
    borderColor: "hover:border-emerald-500/50",
    image:"images/biodiversity1.jpg",
  },
  {
    icon: Volume2,
    title: "Noise",
    description: "Monitor noise pollution levels in various environments.",
    href: "/noise",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-500",
    borderColor: "hover:border-purple-500/50",
    image:"images/noise1.jpg",
  },
  {
    icon: Trash2,
    title: "Waste",
    description: "Track and manage different types of waste.",
    href: "/waste",
    gradient: "from-orange-500/10 to-red-500/10",
    iconColor: "text-orange-500",
    borderColor: "hover:border-orange-500/50",
    image:"images/waste1.jpg",
  },
];

export default function EnvironmentalMonitoringSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      ref={ref}
      className="py-12 md:py-24 lg:py-32 bg-background"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Environmental <span className="text-primary">Monitoring</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Comprehensive monitoring solutions for tracking and analyzing
            environmental data across multiple domains
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monitoringFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={feature.href} className="block h-full">
                  <Card
                    className={`h-full bg-card border-border hover:border-muted-foreground/30 transition-all duration-300 hover:shadow-lg group overflow-hidden flex flex-col p-0`}
                  >
                    {/* Image Header */}
                    <div className="relative h-64 overflow-hidden flex-shrink-0">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                      {/* Icon Badge */}
                      <div
                        className={`absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm shadow-lg border border-border`}
                      >
                        <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3 flex-grow">
                        {feature.description}
                      </p>
                      <div className="inline-flex items-center text-foreground font-medium text-sm group/link">
                        <span>Learn More</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
