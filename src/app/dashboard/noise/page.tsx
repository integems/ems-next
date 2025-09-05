"use client";
import React, { useState } from "react";
import NoiseManagementPage from "@/components/dashboard/noise/NoiseManagementPage";
import NoiseAnalysisPage from "@/components/dashboard/noise/NoiseAnalysisPage";
import CreateNoiseDataForm from "@/components/dashboard/noise/CreateNoiseDataForm";
import { Button } from "@/components/ui/button";

const NoisePage = () => {
  const [activeView, setActiveView] = useState("management");

  return (
    <>
      {activeView === "management" && (
        <NoiseManagementPage setActiveView={setActiveView} />
      )}
      {activeView === "create" && (
        <CreateNoiseDataForm onClose={() => setActiveView("management")} />
      )}
    </>
  );
};

export default NoisePage;
