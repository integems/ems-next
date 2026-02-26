"use client";
import CreateWaterDataForm from "@/components/dashboard/water/CreateWaterDataForm";
import WaterManagementPage from "@/components/dashboard/water/WaterManagementPage";
import { useState } from "react";

const WaterPage = () => {
  const [activeView, setActiveView] = useState("management");
  const [locationId, setLocationId] = useState<string | undefined>(undefined);

  return (
    <>
      {activeView === "management" && (
        <WaterManagementPage
          setActiveView={setActiveView}
          locationId={locationId}
          setLocationId={setLocationId}
        />
      )}
      {activeView === "create" && (
        <CreateWaterDataForm
          onClose={() => setActiveView("management")}
          locationId={locationId}
        />
      )}
    </>
  );
};

export default WaterPage;
