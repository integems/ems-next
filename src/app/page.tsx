"use client";
import DashboardPage from "@/components/dashboard/DashboardPage";
import Galaxy from "@/components/Galaxy";
import NavComponent from "@/components/NavComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
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
            <section id="features" className="w-full py-12 md:py-24 lg:py-32">
              <div className="container px-4 md:px-6">
                <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
                  <div className="group flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                    <h3 className="text-xl font-bold">Air Quality</h3>
                    <p className="text-center text-muted-foreground">
                      Monitor air pollutants like PM2.5, PM10, CO, SO2, and NO2.
                    </p>
                    <Link
                      href="/air"
                      className="flex items-center text-primary"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="group flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                    <h3 className="text-xl font-bold">Water Quality</h3>
                    <p className="text-center text-muted-foreground">
                      Track water parameters such as pH, turbidity, and
                      dissolved oxygen.
                    </p>
                    <Link
                      href="/water"
                      className="flex items-center text-primary"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="group flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                    <h3 className="text-xl font-bold">Soil Health</h3>
                    <p className="text-center text-muted-foreground">
                      Analyze soil composition, moisture, and nutrient levels.
                    </p>
                    <Link
                      href="/soil"
                      className="flex items-center text-primary"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="group flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                    <h3 className="text-xl font-bold">Biodiversity</h3>
                    <p className="text-center text-muted-foreground">
                      Record and monitor the variety of life in a particular
                      habitat.
                    </p>
                    <Link
                      href="/biodiversity"
                      className="flex items-center text-primary"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="group flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                    <h3 className="text-xl font-bold">Noise</h3>
                    <p className="text-center text-muted-foreground">
                      Monitor noise pollution levels in various environments.
                    </p>
                    <Link
                      href="/noise"
                      className="flex items-center text-primary"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="group flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                    <h3 className="text-xl font-bold">Waste</h3>
                    <p className="text-center text-muted-foreground">
                      Track and manage different types of waste.
                    </p>
                    <Link
                      href="/waste"
                      className="flex items-center text-primary"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
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
