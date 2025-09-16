"use client";
import React, { useState } from "react";
import AirManagementPage from "@/components/dashboard/air/AirManagementPage";
import AirAnalysisPage from "@/components/dashboard/air/AirAnalysisPage";
import CreateAirDataForm from "@/components/dashboard/air/CreateAirDataForm";
import { Button } from "@/components/ui/button";

const AirPage = () => {
  const [activeView, setActiveView] = useState("management");

  return (
    <>
      {activeView === "management" && (
        <AirManagementPage setActiveView={setActiveView} />
      )}
      {activeView === "create" && (
        <CreateAirDataForm onClose={() => setActiveView("management")} />
      )}
      {activeView === "analysis" && <AirAnalysisPage />}
    </>
  );
};

export default AirPage;
