"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MonitoringDetailPageProps {
  title: string;
  description: string;
  image: string;
  children: React.ReactNode;
}

const MonitoringDetailPage: React.FC<MonitoringDetailPageProps> = ({
  title,
  description,
  image,
  children,
}) => {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto px-4"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80 mx-auto">
              {description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Back Button and Content */}
      <div className="container mx-auto -mt-16 px-4">
        <div className="relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-background border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

            <div className="bg-card p-6 sm:p-8 rounded-xl shadow-lg border border-border">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
      <div className="h-24" />
    </div>
  );
};

export default MonitoringDetailPage;
