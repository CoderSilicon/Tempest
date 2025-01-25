// "use client";

// import { useState } from "react";
// import {
//   MapContainer,
//   TileLayer,
//   LayersControl,
//   ZoomControl,
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import {
//   WiDaySunny,
//   WiRaindrops,
//   WiStrongWind,
//   WiThermometer,
// } from "react-icons/wi";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

// const layers = [
//   {
//     id: "temperature",
//     icon: <WiThermometer size={28} />,
//     label: "Temperature",
//   },
//   {
//     id: "precipitation",
//     icon: <WiRaindrops size={28} />,
//     label: "Precipitation",
//   },
//   { id: "wind", icon: <WiStrongWind size={28} />, label: "Wind" },
//   { id: "clouds", icon: <WiDaySunny size={28} />, label: "Clouds" },
// ];

// export default function WeatherMap() {
//   const [activeLayer, setActiveLayer] = useState("temperature");
//   const [isOpen, setIsOpen] = useState(true);
//   const position: [number, number] = [20.5937, 78.9629];

//   return (
//     <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
//       <div
//         className={`flex h-full transition-all duration-300 ease-in-out ${
//           isOpen ? "w-64" : "w-0"
//         }`}
//       >
//         <div
//           className={`w-64 p-4 bg-white dark:bg-gray-800 shadow-md overflow-hidden ${
//             isOpen ? "" : "-ml-64"
//           }`}
//         >
//           <h2 className="text-xl font-bold mb-4 text-center">Weather Layers</h2>
//           <div className="grid grid-cols-1 gap-3">
//             {layers.map(({ id, icon, label }) => (
//               <button
//                 key={id}
//                 onClick={() => setActiveLayer(id)}
//                 className={`flex items-center justify-start gap-2 px-4 py-2 rounded-lg transition-all ${
//                   activeLayer === id
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
//                 }`}
//               >
//                 {icon}
//                 <span>{label}</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="flex flex-col flex-1">
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="absolute top-2 left-2  p-2 bg-white dark:bg-gray-800 rounded-full shadow-md"
//         >
//           {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
//         </button>

//         {/* Map */}
//         <div className="flex-1 relative border-4 border-blue-500 dark:border-blue-400">
//           <MapContainer
//             center={position}
//             zoom={5}
//             zoomControl={false}
//             className="w-full h-full"
//           >
//             <ZoomControl position="bottomright" />
//             <TileLayer
//               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />
//             <LayersControl position="topright">
//               {layers.map(
//                 ({ id }) =>
//                   activeLayer === id && (
//                     <LayersControl.Overlay key={id} checked name={id}>
//                       <TileLayer
//                         url={`https://tile.openweathermap.org/map/${id}_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
//                         attribution="OpenWeather"
//                         opacity={0.7}
//                       />
//                     </LayersControl.Overlay>
//                   )
//               )}
//             </LayersControl>
//           </MapContainer>
//         </div>
//       </div>
//     </div>
//   );
// }
import React from "react";

const page = () => {
  return <div>Still Implementing yooo</div>;
};

export default page;
