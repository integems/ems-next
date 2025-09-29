"use client";
import React, { useState } from "react";
import NoiseManagementPage from "@/components/dashboard/noise/NoiseManagementPage";
import NoiseAnalysisPage from "@/components/dashboard/noise/NoiseAnalysisPage";
import CreateNoiseDataForm from "@/components/dashboard/noise/CreateNoiseDataForm";

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
      {activeView === "analysis" && <NoiseAnalysisPage />}
    </>
  );
};

export default NoisePage;
