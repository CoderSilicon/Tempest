"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  WiDaySunny,
  WiRaindrops,
  WiStrongWind,
  WiThermometer,
} from "react-icons/wi";

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

export default function WeatherMap() {
  const [activeLayer, setActiveLayer] = useState("temperature");

  // Center of India
  const position: [number, number] = [20.5937, 78.9629];

  return (
    <>
      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center items-center rounded-2xl m-4 gap-4 shadow-md z-10">
        <button
          onClick={() => setActiveLayer("temperature")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeLayer === "temperature"
              ? "bg-blue-500 text-white"
              : "bg-slate-900"
          }`}
        >
          <WiThermometer size={24} />
          Temperature
        </button>
        <button
          onClick={() => setActiveLayer("precipitation")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeLayer === "precipitation"
              ? "bg-blue-500 text-white"
              : "bg-slate-900"
          }`}
        >
          <WiRaindrops size={24} />
          Precipitation
        </button>
        <button
          onClick={() => setActiveLayer("wind")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeLayer === "wind" ? "bg-blue-500 text-white" : "bg-slate-900"
          }`}
        >
          <WiStrongWind size={24} />
          Wind
        </button>
        <button
          onClick={() => setActiveLayer("clouds")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeLayer === "clouds" ? "bg-blue-500 text-white" : "bg-slate-900"
          }`}
        >
          <WiDaySunny size={24} />
          Clouds
        </button>
      </div>

      {/* Map */}
      <div className="flex justify-center items-center m-4">
        <div
          className="h-screen w-full rounded-2xl border-2 border-blue-500 overflow-hidden relative z-0"
          style={{ zIndex: 0 }} // Lower z-index for the map container
        >
          <MapContainer
            center={position}
            zoom={5}
            zoomControl={false}
            className="h-full w-full"
          >
            <ZoomControl position="bottomright" />

            {/* Base Map Layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Weather Layers */}
            <LayersControl position="topright">
              {activeLayer === "temperature" && (
                <TileLayer
                  url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
                  attribution="OpenWeather"
                  opacity={0.7}
                />
              )}
              {activeLayer === "precipitation" && (
                <TileLayer
                  url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
                  attribution="OpenWeather"
                  opacity={0.7}
                />
              )}
              {activeLayer === "wind" && (
                <TileLayer
                  url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
                  attribution="OpenWeather"
                  opacity={0.7}
                />
              )}
              {activeLayer === "clouds" && (
                <TileLayer
                  url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
                  attribution="OpenWeather"
                  opacity={0.7}
                />
              )}
            </LayersControl>
          </MapContainer>
        </div>
      </div>
    </>
  );
}
