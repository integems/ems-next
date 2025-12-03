"use client";
import MonitoringDetailPage from "@/components/MonitoringDetailPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BiodiversityPage = () => {
  const biodiversityData = {
    title: "Biodiversity",
    description: "Record and monitor the variety of life in a particular habitat.",
    image:"images/biodiversity1.jpg",
  };

  return (
    <MonitoringDetailPage
      title={biodiversityData.title}
      description={biodiversityData.description}
      image={biodiversityData.image}
    >
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        Biodiversity Parameters
      </h2>
      <p className="mb-6 text-muted-foreground">
        This page provides a detailed explanation of each parameter used in our
        biodiversity monitoring process. These metrics help us understand the
        variety and variability of life in a particular habitat or ecosystem.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Species Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">Unit: <span className="font-normal">Integer</span></p>
            <p className="text-muted-foreground mt-2">
              A simple count of the number of different species in a given
              area, indicating the richness of an ecosystem.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shannon-Wiener Diversity Index (H')</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">Unit: <span className="font-normal">Dimensionless</span></p>
            <p className="text-muted-foreground mt-2">
              Characterizes species diversity by accounting for both species
              abundance and evenness. Higher values indicate greater diversity.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">Unit: <span className="font-normal">JSON object</span></p>
            <p className="text-muted-foreground mt-2">
              Detailed observational data, including species lists and counts,
              crucial for in-depth analysis and tracking changes over time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mt-2">
              The type of area (e.g., industrial, residential) where the
              measurement was taken, providing context for biodiversity levels.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mt-2">
              Categorizes when the observation was made (e.g., day, night) to
              correctly interpret the activity of time-dependent species.
            </p>
          </CardContent>
        </Card>
      </div>
    </MonitoringDetailPage>
  );
};

export default BiodiversityPage;
