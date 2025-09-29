"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavComponent from "@/components/NavComponent";

const SoilPage = () => {
  return (
    <div className="container mx-auto p-4">
      <NavComponent />
      <h1 className="text-3xl font-bold mb-4 mt-20 text-center">
        {" "}
        <span className="text-primary mr-2">Soil Quality</span>
        <span>Parameters</span>
      </h1>
      <p className="mb-8">
        This page provides a detailed explanation of each parameter used in our
        soil quality monitoring process. These parameters are vital for
        assessing soil health, agricultural productivity, and environmental
        sustainability.
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
              Soil pH is a measure of the acidity or alkalinity of the soil. It
              is a master variable in soils as it affects many chemical
              processes. It specifically affects plant nutrient availability by
              controlling the chemical forms of the different nutrients and
              influencing the chemical reactions they undergo.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nitrogen (N)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> ppm (parts per million) or mg/kg
            </p>
            <p>
              Nitrogen is a crucial macronutrient for plant growth and is a
              major component of chlorophyll and amino acids. Measuring nitrogen
              levels helps in determining the fertility of the soil and the need
              for fertilizers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phosphorus (P)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> ppm or mg/kg
            </p>
            <p>
              Phosphorus is essential for plant growth, playing a key role in
              photosynthesis, energy transfer, and nutrient transport. Soil
              phosphorus levels are indicative of the soil's ability to support
              healthy plant development.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Potassium (K)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> ppm or mg/kg
            </p>
            <p>
              Potassium is important for its role in the regulation of water in
              plants and the activation of enzymes. It contributes to the
              overall health and vigor of plants. Soil potassium tests help to
              ensure that levels are adequate for crop needs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organic Matter</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Percent (%)
            </p>
            <p>
              Soil organic matter is the fraction of the soil that consists of
              plant or animal tissue in various stages of decomposition. It is a
              critical component for soil health, improving soil structure,
              water retention, and nutrient supply.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moisture</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Percent (%)
            </p>
            <p>
              Soil moisture is the water stored in the soil and is affected by
              precipitation, irrigation, and soil type. It is a key factor in
              determining plant growth and the movement of nutrients and
              contaminants in the soil.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SoilPage;
