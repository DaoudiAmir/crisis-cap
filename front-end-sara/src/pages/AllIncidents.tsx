import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import { getAllInterventions, createIntervention, testInterventionCreation } from "@/services/interventionService";
import { InterventionType, CreateInterventionPayload } from "@/types/intervention";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { useAuth } from "@/context/AuthContext";
import { FaSearch, FaPlus } from "react-icons/fa";
import toast from "@/components/Toast";

// Dynamically import the Map component with ssr: false to prevent "window is not defined" error
const FranceMap = dynamic(
  () => import("@/components/Map"),
  { ssr: false }
);

const AllIncidents = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<InterventionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapView, setMapView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [formData, setFormData] = useState<CreateInterventionPayload>({
    title: "",
    description: "",
    type: "fire",
    priority: "MEDIUM",
    riskLevel: "medium",
    location: {
      latitude: 46.603354,
      longitude: 1.888334,
      address: "",
      coordinates: [1.888334, 46.603354]
    }
  });

  // Function to fetch all incidents
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

  // Check URL parameter for opening modal
  useEffect(() => {
    if (router.query.openModal === "true") {
      setIsModalOpen(true);
    }
  }, [router.query]);

  // Fetch incidents on component mount
  useEffect(() => {
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

  // Handle address selection from autocomplete
  const handleAddressSelect = (address: string, coordinates: { latitude: number; longitude: number; coordinates: [number, number] }) => {
    console.log('Address selected:', address);
    console.log('Coordinates:', coordinates);
    
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        coordinates: coordinates.coordinates // Store coordinates array for backend format
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Log the form data for debugging
      console.log("Form data before submission:", {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        location: formData.location,
        riskLevel: formData.riskLevel
      });

      // Validate required fields
      if (!formData.title || !formData.description || !formData.type || !formData.priority || !formData.location.address) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Validate coordinates
      if (!formData.location.coordinates || 
          !Array.isArray(formData.location.coordinates) || 
          formData.location.coordinates.length !== 2 ||
          formData.location.coordinates.some(coord => coord === null || isNaN(Number(coord)))) {
        console.warn("Invalid coordinates detected:", formData.location.coordinates);
        
        // Try to use the test function to diagnose API requirements
        console.log("Running diagnostic test for intervention creation...");
        const testResult = await testInterventionCreation();
        console.log("Diagnostic test result:", testResult);
        
        if (testResult.success) {
          // If test was successful, use the identified endpoint and payload structure
          toast({
            title: "Diagnostic test successful",
            description: "Using the identified API structure for intervention creation",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
          
          // Create intervention with the regular flow but using insights from the test
          const newIntervention = await createIntervention({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            priority: formData.priority,
            location: {
              ...formData.location,
              // Ensure coordinates are never null
              coordinates: Array.isArray(formData.location.coordinates) && 
                           formData.location.coordinates.every(coord => coord !== null && !isNaN(Number(coord))) 
                         ? formData.location.coordinates 
                         : [2.3489889, 48.8616376], // Default to Paris coordinates
            },
            riskLevel: formData.riskLevel,
            status: "pending",
            startTime: new Date().toISOString(),
          });
          
          if (newIntervention) {
            toast({
              title: "Intervention created",
              description: "New intervention has been created successfully",
              status: "success",
              duration: 5000,
              isClosable: true,
            });
            
            // Reset form and refresh interventions
            setFormData({
              title: "",
              description: "",
              type: "fire",
              priority: "MEDIUM",
              riskLevel: "medium",
              location: {
                latitude: 46.603354,
                longitude: 1.888334,
                address: "",
                coordinates: [1.888334, 46.603354]
              }
            });
            fetchIncidents();
            setIsModalOpen(false);
          } else {
            throw new Error("Failed to create intervention");
          }
        } else {
          // If test failed, use mock data and show a warning
          toast({
            title: "Using mock data",
            description: "Could not connect to the API. Using mock data instead.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          
          // Use mock data
          const mockIntervention = {
            id: Math.floor(Math.random() * 10000).toString(),
            title: formData.title,
            description: formData.description,
            type: formData.type,
            priority: formData.priority,
            location: formData.location,
            riskLevel: formData.riskLevel,
            status: "pending",
            startTime: new Date().toISOString(),
          };
          
          // Add to local state and close modal
          setIncidents(prev => [...prev, mockIntervention]);
          setFormData({
            title: "",
            description: "",
            type: "fire",
            priority: "MEDIUM",
            riskLevel: "medium",
            location: {
              latitude: 46.603354,
              longitude: 1.888334,
              address: "",
              coordinates: [1.888334, 46.603354]
            }
          });
          setIsModalOpen(false);
        }
        
        setLoading(false);
        return;
      }

      // Regular flow - create intervention with validated data
      const newIntervention = await createIntervention({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        location: formData.location,
        riskLevel: formData.riskLevel,
        status: "pending",
        startTime: new Date().toISOString(),
      });

      if (newIntervention) {
        toast({
          title: "Intervention created",
          description: "New intervention has been created successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        setFormData({
          title: "",
          description: "",
          type: "fire",
          priority: "MEDIUM",
          riskLevel: "medium",
          location: {
            latitude: 46.603354,
            longitude: 1.888334,
            address: "",
            coordinates: [1.888334, 46.603354]
          }
        });
        fetchIncidents();
        setIsModalOpen(false);
      } else {
        throw new Error("Failed to create intervention");
      }
    } catch (err) {
      console.error("Error creating intervention:", err);
      
      // Enhanced error handling with more specific messages
      let errorMessage = "An error occurred while creating the intervention";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine if user has permission to add incidents
  const canAddIncident = user && ['chef-agres', 'officier', 'coordinateur-regional'].includes(user.role);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar />
      <div className="flex-1 ml-64"> 
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
                  placeholder="Rechercher une intervention..."
                  className="input input-bordered bg-gray-800 pr-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className={`btn btn-sm ${!mapView ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setMapView(false)}
                >
                  Liste
                </button>
                <button 
                  className={`btn btn-sm ${mapView ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setMapView(true)}
                >
                  Carte
                </button>
              </div>
              {canAddIncident && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  <FaPlus className="mr-2" /> Nouvelle intervention
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <>
              {mapView ? (
                <div className="h-[calc(100vh-12rem)] w-full rounded-lg overflow-hidden border border-gray-700">
                  <FranceMap incidents={incidents} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full bg-gray-800 rounded-lg">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="bg-gray-800 text-gray-400">ID</th>
                        <th className="bg-gray-800 text-gray-400">Titre</th>
                        <th className="bg-gray-800 text-gray-400">Type</th>
                        <th className="bg-gray-800 text-gray-400">Priorité</th>
                        <th className="bg-gray-800 text-gray-400">Adresse</th>
                        <th className="bg-gray-800 text-gray-400">Date</th>
                        <th className="bg-gray-800 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4">
                            Aucune intervention trouvée
                          </td>
                        </tr>
                      ) : (
                        incidents
                          .filter(incident => 
                            searchTerm === "" || 
                            incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            incident.location.address.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((incident) => (
                            <tr key={incident.id} className="hover:bg-gray-700 border-b border-gray-700">
                              <td>{incident.id}</td>
                              <td>{incident.title}</td>
                              <td>
                                <span className={`badge ${
                                  incident.type === 'fire' ? 'badge-error' :
                                  incident.type === 'medical' ? 'badge-warning' :
                                  incident.type === 'rescue' ? 'badge-info' :
                                  incident.type === 'hazmat' ? 'badge-secondary' :
                                  'badge-primary'
                                }`}>
                                  {incident.type === 'fire' ? 'Incendie' :
                                   incident.type === 'medical' ? 'Médical' :
                                   incident.type === 'rescue' ? 'Sauvetage' :
                                   incident.type === 'hazmat' ? 'Matières dangereuses' :
                                   'Catastrophe naturelle'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  incident.priority === 'HIGH' || incident.priority === 'CRITICAL' ? 'badge-error' :
                                  incident.priority === 'MEDIUM' ? 'badge-warning' :
                                  'badge-info'
                                }`}>
                                  {incident.priority === 'LOW' ? 'Basse' :
                                   incident.priority === 'MEDIUM' ? 'Moyenne' :
                                   incident.priority === 'HIGH' ? 'Haute' :
                                   'Critique'}
                                </span>
                              </td>
                              <td>{incident.location.address}</td>
                              <td>{new Date(incident.createdAt).toLocaleString('fr-FR')}</td>
                              <td>
                                <div className="flex space-x-2">
                                  <Link href={`/incidents/${incident.id}`} className="btn btn-xs btn-outline">
                                    Voir
                                  </Link>
                                </div>
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
        </div>
      </div>

      {/* Modal for adding a new incident */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Nouvelle intervention</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Titre</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Titre de l'intervention"
                    className="input input-bordered bg-gray-700 text-white"
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Type</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="select select-bordered bg-gray-700 text-white"
                    required
                  >
                    <option value="fire">Incendie</option>
                    <option value="medical">Médical</option>
                    <option value="rescue">Sauvetage</option>
                    <option value="hazmat">Matières dangereuses</option>
                    <option value="natural_disaster">Catastrophe naturelle</option>
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Priorité</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="select select-bordered bg-gray-700 text-white"
                    required
                  >
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                    <option value="CRITICAL">Critique</option>
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Niveau de risque</span>
                  </label>
                  <select
                    name="riskLevel"
                    value={formData.riskLevel}
                    onChange={handleChange}
                    className="select select-bordered bg-gray-700 text-white"
                    required
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyen</option>
                    <option value="high">Élevé</option>
                    <option value="extreme">Extrême</option>
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Adresse</span>
                  </label>
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    initialAddress={formData.location.address}
                    placeholder="Entrez l'adresse de l'intervention"
                    required={true}
                  />
                </div>
              </div>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text text-white">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de l'intervention"
                  className="textarea textarea-bordered bg-gray-700 text-white h-24"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer l'intervention
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