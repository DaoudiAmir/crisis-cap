import { useEffect, useState, useRef } from "react";
import L from "leaflet"; 
import "leaflet/dist/leaflet.css"; 
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { FaMapMarkedAlt } from 'react-icons/fa';

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Define intervention type
interface Intervention {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  createdAt: string;
}

const MapSection = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Fetch interventions for map
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setLoading(true);
        
        // Mock data for interventions
        const mockInterventions = [
          {
            _id: "mock1",
            title: "Incendie résidentiel",
            description: "Feu dans un appartement au 3ème étage",
            status: "in-progress",
            priority: "high",
            location: {
              coordinates: [2.3522, 48.8566], // Paris
              address: "123 Rue de Paris, Paris"
            },
            createdAt: new Date().toISOString()
          },
          {
            _id: "mock2",
            title: "Accident de la route",
            description: "Collision entre deux véhicules",
            status: "dispatched",
            priority: "medium",
            location: {
              coordinates: [4.8357, 45.7640], // Lyon
              address: "Avenue des Champs-Élysées, Paris"
            },
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: "mock3",
            title: "Inondation",
            description: "Sous-sol inondé suite à de fortes pluies",
            status: "pending",
            priority: "low",
            location: {
              coordinates: [5.3698, 43.2965], // Marseille
              address: "45 Rue du Faubourg Saint-Honoré, Paris"
            },
            createdAt: new Date(Date.now() - 7200000).toISOString()
          },
          {
            _id: "mock4",
            title: "Fuite de gaz",
            description: "Odeur de gaz signalée dans un immeuble",
            status: "on-site",
            priority: "high",
            location: {
              coordinates: [1.4442, 43.6047], // Toulouse
              address: "12 Rue de la République, Toulouse"
            },
            createdAt: new Date(Date.now() - 10800000).toISOString()
          },
          {
            _id: "mock5",
            title: "Secours à personne",
            description: "Personne âgée ayant fait une chute",
            status: "en-route",
            priority: "medium",
            location: {
              coordinates: [0.3378, 46.5802], // Poitiers
              address: "8 Place de la Liberté, Poitiers"
            },
            createdAt: new Date(Date.now() - 14400000).toISOString()
          }
        ];
        
        try {
          const response = await axios.get(`${API_URL}/v1/interventions/active`, {
            withCredentials: true
          });
          
          if (response.data && response.data.data) {
            setInterventions(response.data.data.interventions);
          } else {
            console.warn("No intervention data returned from API, using mock data");
            setInterventions(mockInterventions);
          }
        } catch (err) {
          if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
            console.warn("Unauthorized error fetching interventions from API, using mock data");
            setInterventions(mockInterventions);
          } else {
            console.warn("Error fetching interventions from API, using mock data:", err);
            setInterventions(mockInterventions);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error in intervention fetching process:", err);
        setError("Failed to load intervention data. Please try again later.");
        
        // Use mock data as fallback
        setInterventions([
          {
            _id: "mock1",
            title: "Incendie résidentiel",
            description: "Feu dans un appartement au 3ème étage",
            status: "in-progress",
            priority: "high",
            location: {
              coordinates: [2.3522, 48.8566], // Paris
              address: "123 Rue de Paris, Paris"
            },
            createdAt: new Date().toISOString()
          },
          {
            _id: "mock2",
            title: "Accident de la route",
            description: "Collision entre deux véhicules",
            status: "dispatched",
            priority: "medium",
            location: {
              coordinates: [4.8357, 45.7640], // Lyon
              address: "Avenue des Champs-Élysées, Paris"
            },
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ]);
        
        setLoading(false);
      }
    };
    
    fetchInterventions();
  }, []);

  // Create custom icon
  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  // Initialize map and add markers
  useEffect(() => {
    if (loading || mapInitialized) return;

    // Wait for the component to be fully mounted
    const initializeMap = () => {
      // Make sure the map container exists before initializing the map
      if (!mapRef.current) {
        console.error("Map container not found, will retry on next render");
        return;
      }

      try {
        // Set default view to France
        const map = L.map("map").setView([46.603354, 1.888334], 6);
        
        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Add markers for interventions
        if (interventions.length > 0) {
          // Create bounds to fit all markers
          const bounds = L.latLngBounds([]);
          
          interventions.forEach((intervention) => {
            if (intervention.location && intervention.location.coordinates) {
              const [lng, lat] = intervention.location.coordinates;
              
              // Skip if coordinates are invalid
              if (!lat || !lng) return;
              
              // Determine icon color based on priority
              let iconColor = '#3498db'; // Default blue
              if (intervention.priority === 'HIGH' || intervention.priority === 'high') {
                iconColor = '#e74c3c'; // Red for high priority
              } else if (intervention.priority === 'MEDIUM' || intervention.priority === 'medium') {
                iconColor = '#f39c12'; // Orange for medium priority
              }
              
              // Create marker with custom icon
              const marker = L.marker([lat, lng], {
                icon: createCustomIcon(iconColor)
              })
                .addTo(map)
                .bindPopup(`
                  <div class="popup-content">
                    <h3 class="font-bold">${intervention.title}</h3>
                    <p class="text-sm">${intervention.description || 'No description available'}</p>
                    <p class="text-xs mt-2">${intervention.location.address || 'No address available'}</p>
                    <div class="mt-2">
                      <span class="text-xs px-2 py-1 rounded-full ${
                        intervention.status === 'in_progress' || intervention.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                        intervention.status === 'dispatched' || intervention.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-800' : 
                        intervention.status === 'completed' || intervention.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }">
                        ${intervention.status === 'in_progress' || intervention.status === 'IN_PROGRESS' ? 'En cours' : 
                         intervention.status === 'dispatched' || intervention.status === 'DISPATCHED' ? 'Déployée' : 
                         intervention.status === 'completed' || intervention.status === 'COMPLETED' ? 'Terminée' : 'Urgente'}
                      </span>
                    </div>
                    <button class="mt-2 text-xs text-blue-600 hover:underline">Voir les détails</button>
                  </div>
                `);
              
              // Add to bounds
              bounds.extend([lat, lng]);
            }
          });
          
          // If we have valid bounds, fit the map to them
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        } else if (!error) {
          // If no interventions and no error, add a default marker
          L.marker([48.8566, 2.3522])
            .addTo(map)
            .bindPopup("Paris, France")
            .openPopup();
        }

        // Add controls
        L.control.scale().addTo(map);
        
        // Add legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function () {
          const div = L.DomUtil.create('div', 'info legend');
          div.innerHTML = `
            <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 0 4px rgba(0,0,0,0.2);">
              <div style="font-weight: bold; margin-bottom: 4px;">Priorité</div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="background-color: #e74c3c; width: 16px; height: 16px; border-radius: 50%; margin-right: 8px;"></div>
                <span>Haute</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="background-color: #f39c12; width: 16px; height: 16px; border-radius: 50%; margin-right: 8px;"></div>
                <span>Moyenne</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="background-color: #3498db; width: 16px; height: 16px; border-radius: 50%; margin-right: 8px;"></div>
                <span>Basse</span>
              </div>
            </div>
          `;
          return div;
        };
        legend.addTo(map);

        setMapInitialized(true);

        // Cleanup
        return () => {
          map.remove();
          setMapInitialized(false);
        };
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to initialize map. Please try refreshing the page.");
      }
    };

    // Use a small timeout to ensure the DOM is fully rendered
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => clearTimeout(timer);
  }, [interventions, loading, error, mapInitialized]);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title flex items-center">
          <FaMapMarkedAlt className="mr-2 text-primary" />
          Carte des Interventions
        </h2>
        
        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : (
          <div id="map" ref={mapRef} className="h-96 w-full rounded-lg z-0"></div>
        )}
      </div>
    </div>
  );
};

export default MapSection;