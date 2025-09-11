"use client";
import React, { useState } from "react";
import BiodiversityManagementPage from "@/components/dashboard/biodiversity/BiodiversityManagementPage";
import BiodiversityAnalysisPage from "@/components/dashboard/biodiversity/BiodiversityAnalysisPage";
import CreateBiodiversityDataForm from "@/components/dashboard/biodiversity/CreateBiodiversityDataForm";
import { Button } from "@/components/ui/button";

const BiodiversityPage = () => {
  const [activeView, setActiveView] = useState("management");

  return (
    <>
      {activeView === "management" && (
        <BiodiversityManagementPage setActiveView={setActiveView} />
      )}
      {activeView === "create" && (
        <CreateBiodiversityDataForm
          onClose={() => setActiveView("management")}
        />
      )}
    </>
  );
};

export default BiodiversityPage;
