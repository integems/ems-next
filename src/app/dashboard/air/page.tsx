"use client";
import AirAnalysisPage from "@/components/dashboard/air/AirAnalysisPage";
import AirManagementPage from "@/components/dashboard/air/AirManagementPage";
import CreateAirDataForm from "@/components/dashboard/air/CreateAirDataForm";
import { useState } from "react";

const AirPage = () => {
  const [activeView, setActiveView] = useState("management");
  const [locationId, setLocationId] = useState<string | undefined>(undefined);

  return (
    <>
      {activeView === "management" && (
        <AirManagementPage
          setActiveView={setActiveView}
          locationId={locationId}
          setLocationId={setLocationId}
        />
      )}
      {activeView === "create" && (
        <CreateAirDataForm
          onClose={() => setActiveView("management")}
          locationId={locationId}
        />
      )}
      {activeView === "analysis" && <AirAnalysisPage />}
    </>
  );
};

export default AirPage;
