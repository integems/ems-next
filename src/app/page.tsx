"use client";
import DashboardPage from "@/components/dashboard/DashboardPage";
import EnvironmentalMonitoringSection from "@/components/EnvironmentalMonitoringSection";
import { HeroCarousel } from "@/components/HeroCarousel";
import NavComponent from "@/components/NavComponent";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

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
      media:"images/caroucel1.jpg",
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
     media:"images/caroucel4.jpg",
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
     media:"images/caroucel3.jpg",
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
        </main>
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} EMS. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
