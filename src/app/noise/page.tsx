"use client";
import MonitoringDetailPage from "@/components/MonitoringDetailPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NoisePage = () => {
  const noiseData = {
    title: "Noise Pollution",
    description: "Monitor noise pollution levels in various environments.",
    image:"images/noise1.jpg",
  };

  return (
    <MonitoringDetailPage
      title={noiseData.title}
      description={noiseData.description}
      image={noiseData.image}
    >
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        Noise Pollution Parameters
      </h2>
      <p className="mb-6 text-muted-foreground">
        This page explains the various parameters collected for noise pollution
        monitoring. Understanding these parameters is key to interpreting the
        data correctly.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>LAeq - Equivalent Continuous Sound Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">dB(A)</span>
            </p>
            <p className="text-muted-foreground mt-2">
              The average sound energy over a period, converting fluctuating
              noise into a steady level for assessing long-term exposure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LAFMax - Maximum Sound Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">dB(A)</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Captures the peak noise level, vital for identifying short, loud
              noise events like car horns or door slams.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LAFMin - Minimum Sound Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">dB(A)</span>
            </p>
            <p className="text-muted-foreground mt-2">
              The lowest sound level recorded, helping to establish a baseline
              noise floor for comparison.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LA10 - Statistical Noise Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">dB(A)</span>
            </p>
            <p className="text-muted-foreground mt-2">
              The noise level exceeded for 10% of the time, often used to
              describe traffic noise and intrusive events.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LA90 - Background Noise Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">dB(A)</span>
            </p>
            <p className="text-muted-foreground mt-2">
              The noise level exceeded for 90% of the time, representing the
              ambient or background noise of a location.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">Hertz (Hz)</span>
            </p>
            <p className="text-muted-foreground mt-2">
              The pitch of a sound, important for identifying its source and
              designing effective noise control measures.
            </p>
          </CardContent>
        </Card>
      </div>
    </MonitoringDetailPage>
  );
};

export default NoisePage;
