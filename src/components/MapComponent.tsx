"use client";
import { Button } from "@/components/ui/button";
import { Location } from "@/types/common.types";
import { Expand, Minimize } from "lucide-react";
import dynamic from "next/dynamic";
import { Map } from "pigeon-maps";
import React, { useState } from "react";

interface MapComponentProps {
  locations: Location[];
  activeLocationIds?: string[];
}

// Dynamically import Pigeon Maps components with SSR disabled
const Marker = dynamic(() => import("pigeon-maps").then((mod) => mod.Marker), {
  ssr: false,
});
const Overlay = dynamic(
  () => import("pigeon-maps").then((mod) => mod.Overlay),
  {
    ssr: false,
  },
);

const MapComponent: React.FC<MapComponentProps> = ({
  locations,
  activeLocationIds = [],
}) => {
  const defaultPosition: [number, number] = [8.460555, -13.228111]; // Default to Freetown, Sierra Leone
  const [overlayId, setOverlayId] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-md relative transition-all duration-300 ease-in-out">
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-2 right-2 z-20 hover:scale-110 transition-transform duration-200"
        onClick={toggleExpand}
        title={isExpanded ? "Minimize map" : "Expand map"}
      >
        {isExpanded ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Expand className="h-4 w-4" />
        )}
      </Button>
      <div
        style={{
          height: isExpanded ? 500 : 250,
          transition: "height 0.3s ease-in-out",
        }}
        className="overflow-hidden"
      >
        <Map
          zoomSnap
          height={isExpanded ? 500 : 250}
          defaultCenter={defaultPosition}
          defaultZoom={7}
          mouseEvents={true}
          touchEvents={true}
          animate
          animateMaxScreens={500}
        >
          {locations.map((loc) => {
            if (loc.pointGeom) {
              const [lng, lat] = loc.pointGeom;
              const isSelected = activeLocationIds.includes(loc.locationId);

              return (
                <Marker
                  key={loc.locationId}
                  anchor={[lat, lng]}
                  width={isSelected ? 50 : 40}
                  color={isSelected ? "#22c55e" : "#3b82f6"} // Green for selected, blue for others
                  onMouseOver={() => setOverlayId(loc.locationId)}
                  onMouseOut={() => setOverlayId("")}
                  hover={true}
                >
                  {loc.locationId === overlayId && (
                    <Overlay anchor={[lat, lng]} offset={[0, -10]}>
                      <div
                        className="bg-white p-4 rounded-lg shadow-xl max-w-xs w-max transform transition-all duration-200 ease-in-out scale-100 z-50"
                        style={{ minWidth: "200px" }}
                      >
                        <h3 className="font-bold text-gray-800 text-sm">
                          {loc.name}
                        </h3>
                        <p className="text-gray-600 text-xs mt-1">
                          {loc.description}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Category:{" "}
                          <span className="font-medium">{loc.category}</span>
                        </p>
                      </div>
                    </Overlay>
                  )}
                </Marker>
              );
            }
            return null;
          })}
        </Map>
      </div>
    </div>
  );
};

export default MapComponent;
