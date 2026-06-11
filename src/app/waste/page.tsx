"use client";
import MonitoringDetailPage from "@/components/MonitoringDetailPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WastePage = () => {
  const wasteData = {
    title: "Waste Management",
    description: "Track and manage different types of waste.",
    image: "/images/waste1.jpg",
  };

  return (
    <MonitoringDetailPage
      title={wasteData.title}
      description={wasteData.description}
      image={wasteData.image}
    >
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        Waste Management Parameters
      </h2>
      <p className="mb-6 text-muted-foreground">
        This page explains the various parameters collected for waste
        monitoring. Understanding these parameters is crucial for assessing
        waste management strategies and their environmental impact.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Solid Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">kg</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Municipal solid waste (MSW) including food scraps, paper, and
              plastics, indicating consumption patterns and system
              effectiveness.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hazardous Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">kg</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Waste posing threats to public health, such as flammable,
              corrosive, or toxic materials like batteries and pesticides.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recycled Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">kg</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Waste diverted from landfills for reprocessing, a key indicator of
              recycling program success and circular economy transition.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organic Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">kg</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Biodegradable waste from plants or animals. Diverting it from
              landfills helps mitigate methane production.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>E-Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">kg</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Discarded electronic devices containing both valuable and
              hazardous materials, requiring special management.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scrap Metal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">kg</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Discarded metals. Recycling reduces the need for virgin ore
              extraction and saves energy and landfill space.
            </p>
          </CardContent>
        </Card>
      </div>
    </MonitoringDetailPage>
  );
};

export default WastePage;
