"use client";
import DashboardPage from "@/components/dashboard/DashboardPage";
import EnvironmentalMonitoringSection from "@/components/EnvironmentalMonitoringSection";
import Galaxy from "@/components/Galaxy";
import NavComponent from "@/components/NavComponent";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

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

  return (
    <>
      <div className="z-50">
        <NavComponent />
      </div>

      <div>
        <main className="flex-1 mx-auto">
          <section className="w-full h-[80vh] min-h-[500px] relative flex items-center justify-center">
            <div className="absolute inset-0 z-0 w-full h-full">
              <Galaxy
                mouseRepulsion={true}
                mouseInteraction={true}
                density={1.5}
                glowIntensity={0.5}
                saturation={0.8}
                hueShift={240}
              />
            </div>
            <div className="absolute inset-0 z-5 bg-black/5  pointer-events-none"></div>
            <div className="relative z-10 text-center pointer-events-auto">
              <div className="w-full">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                      <span>Environmental</span>{" "}
                      <span className="text-primary">Monitoring</span>{" "}
                      <span>System</span>
                    </h1>
                    <p className="max-w-[600px] md:text-xl mx-auto">
                      Monitor, analyze, and visualize environmental data with
                      ease.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row pointer-events-auto">
                    <Button
                      variant="outline"
                      onClick={handleGetStarted}
                      className="text-primary outline-primary pointer-events-auto"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="animate-caret-blink ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="max-w-6xl mx-auto mb-20">
            <EnvironmentalMonitoringSection/>
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
