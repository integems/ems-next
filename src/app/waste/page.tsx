"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavComponent from "@/components/NavComponent";

const WastePage = () => {
  return (
    <div className="container mx-auto p-4">
      <NavComponent />
      <h1 className="text-3xl font-bold mb-4 mt-20 text-center">
        {" "}
        <span className="text-primary mr-2">Waste</span>
        <span>Parameters</span>
      </h1>
      <p className="mb-8">
        This page explains the various parameters collected for waste
        monitoring. Understanding these parameters is crucial for assessing
        waste management strategies and their environmental impact.
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Solid Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Kilograms (kg)
            </p>
            <p>
              Solid waste, often referred to as municipal solid waste (MSW),
              encompasses the everyday items we use and then throw away. This
              category includes a wide variety of materials such as food scraps,
              paper, plastics, and textiles. Monitoring solid waste is
              fundamental to understanding consumption patterns and the overall
              effectiveness of waste management systems.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hazardous Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Kilograms (kg)
            </p>
            <p>
              Hazardous waste is any waste that poses substantial or potential
              threats to public health or the environment. This includes
              materials that are flammable, corrosive, reactive, or toxic.
              Examples include batteries, pesticides, and certain cleaning
              agents. Proper tracking and disposal of hazardous waste are
              critical to prevent pollution and health risks.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recycled Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Kilograms (kg)
            </p>
            <p>
              This parameter quantifies the amount of waste that is diverted
              from the landfill and sent to be reprocessed into new materials.
              It is a key indicator of the success of recycling programs and the
              transition towards a circular economy. This category can be broken
              down into more specific material types.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organic Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Kilograms (kg)
            </p>
            <p>
              Organic waste is any material that is biodegradable and comes from
              either a plant or an animal. It includes food waste, garden and
              lawn clippings, and wood. When sent to landfills, organic waste
              decomposes anaerobically, producing methane, a potent greenhouse
              gas. Composting and other organic waste diversion strategies are
              therefore crucial for climate change mitigation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paper Waste (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The weight of paper and cardboard waste collected for recycling,
              measured in kilograms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plastic Waste (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The weight of plastic waste, measured in kilograms. This can be
              further broken down by plastic type.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cans Waste (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The weight of aluminum and steel cans, measured in kilograms.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bottles Waste (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The weight of glass and plastic bottles, measured in kilograms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>E-Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Kilograms (kg)
            </p>
            <p>
              Electronic waste, or e-waste, refers to discarded electronic
              devices. These products often contain valuable materials such as
              gold and copper, as well as hazardous substances like lead and
              mercury. Tracking e-waste is important for promoting the recovery
              of valuable resources and ensuring that hazardous components are
              managed safely.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scrap Metal</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Unit:</strong> Kilograms (kg)
            </p>
            <p>
              This category includes all types of discarded metals, from
              aluminum cans to steel beams. Recycling scrap metal is highly
              beneficial as it reduces the need for virgin ore extraction, which
              is an energy-intensive and environmentally damaging process. It
              also reduces greenhouse gas emissions and saves landfill space.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Categorizes when the measurement was taken (e.g., day, evening,
              night).
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
              industrial, residential, commercial, rural).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WastePage;
