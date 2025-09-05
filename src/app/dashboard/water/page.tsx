"use client";
import React, { useState } from "react";
import WaterManagementPage from "@/components/dashboard/water/WaterManagementPage";
import WaterAnalysisPage from "@/components/dashboard/water/WaterAnalysisPage";
import CreateWaterDataForm from "@/components/dashboard/water/CreateWaterDataForm";
import { Button } from "@/components/ui/button";

const WaterPage = () => {
  const [activeView, setActiveView] = useState("management");

  return (
    <>
      {activeView === "management" && (
        <WaterManagementPage setActiveView={setActiveView} />
      )}
      {activeView === "create" && (
        <CreateWaterDataForm onClose={() => setActiveView("management")} />
      )}
    </>
  );
};

export default WaterPage;
