"use client";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

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
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Full-bleed Hero Banner ── */}
      <div className="relative w-full h-[55vh] min-h-[380px] max-h-[600px]">
        {/* Background image */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Scrim: dark at bottom and soft at top for the back button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        {/* Back button — top-left over the image */}
        <div className="absolute top-0 left-0 right-0 z-20 container mx-auto px-6 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero text — anchored to bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 container mx-auto px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-white"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-3 text-base sm:text-lg text-white/75 leading-relaxed max-w-2xl"
            >
              {description}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6 sm:p-8"
        >
          {children}
        </motion.div>
      </div>

      <div className="h-16" />
    </div>
  );
};

export default MonitoringDetailPage;
