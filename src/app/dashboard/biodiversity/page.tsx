"use client";
import BiodiversityManagementPage from "@/components/dashboard/biodiversity/BiodiversityManagementPage";
import CreateBiodiversityDataForm from "@/components/dashboard/biodiversity/CreateBiodiversityDataForm";
import { useState } from "react";

const BiodiversityPage = () => {
  const [activeView, setActiveView] = useState("management");
  const [locationId, setLocationId] = useState<string | undefined>(undefined);

  return (
    <>
      {activeView === "management" && (
        <BiodiversityManagementPage
          setActiveView={setActiveView}
          locationId={locationId}
          setLocationId={setLocationId}
        />
      )}
      {activeView === "create" && (
        <CreateBiodiversityDataForm
          onClose={() => setActiveView("management")}
          locationId={locationId}
        />
      )}
    </>
  );
};

export default BiodiversityPage;
