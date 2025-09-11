"use client";

import React, { useState } from "react";
import { Map, Marker } from "pigeon-maps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Expand, Minimize } from "lucide-react";

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  onLocationSelect,
}) => {
  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [latInput, setLatInput] = useState<string>("");
  const [lngInput, setLngInput] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMapClick = ({ latLng }: { latLng: [number, number] }) => {
    const [lat, lng] = latLng;
    setMarker(latLng);
    setLatInput(lat.toString());
    setLngInput(lng.toString());
    onLocationSelect(lat, lng);
  };

  const handleLatLngInput = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      const newMarker: [number, number] = [lat, lng];
      setMarker(newMarker);
      onLocationSelect(lat, lng);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            onBlur={handleLatLngInput}
            placeholder="Enter latitude (-90 to 90)"
            step="any"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            onBlur={handleLatLngInput}
            placeholder="Enter longitude (-180 to 180)"
            step="any"
          />
        </div>
      </div>
      <div className="rounded-lg overflow-hidden shadow-md relative">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="absolute top-2 right-2 z-10"
          onClick={toggleExpand}
        >
          {isExpanded ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Expand className="h-4 w-4" />
          )}
        </Button>
        <Map
          height={isExpanded ? 500 : 250}
          defaultCenter={[8.460555, -13.228111]} // Freetown
          defaultZoom={7}
          onClick={handleMapClick}
        >
          {marker && <Marker anchor={marker} color="#22c55e" />}
        </Map>
      </div>
    </div>
  );
};

export default LocationPickerMap;
