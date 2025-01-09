"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { LatLngTuple, Icon, MapOptions } from "leaflet";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components
const DynamicMapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <p>Loading map...</p> }
);

const DynamicTileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const DynamicMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const DynamicPopup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Define types
type MapProps = {
  center: LatLngTuple;
  zoom: number;
  scrollWheelZoom: boolean;
};

type TileLayerProps = {
  attribution: string;
  url: string;
};

const DEFAULT_CENTER: LatLngTuple = [51.505, -0.09];
const DEFAULT_ZOOM = 13;
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function MapPage() {
  const [position, setPosition] = useState<LatLngTuple>(DEFAULT_CENTER);
  const [icon, setIcon] = useState<Icon | null>(null);

  const mapProps: MapProps = useMemo(
    () => ({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: false,
    }),
    []
  );

  const tileLayerProps: TileLayerProps = useMemo(
    () => ({
      attribution: DEFAULT_ATTRIBUTION,
      url: TILE_URL,
    }),
    []
  );

  useEffect(() => {
    const initializeMap = async () => {
      const L = await import("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      const newIcon = new L.Icon({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      setIcon(newIcon);
    };
    initializeMap();

    const interval = setInterval(() => {
      setPosition((currentPosition) => [
        currentPosition[0] + (Math.random() - 0.5) * 0.001,
        currentPosition[1] + (Math.random() - 0.5) * 0.001,
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Real-Time Map</h1>
      <div className="w-64 h-86 sm:w-full sm:h-[400px] md:h-[500px] lg:h-[600px] bg-blue-500 p-1 rounded-lg">
        <DynamicMapContainer
          {...(mapProps as MapOptions)}
          className="w-full h-full rounded-lg"
        >
          <DynamicTileLayer {...tileLayerProps} />
          {icon && (
            <DynamicMarker position={position} icon={icon}>
              <DynamicPopup>A real-time updated marker!</DynamicPopup>
            </DynamicMarker>
          )}
        </DynamicMapContainer>
      </div>
    </div>
  );
}
