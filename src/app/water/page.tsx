"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavComponent from "@/components/NavComponent";

const WaterPage = () => {
  return (
    <div className="container mx-auto p-4">
      <NavComponent />
      <h1 className="text-3xl font-bold mb-4 mt-20 text-center">
        {" "}
        <span className="text-primary mr-2">Water Quality</span>
        <span>Parameters</span>
      </h1>
      <p className="mb-8">
        This page provides a detailed explanation of each parameter used in our
        water quality monitoring process. These parameters are essential for
        assessing water health for various purposes, including drinking,
        agriculture, and aquatic life support.
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>pH</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> pH units
            </p>
            <p>
              pH is a measure of how acidic or basic water is. The range goes
              from 0 to 14, with 7 being neutral. A pH of less than 7 indicates
              acidity, whereas a pH of greater than 7 indicates a base. pH is a
              critical parameter as it affects the solubility and biological
              availability of chemical constituents, including nutrients and
              heavy metals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dissolved Oxygen (DO)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> ppm (parts per million) or % saturation
            </p>
            <p>
              Dissolved oxygen is the amount of gaseous oxygen dissolved in the
              water. Adequate dissolved oxygen is necessary for good water
              quality and is a critical indicator of a water body's ability to
              support aquatic life. Low DO levels can be a sign of pollution.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Turbidity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> FNU (Formazin Nephelometric Units)
            </p>
            <p>
              Turbidity is the measure of the relative clarity of a liquid. It
              is a measurement of the amount of light that is scattered by
              suspended particles in the water. High turbidity can be caused by
              sediment, algae, or other organic matter and can harm aquatic life
              by reducing sunlight penetration and clogging gills.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Dissolved Solids (TDS)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> ppm (parts per million)
            </p>
            <p>
              TDS is the total amount of mobile charged ions, including
              minerals, salts, or metals dissolved in a given volume of water.
              It is directly related to the purity of water and the quality of
              water purification systems and affects the taste of drinking
              water.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biochemical Oxygen Demand (BOD)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> mg/L
            </p>
            <p>
              BOD is a measure of the amount of dissolved oxygen required by
              aerobic biological organisms to break down organic material
              present in a given water sample at certain temperature over a
              specific time period. It is widely used as an indication of the
              organic quality of water.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chemical Oxygen Demand (COD)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> mg/L
            </p>
            <p>
              COD is a measure of the capacity of water to consume oxygen during
              the decomposition of organic matter and the oxidation of inorganic
              chemicals such as ammonia and nitrite. It is a measure of the
              total quantity of oxygen-consuming substances in the water,
              providing an index of the degree of pollution.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Electrical Conductivity (EC)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> µS/cm (microsiemens per centimeter)
            </p>
            <p>
              EC is a measure of the water's ability to conduct electricity,
              which is directly related to the concentration of dissolved salts.
              It is a useful indicator of the overall salinity and dissolved
              nutrient levels in the water.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Degrees Celsius (°C)
            </p>
            <p>
              Water temperature is a critical parameter that affects the rate of
              biological and chemical processes. It can influence the amount of
              dissolved oxygen, the metabolic rates of aquatic organisms, and
              the sensitivity of organisms to toxic wastes, parasites, and
              diseases.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaterPage;
