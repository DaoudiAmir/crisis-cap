import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { InterventionType } from "@/types/intervention";

// Fix Leaflet marker icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom marker icons for different incident types
const markerIcons = {
  fire: L.icon({
    iconUrl: "/images/fire-marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  accident: L.icon({
    iconUrl: "/images/accident-marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  medical: L.icon({
    iconUrl: "/images/medical-marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  default: defaultIcon
};

// Helper component to set map bounds based on markers
const SetBoundsToMarkers = ({ incidents }: { incidents: InterventionType[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (incidents.length > 0) {
      const bounds = L.latLngBounds(
        incidents.map(incident => 
          [incident.location.coordinates[0], incident.location.coordinates[1]] as [number, number]
        )
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [incidents, map]);
  
  return null;
};

interface MapProps {
  incidents?: InterventionType[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const FranceMap = ({ 
  incidents = [], 
  center = [46.603354, 1.888334], 
  zoom = 6,
  height = "h-96"
}: MapProps) => {
  const maxBounds: [[number, number], [number, number]] = [
    [51.124199, -5.242968], 
    [41.325300, 9.662499],  
  ];

  const getMarkerIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fire':
        return markerIcons.fire;
      case 'accident':
        return markerIcons.accident;
      case 'medical':
        return markerIcons.medical;
      default:
        return markerIcons.default;
    }
  };

  return (
    <MapContainer
      center={center} 
      zoom={zoom} 
      minZoom={5} 
      maxBounds={maxBounds}
      className={`${height} w-full rounded-lg`}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {incidents.length > 0 && <SetBoundsToMarkers incidents={incidents} />}

      {incidents.map((incident) => (
        <Marker 
          key={incident._id} 
          position={[incident.location.coordinates[0], incident.location.coordinates[1]]}
          icon={getMarkerIcon(incident.type)}
        >
          <Popup className="incident-popup">
            <div className="font-semibold text-lg">{incident.title}</div>
            <div className="text-sm capitalize">{incident.type} - {incident.priority}</div>
            <div className="text-xs mt-1">{incident.location.address}</div>
            <div className="text-xs mt-2 max-w-xs">{incident.description}</div>
            <div className="text-xs mt-1 text-gray-500">Status: <span className="capitalize">{incident.status}</span></div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default FranceMap;