import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { getAllInterventions, createIntervention } from "@/services/interventionService";
import { InterventionType, CreateInterventionPayload } from "@/types/intervention";
import FranceMap from "@/components/Map";
import { useAuth } from "@/context/AuthContext";
import { FaSearch, FaMapMarkedAlt, FaPlus } from "react-icons/fa";

const AllIncidents = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<InterventionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapView, setMapView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [formData, setFormData] = useState<CreateInterventionPayload>({
    title: "",
    description: "",
    type: "fire",
    priority: "medium",
    location: {
      latitude: 46.603354,
      longitude: 1.888334,
      address: "",
    }
  });

  // Check URL parameter for opening modal
  useEffect(() => {
    if (router.query.openModal === "true") {
      setIsModalOpen(true);
    }
  }, [router.query]);

  // Fetch incidents on component mount
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const data = await getAllInterventions();
        setIncidents(data);
        setError(null);
      } catch (err) {
        setError("Failed to load incidents. Please try again later.");
        console.error("Error fetching incidents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Function to handle address input and automatically get coordinates
  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        address
      }
    });
    
    // If address is long enough, try to geocode it
    if (address.length > 5) {
      try {
        // In a real implementation, we would call a geocoding API here
        // For now, we'll simulate it with a timeout
        // This would be replaced with an actual API call to something like Google Maps Geocoding API
        setTimeout(() => {
          // These are placeholder values for Paris, France
          // In a real implementation, these would come from the geocoding API response
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: 48.8566,
              longitude: 2.3522
            }
          }));
        }, 500);
      } catch (error) {
        console.error("Error geocoding address:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIntervention(formData);
      setIsModalOpen(false);
      // Refresh the incidents list
      const data = await getAllInterventions();
      setIncidents(data);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "fire",
        priority: "medium",
        location: {
          latitude: 46.603354,
          longitude: 1.888334,
          address: "",
        }
      });
    } catch (err) {
      console.error("Error creating incident:", err);
      // Handle error (show error message, etc.)
    }
  };

  // Determine if user has permission to add incidents
  const canAddIncident = user && ['chef-agres', 'officier', 'coordinateur-regional'].includes(user.role);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">Toutes les interventions</h1>
                <p className="text-gray-400 text-sm">13:48 | Station non assignée</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="bg-gray-800 text-white px-4 py-2 pr-10 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute right-3 top-3 text-gray-400" />
                </div>
                <button
                  onClick={() => setMapView(!mapView)}
                  className={`px-4 py-2 rounded-md ${mapView ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-white'}`}
                >
                  Vue carte
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                {mapView ? (
                  <div className="h-[calc(100vh-200px)] w-full rounded-md overflow-hidden">
                    <FranceMap incidents={incidents} height="h-full" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-700">
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-4">Titre</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Priorité</th>
                          <th className="py-3 px-4">Statut</th>
                          <th className="py-3 px-4">Localisation</th>
                          <th className="py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incidents.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-4 px-4 text-center text-gray-400">
                              Aucune intervention trouvée
                            </td>
                          </tr>
                        ) : (
                          incidents.map((incident) => (
                            <tr key={incident._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="py-3 px-4">{incident.code}</td>
                              <td className="py-3 px-4">{incident.title}</td>
                              <td className="py-3 px-4 capitalize">{incident.type}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  incident.priority === 'high' ? 'bg-red-900/50 text-red-200' : 
                                  incident.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-200' : 
                                  'bg-blue-900/50 text-blue-200'
                                }`}>
                                  {incident.priority === 'high' ? 'Haute' : 
                                   incident.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  incident.status === 'in_progress' ? 'bg-yellow-900/50 text-yellow-200' : 
                                  incident.status === 'dispatched' ? 'bg-blue-900/50 text-blue-200' : 
                                  incident.status === 'completed' ? 'bg-green-900/50 text-green-200' : 
                                  'bg-red-900/50 text-red-200'
                                }`}>
                                  {incident.status === 'in_progress' ? 'En cours' : 
                                   incident.status === 'dispatched' ? 'Déployée' : 
                                   incident.status === 'completed' ? 'Terminée' : 'Urgente'}
                                </span>
                              </td>
                              <td className="py-3 px-4 truncate max-w-xs">{incident.location.address}</td>
                              <td className="py-3 px-4">
                                <Link
                                  href={`/incidents/${incident._id}`} 
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm"
                                >
                                  Voir
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
            
            {canAddIncident && !mapView && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg"
              >
                <FaPlus />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Ajouter une nouvelle intervention</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Titre de l'intervention"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Description détaillée de l'intervention"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="fire">Incendie</option>
                    <option value="medical">Médical</option>
                    <option value="rescue">Sauvetage</option>
                    <option value="hazmat">Matières dangereuses</option>
                    <option value="natural_disaster">Catastrophe naturelle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Priorité
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleAddressChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Adresse complète"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="location.latitude"
                    value={formData.location.latitude}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    step="0.000001"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="location.longitude"
                    value={formData.location.longitude}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    step="0.000001"
                    required
                    readOnly
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                  Ajouter l'intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllIncidents;