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
import { useToast } from "@/components/Toast";

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
    location: {
      latitude: 46.603354,
      longitude: 1.888334,
      address: "",
      coordinates: [1.888334, 46.603354]
    },
    regionId: "507f1f77bcf86cd799439011", // Default region ID in MongoDB format
    station: "507f1f77bcf86cd799439011", // Default station ID in MongoDB format
    commander: "507f1f77bcf86cd799439011", // Default commander ID in MongoDB format
    startTime: new Date().toISOString(),
    estimatedDuration: 60, // Default 60 minutes
    riskLevel: "medium",
    hazards: [],
    status: "pending"
  });

  const toast = useToast();

  // Function to fetch all incidents
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await getAllInterventions();
      console.log('Fetched incidents data:', data);
      
      // Ensure incidents is always an array
      if (Array.isArray(data)) {
        setIncidents(data);
      } else {
        console.error('Received non-array data for incidents:', data);
        setIncidents([]);
        setError("Received invalid data format from server");
      }
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setIncidents([]);
      setError("Failed to load incidents. Please try again later.");
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
        regionId: formData.regionId,
        station: formData.station,
        commander: formData.commander,
        startTime: formData.startTime,
        estimatedDuration: formData.estimatedDuration,
        riskLevel: formData.riskLevel,
        status: formData.status
      });

      // Validate required fields
      if (!formData.title || !formData.description || !formData.priority || !formData.location.address) {
        setError("Please fill in all required fields");
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      // Validate title length (3-200 characters)
      if (formData.title.length < 3 || formData.title.length > 200) {
        setError("Title must be between 3 and 200 characters");
        toast({
          title: "Validation Error",
          description: "Title must be between 3 and 200 characters",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      // Validate description length (10-1000 characters)
      if (formData.description.length < 10 || formData.description.length > 1000) {
        setError("Description must be between 10 and 1000 characters");
        toast({
          title: "Validation Error",
          description: "Description must be between 10 and 1000 characters",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      // Validate coordinates
      if (!formData.location.coordinates || 
          !Array.isArray(formData.location.coordinates) || 
          formData.location.coordinates.length !== 2 ||
          formData.location.coordinates.some(coord => coord === null || isNaN(Number(coord)))) {
        console.warn("Invalid coordinates detected:", formData.location.coordinates);
        
        toast({
          title: "Coordinate Warning",
          description: "Using default coordinates for France. Please select a valid address.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Create intervention with the enhanced service
      const result = await createIntervention({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        location: formData.location,
        regionId: formData.regionId,
        station: formData.station,
        commander: formData.commander,
        startTime: formData.startTime,
        estimatedDuration: formData.estimatedDuration,
        riskLevel: formData.riskLevel,
        status: formData.status,
        hazards: formData.hazards || []
      });
      
      if (result.success) {
        // Show success toast
        toast({
          title: "Intervention Created",
          description: result.error 
            ? "Created with mock data due to API issues" 
            : "Intervention successfully created",
          status: result.error ? "warning" : "success",
          duration: 5000,
          isClosable: true,
        });
        
        // If there was an API error but we still have mock data
        if (result.error) {
          console.warn(result.error);
          toast({
            title: "API Warning",
            description: result.error,
            status: "warning",
            duration: 7000,
            isClosable: true,
          });
        }
        
        // Add the new intervention to the list
        if (result.data) {
          setIncidents(prev => [result.data, ...prev]);
        }
        
        // Reset form and close modal
        setFormData({
          title: "",
          description: "",
          type: "fire",
          priority: "MEDIUM",
          location: {
            address: "",
            latitude: 46.603354,
            longitude: 1.888334,
            coordinates: [1.888334, 46.603354]
          },
          regionId: "507f1f77bcf86cd799439011",
          station: "507f1f77bcf86cd799439011",
          commander: "507f1f77bcf86cd799439011",
          startTime: new Date().toISOString(),
          estimatedDuration: 60,
          riskLevel: "medium",
          hazards: [],
          status: "pending"
        });
        setIsModalOpen(false);
      } else {
        // This shouldn't happen with our new implementation, but just in case
        setError("Failed to create intervention");
        toast({
          title: "Error",
          description: "Failed to create intervention",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error("Error creating intervention:", err);
      setError(err.message || "An unexpected error occurred");
      
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
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
                <>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <FaPlus className="mr-2" /> Nouvelle intervention
                  </button>
                  {process.env.NODE_ENV === 'development' && (
                    <button 
                      className="btn btn-outline btn-sm ml-2"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const result = await testInterventionCreation();
                          if (result.success) {
                            toast({
                              title: "Test Successful",
                              description: "API test completed successfully",
                              status: "success",
                              duration: 5000,
                              isClosable: true,
                            });
                            console.log("Test result:", result.data);
                          } else {
                            toast({
                              title: "Test Failed",
                              description: result.error || "Unknown error",
                              status: "error",
                              duration: 5000,
                              isClosable: true,
                            });
                            console.error("Test error:", result);
                          }
                        } catch (err) {
                          console.error("Error running test:", err);
                          toast({
                            title: "Test Error",
                            description: "Failed to run API test",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                          });
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Test API
                    </button>
                  )}
                </>
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
                        // Ensure incidents is an array before filtering
                        Array.isArray(incidents) && incidents
                          .filter(incident => 
                            searchTerm === "" || 
                            (incident.title && incident.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (incident.location?.address && incident.location.address.toLowerCase().includes(searchTerm.toLowerCase()))
                          )
                          .map((incident) => (
                            <tr key={incident._id} className="hover:bg-gray-700 border-b border-gray-700">
                              <td>{incident._id}</td>
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
                                  <Link href={`/incidents/${incident._id}`} className="btn btn-xs btn-outline">
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
                    minLength={3}
                    maxLength={200}
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
                    <span className="label-text text-white">Durée estimée (minutes)</span>
                  </label>
                  <input
                    type="number"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                    placeholder="Durée estimée en minutes"
                    className="input input-bordered bg-gray-700 text-white"
                    min={1}
                    required
                  />
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

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Date de début</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime ? formData.startTime.slice(0, 16) : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date();
                      setFormData({
                        ...formData,
                        startTime: date.toISOString()
                      });
                    }}
                    className="input input-bordered bg-gray-700 text-white"
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
                  minLength={10}
                  maxLength={1000}
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