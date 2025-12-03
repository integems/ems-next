"use client";
import MonitoringDetailPage from "@/components/MonitoringDetailPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SoilPage = () => {
  const soilQualityData = {
    title: "Soil Quality",
    description: "Analyze soil composition, moisture, and nutrient levels.",
    image:"images/soil1.jpg",
  };

  return (
    <MonitoringDetailPage
      title={soilQualityData.title}
      description={soilQualityData.description}
      image={soilQualityData.image}
    >
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        Soil Quality Parameters
      </h2>
      <p className="mb-6 text-muted-foreground">
        This page provides a detailed explanation of each parameter used in our
        soil quality monitoring process. These parameters are vital for
        assessing soil health, agricultural productivity, and environmental
        sustainability.
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
              A measure of soil acidity or alkalinity that affects nutrient
              availability and chemical processes essential for plant growth.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nitrogen (N)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">ppm or mg/kg</span>
            </p>
            <p className="text-muted-foreground mt-2">
              A crucial macronutrient for plant growth, being a major component
              of chlorophyll and amino acids. Its level indicates soil
              fertility.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phosphorus (P)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">ppm or mg/kg</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Essential for photosynthesis, energy transfer, and nutrient
              transport, indicating the soil's ability to support healthy
              plants.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Potassium (K)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">ppm or mg/kg</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Important for regulating water in plants and activating enzymes,
              contributing to overall plant health and vigor.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organic Matter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">%</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Decomposed plant and animal tissue that improves soil structure,
              water retention, and nutrient supply.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moisture</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">%</span>
            </p>
            <p className="text-muted-foreground mt-2">
              The amount of water stored in the soil, affecting plant growth and
              the movement of nutrients and contaminants.
            </p>
          </CardContent>
        </Card>
      </div>
    </MonitoringDetailPage>
  );
};

export default SoilPage;
