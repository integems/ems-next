"use client";
import ContactSection from "@/components/ContactSection";
import DashboardPage from "@/components/dashboard/DashboardPage";
import EnvironmentalMonitoringSection from "@/components/EnvironmentalMonitoringSection";
import { HeroCarousel } from "@/components/HeroCarousel";
import NavComponent from "@/components/NavComponent";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Github,
  Globe,
  Linkedin,
  Mail,
  MessageSquare,
  Sparkles,
  Twitter,
} from "lucide-react";
import Image from "next/image";

interface Slide {
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

export default function HomePage() {
  const currentYear = new Date().getFullYear();
  const { currentUser } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (currentUser.isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/signin");
    }
  };

  const handleLearnMore = () => {
    // Scroll to environmental monitoring section
    const section = document.getElementById("environmental-monitoring");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const slides: Slide[] = [
    {
      type: "image",
      media: "/images/caroucel1.jpeg",
      title: "Environmental Monitoring System",
      description:
        "Monitor, analyze, and visualize environmental data with cutting-edge technology and real-time insights.",
      cta: {
        primary: "Get Started",
        secondary: "Learn More",
      },
    },
    {
      type: "image",
      media: "/images/caroucel4.jpg",
      title: "Data-Driven Insights",
      description:
        "Transform raw environmental data into actionable insights with powerful analytics and visualization tools.",
      cta: {
        primary: "Explore Features",
        secondary: "View Demo",
      },
    },
    {
      type: "image",
      media: "/images/caroucel3.jpeg",
      title: "Protect Our Planet",
      description:
        "Join the mission to create a sustainable future through comprehensive environmental monitoring and conservation.",
      cta: {
        primary: "Join Now",
        secondary: "Our Mission",
      },
    },
  ];

  return (
    <>
      <div className="z-50 relative">
        <NavComponent />
      </div>

      <div>
        <main className="flex-1 mx-auto">
          <section className="w-full h-[75vh] sm:h-[85vh] md:h-[90vh] min-h-[480px] relative">
            <HeroCarousel
              slides={slides}
              onPrimaryClick={handleGetStarted}
              onSecondaryClick={handleLearnMore}
            />
          </section>
          <div className="relative overflow-hidden">
            {/* Decorative background */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background via-emerald-50/50 to-background dark:from-background dark:via-emerald-950/20 dark:to-background" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_60%,transparent_100%)]" />
            <div className="pointer-events-none absolute left-1/2 -top-24 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 top-32 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 top-1/3 -z-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

            <div
              className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-20"
              id="environmental-monitoring"
            >
              <EnvironmentalMonitoringSection />
            </div>

            {/* AI Assistant showcase */}
            <section
              id="ai-assistant"
              className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24 scroll-mt-24"
            >
              {/* ── Text row ── */}
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  Chat with your{" "}
                  <span className="text-primary">environmental data</span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Skip the dashboards and just ask. The Environmental AI
                  Assistant turns raw air, water, soil, noise, biodiversity, and
                  waste readings into clear answers, trends, and recommendations
                  — in plain language, on demand.
                </p>

                <div className="mt-8 flex justify-center">
                  <Link
                    href="/ai-chatbot"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                  >
                    <Sparkles className="h-4 w-4" />
                    Try the AI Assistant
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* ── Feature row (Cardless Listing Redesign) ── */}
              <ul className="mx-auto mt-16 grid max-w-5xl gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 border-t border-border/40 pt-10">
                {[
                  {
                    icon: MessageSquare,
                    title: "Natural-language queries",
                    desc: "Ask about any location or metric and get instant, contextual insights.",
                  },
                  {
                    icon: BarChart3,
                    title: "Interactive analysis",
                    desc: "Open rich charts and breakdowns for each environmental domain in chat.",
                  },
                  {
                    icon: FileText,
                    title: "Report mode",
                    desc: "Generate formal, structured reports ready to share with stakeholders.",
                  },
                  {
                    icon: Globe,
                    title: "Web-enhanced context",
                    desc: "Enrich answers with up-to-date information from the web when needed.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <li
                    key={title}
                    className="flex flex-col items-start text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="text-sm font-bold tracking-tight text-foreground">
                        {title}
                      </h3>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground pl-1">
                      {desc}
                    </p>
                  </li>
                ))}
              </ul>

              {/* ── Screenshots row ── */}
              <div className="mt-16 grid gap-6 sm:grid-cols-2">
                {[
                  {
                    light: "/chatbot-1.png",
                    lightSize: { w: 1780, h: 1000 },
                    dark: "/dark-chatbot-1.png",
                    darkSize: { w: 1750, h: 985 },
                  },
                  {
                    light: "/chatbot-2.png",
                    lightSize: { w: 1791, h: 993 },
                    dark: "/dark-chatbot-2.png",
                    darkSize: { w: 1783, h: 1002 },
                  },
                ].map((shot) => (
                  <div key={shot.light} className="relative">
                    <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-emerald-500/10 to-transparent blur-2xl" />
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/10 dark:shadow-black/40">
                      {/* Browser chrome */}
                      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/50 px-4 py-2.5">
                        <span className="h-3 w-3 rounded-full bg-red-400/80" />
                        <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                        <span className="h-3 w-3 rounded-full bg-green-400/80" />
                        <div className="ml-3 flex items-center gap-1.5 rounded-md bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                          <Sparkles className="h-3 w-3 text-primary" />
                          Environmental AI Assistant
                        </div>
                      </div>
                      {/* Light-mode screenshot */}
                      <Image
                        src={shot.light}
                        alt="Environmental AI Assistant chat room"
                        width={shot.lightSize.w}
                        height={shot.lightSize.h}
                        quality={100}
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="block h-auto w-full dark:hidden"
                      />
                      {/* Dark-mode screenshot */}
                      <Image
                        src={shot.dark}
                        alt="Environmental AI Assistant chat room"
                        width={shot.darkSize.w}
                        height={shot.darkSize.h}
                        quality={100}
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="hidden h-auto w-full dark:block"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-20">
              <DashboardPage />
            </div>

            <ContactSection />
          </div>
        </main>
        <footer className="w-full bg-primary dark:bg-zinc-950 border-t border-white/20 dark:border-zinc-800">
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
              {/* Brand */}
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-2 text-2xl font-black">
                  <Image src="/logo.png" alt="INTEGEMS Logo" width={40} height={40} className="object-contain" />
                  <span className="text-white">EMS</span>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-white/80 dark:text-zinc-400">
                  Environmental Monitoring System — monitor, analyze, and
                  visualize environmental data in real time for a more
                  sustainable future.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="#"
                    aria-label="Twitter"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 dark:bg-zinc-900/40 text-white dark:text-zinc-300 transition-colors hover:bg-white/20 dark:hover:bg-zinc-900/60"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 dark:bg-zinc-900/40 text-white dark:text-zinc-300 transition-colors hover:bg-white/20 dark:hover:bg-zinc-900/60"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    aria-label="GitHub"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 dark:bg-zinc-900/40 text-white dark:text-zinc-300 transition-colors hover:bg-white/20 dark:hover:bg-zinc-900/60"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Quick links */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white dark:text-zinc-200">
                  Quick Links
                </h3>
                <ul className="space-y-2 text-sm text-white/75 dark:text-zinc-400">
                  <li>
                    <a
                      href="#environmental-monitoring"
                      className="transition-colors hover:text-white dark:hover:text-zinc-200"
                    >
                      Monitoring
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      className="transition-colors hover:text-white dark:hover:text-zinc-200"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      className="transition-colors hover:text-white dark:hover:text-zinc-200"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/signin"
                      className="transition-colors hover:text-white dark:hover:text-zinc-200"
                    >
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white dark:text-zinc-200">
                  Contact
                </h3>
                <ul className="space-y-2 text-sm text-white/75 dark:text-zinc-400">
                  <li>
                    <a
                      href="mailto:info@integems.com"
                      className="flex items-center gap-2 transition-colors hover:text-white dark:hover:text-zinc-200"
                    >
                      <Mail className="h-4 w-4" />
                      info@integems.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/20 dark:border-zinc-800 pt-6 sm:flex-row text-xs text-white/60 dark:text-zinc-500">
              <p>
                &copy; {currentYear} EMS. All rights reserved.
              </p>
              <p>
                Developed by{" "}
                <a
                  href="https://integemsgroup.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white dark:hover:text-zinc-200 transition-colors font-semibold"
                >
                  INTEGEMS Limited
                </a>
              </p>
              <p>
                Environmental Monitoring System
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}