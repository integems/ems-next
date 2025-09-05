"use client";
import React, { useState } from "react";
import SoilManagementPage from "@/components/dashboard/soil/SoilManagementPage";
import SoilAnalysisPage from "@/components/dashboard/soil/SoilAnalysisPage";
import CreateSoilDataForm from "@/components/dashboard/soil/CreateSoilDataForm";
import { Button } from "@/components/ui/button";

const SoilPage = () => {
  const [activeView, setActiveView] = useState("management");

  return (
    <>
      {activeView === "management" && (
        <SoilManagementPage setActiveView={setActiveView} />
      )}
      {activeView === "create" && (
        <CreateSoilDataForm onClose={() => setActiveView("management")} />
      )}
    </>
  );
};

export default SoilPage;
