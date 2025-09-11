"use client";
import React, { useState } from "react";
import WasteManagementPage from "@/components/dashboard/waste/WasteManagementPage";
import WasteAnalysisPage from "@/components/dashboard/waste/WasteAnalysisPage";
import CreateWasteDataForm from "@/components/dashboard/waste/CreateWasteDataForm";
import { Button } from "@/components/ui/button";

const WastePage = () => {
  const [activeView, setActiveView] = useState("management");

  return (
    <>
      {activeView === "management" && (
        <WasteManagementPage setActiveView={setActiveView} />
      )}
      {activeView === "create" && (
        <CreateWasteDataForm onClose={() => setActiveView("management")} />
      )}
    </>
  );
};

export default WastePage;
