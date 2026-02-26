"use client";
import CreateWasteDataForm from "@/components/dashboard/waste/CreateWasteDataForm";
import WasteManagementPage from "@/components/dashboard/waste/WasteManagementPage";
import { useState } from "react";

const WastePage = () => {
  const [activeView, setActiveView] = useState("management");
  const [locationId, setLocationId] = useState<string | undefined>(undefined);

  return (
    <>
      {activeView === "management" && (
        <WasteManagementPage
          setActiveView={setActiveView}
          locationId={locationId}
          setLocationId={setLocationId}
        />
      )}
      {activeView === "create" && (
        <CreateWasteDataForm
          onClose={() => setActiveView("management")}
          locationId={locationId}
        />
      )}
    </>
  );
};

export default WastePage;
