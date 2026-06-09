"use client";
import ContactSection from "@/components/ContactSection";
import DashboardPage from "@/components/dashboard/DashboardPage";
import EnvironmentalMonitoringSection from "@/components/EnvironmentalMonitoringSection";
import { HeroCarousel } from "@/components/HeroCarousel";
import NavComponent from "@/components/NavComponent";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

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
      media: "images/caroucel1.jpeg",
      badge: "Real-Time Monitoring",
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
      media: "images/caroucel4.jpg",
      badge: "Advanced Analytics",
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
      media: "images/caroucel3.jpeg",
      badge: "Sustainable Future",
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
          <section className="w-full h-[90vh] min-h-[500px] relative">
            <HeroCarousel
              slides={slides}
              onPrimaryClick={handleGetStarted}
              onSecondaryClick={handleLearnMore}
            />
          </section>
          <div
            className="max-w-6xl mx-auto mb-20"
            id="environmental-monitoring"
          >
            <EnvironmentalMonitoringSection />
            <DashboardPage />
          </div>
          <ContactSection />
        </main>
        <footer className="w-full bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
              {/* Brand */}
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-1 text-2xl font-black">
                  <span>E</span>
                  <span>M</span>
                  <span>S</span>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/80">
                  Environmental Monitoring System — monitor, analyze, and
                  visualize environmental data in real time for a more
                  sustainable future.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="#"
                    aria-label="Twitter"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    aria-label="GitHub"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Quick links */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Quick Links
                </h3>
                <ul className="space-y-2 text-sm text-primary-foreground/80">
                  <li>
                    <a
                      href="#environmental-monitoring"
                      className="transition-colors hover:text-primary-foreground"
                    >
                      Monitoring
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      className="transition-colors hover:text-primary-foreground"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#contact"
                      className="transition-colors hover:text-primary-foreground"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/signin"
                      className="transition-colors hover:text-primary-foreground"
                    >
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Contact
                </h3>
                <ul className="space-y-2 text-sm text-primary-foreground/80">
                  <li>
                    <a
                      href="mailto:info@integems.com"
                      className="flex items-center gap-2 transition-colors hover:text-primary-foreground"
                    >
                      <Mail className="h-4 w-4" />
                      info@integems.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/20 pt-6 sm:flex-row">
              <p className="text-xs text-primary-foreground/70">
                &copy; {currentYear} EMS. All rights reserved.
              </p>
              <p className="text-xs text-primary-foreground/70">
                Environmental Monitoring System
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
