"use client";
import CreateNoiseDataForm from "@/components/dashboard/noise/CreateNoiseDataForm";
import NoiseAnalysisPage from "@/components/dashboard/noise/NoiseAnalysisPage";
import NoiseManagementPage from "@/components/dashboard/noise/NoiseManagementPage";
import { useState } from "react";

const NoisePage = () => {
  const [activeView, setActiveView] = useState("management");
  const [locationId, setLocationId] = useState<string | undefined>(undefined);

  return (
    <>
      {activeView === "management" && (
        <NoiseManagementPage
          setActiveView={setActiveView}
          locationId={locationId}
          setLocationId={setLocationId}
        />
      )}
      {activeView === "create" && (
        <CreateNoiseDataForm
          onClose={() => setActiveView("management")}
          locationId={locationId}
        />
      )}
      {activeView === "analysis" && <NoiseAnalysisPage />}
    </>
  );
};

export default NoisePage;
