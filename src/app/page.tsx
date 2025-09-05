import NavComponent from "@/components/NavComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function HomePage() {
  return (
    <>
      <NavComponent />

      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary text-primary-foreground">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                      Environmental Monitoring System
                    </h1>
                    <p className="max-w-[600px] md:text-xl">
                      Monitor, analyze, and visualize environmental data with
                      ease.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button asChild>
                      <a href="/dashboard">Get Started</a>
                    </Button>
                  </div>
                </div>
                <div className="w-full h-64 bg-gray-300 rounded-xl"></div>
              </div>
            </div>
          </section>
          <section id="features" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                  <h3 className="text-xl font-bold">Air Quality</h3>
                  <p className="text-center text-muted-foreground">
                    Monitor air pollutants like PM2.5, PM10, CO, SO2, and NO2.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                  <h3 className="text-xl font-bold">Water Quality</h3>
                  <p className="text-center text-muted-foreground">
                    Track water parameters such as pH, turbidity, and dissolved
                    oxygen.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                  <h3 className="text-xl font-bold">Soil Health</h3>
                  <p className="text-center text-muted-foreground">
                    Analyze soil composition, moisture, and nutrient levels.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                  <h3 className="text-xl font-bold">Biodiversity</h3>
                  <p className="text-center text-muted-foreground">
                    Record and monitor the variety of life in a particular
                    habitat.
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section
            id="contact"
            className="w-full py-12 md:py-24 lg:py-32 bg-muted"
          >
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Contact Us
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Have questions or want to get in touch? Fill out the form
                  below.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <form className="flex flex-col space-y-2">
                  <Input placeholder="Name" />
                  <Input type="email" placeholder="Email" />
                  <Textarea placeholder="Message" />
                  <Button type="submit">Submit</Button>
                </form>
              </div>
            </div>
          </section>
        </main>
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 EMS. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
