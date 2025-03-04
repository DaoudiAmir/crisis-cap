import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const FranceMap = () => {
  const center: [number, number] = [46.603354, 1.888334];

  const maxBounds: [[number, number], [number, number]] = [
    [51.124199, -5.242968], 
    [41.325300, 9.662499],  
  ];

  return (
    <MapContainer
      center={center} 
      zoom={6} 
      minZoom={5} 
      maxBounds={maxBounds}
      className="h-96 w-full rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <Marker position={center}>
        <Popup>
          France
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default FranceMap;