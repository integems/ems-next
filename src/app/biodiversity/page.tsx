"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavComponent from "@/components/NavComponent";

const BiodiversityPage = () => {
  return (
    <div className="container mx-auto p-4">
      <NavComponent />
      <h1 className="text-3xl font-bold mb-4 mt-20 text-center">
        {" "}
        <span className="text-primary mr-2">Biodiversity</span>
        <span>Parameters</span>
      </h1>
      <p className="mb-8">
        This page provides a detailed explanation of each parameter used in our
        biodiversity monitoring process. These metrics help us understand the
        variety and variability of life in a particular habitat or ecosystem.
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Species Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Integer
            </p>
            <p>
              Also known as species richness, this is the most straightforward
              measure of biodiversity. It is a simple count of the number of
              different species in a given area. A higher species count
              generally indicates a more diverse and healthy ecosystem.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shannon-Wiener Diversity Index (H')</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Dimensionless
            </p>
            <p>
              The Shannon-Wiener Index is a popular metric used to characterize
              species diversity in a community. It accounts for both the
              abundance and evenness of the species present. The index is higher
              when there are more species and when the distribution of
              individuals among those species is more even.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> JSON object
            </p>
            <p>
              This field stores detailed observational data, which may include a
              list of species identified, their individual counts, and any other
              relevant notes or measurements taken in the field. This raw data
              is crucial for more in-depth analysis and for tracking changes in
              species composition over time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The type of area where the measurement was taken (e.g.,
              industrial, residential, commercial, rural). This context is
              important as different land uses can have a significant impact on
              biodiversity.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Categorizes when the observation was made (e.g., day, evening,
              night). The activity of many species is time-dependent, so this
              information is valuable for interpreting the observation data
              correctly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BiodiversityPage;
