import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { InterventionType } from "@/types/intervention";

// Only initialize Leaflet on the client-side
const initializeLeaflet = () => {
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

  return markerIcons;
};

// Helper component to set map bounds based on markers
const SetBoundsToMarkers = ({ incidents }: { incidents: InterventionType[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (incidents.length === 0) return;
    
    try {
      // Filter out incidents with invalid coordinates
      const validIncidents = incidents.filter(incident => {
        const lat = incident.location.coordinates?.[1] || 0;
        const lng = incident.location.coordinates?.[0] || 0;
        return typeof lat === 'number' && !isNaN(lat) && 
               typeof lng === 'number' && !isNaN(lng);
      });
      
      if (validIncidents.length === 0) return;
      
      // Create bounds from valid coordinates
      const bounds = L.latLngBounds(
        validIncidents.map(incident => [
          incident.location.coordinates?.[1] || 0,
          incident.location.coordinates?.[0] || 0
        ])
      );
      
      // Add padding to bounds
      map.fitBounds(bounds, { padding: [50, 50] });
    } catch (error) {
      console.error("Error setting map bounds:", error);
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

  const [markerIcons, setMarkerIcons] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMarkerIcons(initializeLeaflet());
    }
  }, []);

  const getMarkerIcon = (type: string) => {
    if (Object.keys(markerIcons).length > 0) {
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
    }
    return null; // Return null if markerIcons is not initialized yet
  };

  // Only render the map on the client side
  if (typeof window === 'undefined') {
    return <div className={`${height} w-full bg-gray-800 flex items-center justify-center`}>Loading map...</div>;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`${height} w-full z-0`}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {incidents.length > 0 && (
        <>
          <SetBoundsToMarkers incidents={incidents} />
          {incidents.map((incident, index) => {
            const position: [number, number] = [
              incident.location.coordinates?.[1] || 0,
              incident.location.coordinates?.[0] || 0
            ];
            
            const icon = getMarkerIcon(incident.type);
            
            return (
              <Marker 
                key={incident.id || index} 
                position={position}
                icon={icon || undefined}
              >
                <Popup>
                  <div className="text-gray-800">
                    <h3 className="font-bold">{incident.title}</h3>
                    <p className="text-sm">{incident.description}</p>
                    <p className="text-xs mt-1">{incident.location.address}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </>
      )}
    </MapContainer>
  );
};

export default FranceMap;