import MonitoringDetailPage from "@/components/MonitoringDetailPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AirPage = () => {
  const airQualityData = {
    title: "Air Quality",
    description: "Monitor air pollutants like PM2.5, PM10, CO, SO2, and NO2.",
    image: "/images/air1.JPG",
  };

  return (
    <MonitoringDetailPage
      title={airQualityData.title}
      description={airQualityData.description}
      image={airQualityData.image}
    >
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        Air Quality Parameters
      </h2>
      <p className="mb-6 text-muted-foreground">
        This page provides a detailed explanation of each parameter used in our
        air quality monitoring process. A deeper understanding of these terms is
        essential for assessing air pollution and its impact on health and the
        environment.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>PM2.5 - Particulate Matter 2.5</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">µg/m³</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Fine inhalable particles (2.5 micrometers or smaller) that can
              penetrate deep into the lungs and enter the bloodstream, posing
              significant health risks. Sources include combustion engines and
              forest fires.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PM10 - Particulate Matter 10</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">µg/m³</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Inhalable particles (10 micrometers or smaller) that can be
              inhaled into the lungs. Sources include dust from roads,
              construction, and farming.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>NO₂ - Nitrogen Dioxide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">ppb</span>
            </p>
            <p className="text-muted-foreground mt-2">
              A reactive gas formed from burning fuel. It causes respiratory
              issues and contributes to acid rain. Major sources are vehicles
              and industrial emissions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>O₃ - Ozone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">ppb</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Ground-level ozone formed by chemical reactions in sunlight. It is
              a major component of smog and can cause breathing difficulties.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CO - Carbon Monoxide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">ppm</span>
            </p>
            <p className="text-muted-foreground mt-2">
              A harmful gas from incomplete combustion that reduces oxygen in
              the bloodstream. Most emissions come from vehicles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SO₂ - Sulfur Dioxide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">ppb</span>
            </p>
            <p className="text-muted-foreground mt-2">
              A gas from burning fossil fuels that harms the respiratory system
              and contributes to acid rain.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            .
            <p className="font-semibold">
              Unit: <span className="font-normal">°C</span>
            </p>
            <p className="text-muted-foreground mt-2">
              Ambient temperature affects the formation and dispersion of
              pollutants like ozone.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Humidity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              Unit: <span className="font-normal">%</span>
            </p>
            <p className="text-muted-foreground mt-2">
              The amount of moisture in the air, which can influence pollutant
              transformation and deposition.
            </p>
          </CardContent>
        </Card>
      </div>
    </MonitoringDetailPage>
  );
};

export default AirPage;
