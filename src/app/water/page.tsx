"use client";
import MonitoringDetailPage from "@/components/MonitoringDetailPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WaterPage = () => {
  const waterQualityData = {
    title: "Water Quality",
    description:
      "Track water parameters such as pH, turbidity, and dissolved oxygen.",
    image: "images/water1.png",
  };

  return (
    <MonitoringDetailPage
      title={waterQualityData.title}
      description={waterQualityData.description}
      image={waterQualityData.image}
    >
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        Water Quality Parameters
      </h2>
      <p className="mb-6 text-muted-foreground">
        This page provides a detailed explanation of each parameter used in our
        water quality monitoring process. These parameters are essential for
        assessing water health for various purposes, including drinking,
        agriculture, and aquatic life support.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>pH</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">pH units</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Measures how acidic or basic water is, affecting nutrient
              solubility and the biological availability of chemical
              constituents.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dissolved Oxygen (DO)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">ppm or % saturation</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Indicates the amount of oxygen dissolved in water, crucial for
              supporting aquatic life. Low levels can signal pollution.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Turbidity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">FNU</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Measures water clarity. High turbidity from suspended particles
              can harm aquatic life by reducing sunlight and clogging gills.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Dissolved Solids (TDS)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">ppm</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Represents the total amount of dissolved minerals, salts, or
              metals in water, affecting its purity and taste.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biochemical Oxygen Demand (BOD)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">mg/L</span>
            </p>
            <p className="text-muted-foreground mt-2">
              The amount of oxygen needed by aerobic organisms to break down
              organic material, indicating the organic quality of water.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chemical Oxygen Demand (COD)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">mg/L</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Measures the total oxygen-consuming substances in water, providing
              an index of the degree of pollution.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Electrical Conductivity (EC)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">µS/cm</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Indicates the water's ability to conduct electricity, which is
              related to the concentration of dissolved salts and nutrients.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">°C</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Affects the rate of biological and chemical processes, dissolved
              oxygen levels, and the sensitivity of organisms to toxins.
            </p>
          </CardContent>
        </Card>
      </div>
    </MonitoringDetailPage>
  );
};

export default WaterPage;
