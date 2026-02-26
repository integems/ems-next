"use client";
import CreateSoilDataForm from "@/components/dashboard/soil/CreateSoilDataForm";
import SoilManagementPage from "@/components/dashboard/soil/SoilManagementPage";
import { useState } from "react";

const SoilPage = () => {
  const [activeView, setActiveView] = useState("management");
  const [locationId, setLocationId] = useState<string | undefined>(undefined);

  return (
    <>
      {activeView === "management" && (
        <SoilManagementPage
          setActiveView={setActiveView}
          locationId={locationId}
          setLocationId={setLocationId}
        />
      )}
      {activeView === "create" && (
        <CreateSoilDataForm
          onClose={() => setActiveView("management")}
          locationId={locationId}
        />
      )}
    </>
  );
};

export default SoilPage;
