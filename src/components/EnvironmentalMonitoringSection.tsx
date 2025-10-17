"use client";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Bird, Droplets, Sprout, Trash2, Volume2, Wind } from "lucide-react";
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
  },
  {
    icon: Droplets,
    title: "Water Quality",
    description: "Track water parameters such as pH, turbidity, and dissolved oxygen.",
    href: "/water",
    gradient: "from-cyan-500/10 to-teal-500/10",
    iconColor: "text-cyan-500",
    borderColor: "hover:border-cyan-500/50",
  },
  {
    icon: Sprout,
    title: "Soil Health",
    description: "Analyze soil composition, moisture, and nutrient levels.",
    href: "/soil",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500",
    borderColor: "hover:border-green-500/50",
  },
  {
    icon: Bird,
    title: "Biodiversity",
    description: "Record and monitor the variety of life in a particular habitat.",
    href: "/biodiversity",
    gradient: "from-emerald-500/10 to-lime-500/10",
    iconColor: "text-emerald-500",
    borderColor: "hover:border-emerald-500/50",
  },
  {
    icon: Volume2,
    title: "Noise",
    description: "Monitor noise pollution levels in various environments.",
    href: "/noise",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-500",
    borderColor: "hover:border-purple-500/50",
  },
  {
    icon: Trash2,
    title: "Waste",
    description: "Track and manage different types of waste.",
    href: "/waste",
    gradient: "from-orange-500/10 to-red-500/10",
    iconColor: "text-orange-500",
    borderColor: "hover:border-orange-500/50",
  },
];

export default function EnvironmentalMonitoringSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" ref={ref} className="py-12 md:py-24 lg:py-32 bg-background">
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
            Comprehensive monitoring solutions for tracking and analyzing environmental data across multiple domains
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
                <Card className={`h-full bg-card border-border ${feature.borderColor} transition-all duration-300 hover:shadow-lg group`}>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} border border-primary/20 mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                      {feature.description}
                    </p>
                    <Link href={feature.href} className="inline-flex items-center text-primary font-medium group/link">
                      <span>Learn More</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}