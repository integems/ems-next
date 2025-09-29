"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AirPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Air Quality Parameters</h1>
      <p className="mb-8">
        This page provides a detailed explanation of each parameter used in our
        air quality monitoring process. A deeper understanding of these terms is
        essential for assessing air pollution and its impact on health and the
        environment.
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>PM2.5 - Particulate Matter 2.5</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> µg/m³
            </p>
            <p>
              PM2.5 refers to fine inhalable particles, with diameters that are
              generally 2.5 micrometers and smaller. These particles can
              penetrate deep into the lungs and even enter the bloodstream,
              posing the greatest risk to health. Sources include combustion
              engines, power plants, and forest fires.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PM10 - Particulate Matter 10</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> µg/m³
            </p>
            <p>
              PM10 are inhalable particles, with diameters that are generally 10
              micrometers and smaller. These particles are smaller than the
              width of a human hair and can be inhaled into the lungs. Sources
              include dust from roads, construction sites, and farming.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>NO₂ - Nitrogen Dioxide</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> ppb (parts per billion)
            </p>
            <p>
              Nitrogen Dioxide is a highly reactive gas primarily formed from
              the burning of fuel. It can cause respiratory problems and
              contributes to the formation of acid rain and ozone. Major sources
              are vehicles, power plants, and industrial emissions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>O₃ - Ozone</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> ppb
            </p>
            <p>
              Ground-level ozone is not emitted directly into the air but is
              created by chemical reactions between oxides of nitrogen (NOx) and
              volatile organic compounds (VOC) in the presence of sunlight. It
              is a major component of smog and can cause breathing difficulties.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CO - Carbon Monoxide</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> ppm (parts per million)
            </p>
            <p>
              Carbon Monoxide is a colorless, odorless gas produced by the
              incomplete burning of carbon-containing fuels. It is harmful when
              inhaled because it reduces the amount of oxygen that can be
              transported in the bloodstream to critical organs. The majority of
              CO emissions come from vehicles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SO₂ - Sulfur Dioxide</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> ppb
            </p>
            <p>
              Sulfur Dioxide is a gas primarily produced from the burning of
              fossil fuels (coal and oil) by power plants and other industrial
              facilities. It can harm the respiratory system and contributes to
              the formation of acid rain.
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
              Ambient air temperature is a crucial factor in the formation of
              certain pollutants, such as ozone, and can influence the
              dispersion and concentration of others.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Humidity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Percent (%)
            </p>
            <p>
              Relative humidity is the amount of moisture in the air. It can
              affect the transformation of gaseous pollutants into secondary
              particles and can also influence the deposition of pollutants.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AirPage;
