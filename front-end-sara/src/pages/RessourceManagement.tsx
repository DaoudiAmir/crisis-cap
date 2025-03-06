// pages/ResourceManagementPage.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaEdit, FaTrash, FaPlus, FaFilter, FaSync } from "react-icons/fa";
import Footer from "@/components/Footer";
import Head from "@/components/Head";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import * as resourceService from "@/services/resourceService";
import useToast from "@/components/Toast";

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  station: string;
  capacity?: number;
  lastMaintenance?: string;
}

const ResourceManagementPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [stationFilter, setStationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  // Load resources using the resourceService
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const data = await resourceService.getAllResources();
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les ressources",
          status: "error"
        });
        // Use mock data as fallback
        setResources(getMockResources());
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [toast]);

  // Delete a resource
  const handleDeleteResource = async (id: string) => {
    try {
      await resourceService.deleteResource(id);
      setResources((prev) => prev.filter((resource) => resource.id !== id));
      toast({
        title: "Succès",
        description: "Ressource supprimée avec succès",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la ressource",
        status: "error"
      });
    }
  };

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    return (
      (stationFilter ? resource.station === stationFilter : true) &&
      (typeFilter ? resource.type === typeFilter : true) &&
      (statusFilter ? resource.status === statusFilter : true)
    );
  });

  // Get unique stations for filter
  const stations = [...new Set(resources.map((r) => r.station))];
  // Get unique types for filter
  const types = [...new Set(resources.map((r) => r.type))];
  // Get unique statuses for filter
  const statuses = [...new Set(resources.map((r) => r.status))];

  // Mock data generator for fallback
  const getMockResources = (): Resource[] => {
    return [
      {
        id: "res-001",
        name: "Camion Incendie T45",
        type: "Véhicule",
        status: "Disponible",
        station: "Station Paris Centre",
        capacity: 4500,
        lastMaintenance: "2023-12-15"
      },
      {
        id: "res-002",
        name: "Ambulance A12",
        type: "Véhicule",
        status: "En intervention",
        station: "Station Paris Nord",
        capacity: 2,
        lastMaintenance: "2024-01-20"
      },
      {
        id: "res-003",
        name: "Drone de reconnaissance",
        type: "Équipement",
        status: "En maintenance",
        station: "Station Lyon Est",
        lastMaintenance: "2024-02-10"
      },
      {
        id: "res-004",
        name: "Camion échelle E30",
        type: "Véhicule",
        status: "Disponible",
        station: "Station Paris Centre",
        capacity: 30,
        lastMaintenance: "2024-01-05"
      }
    ];
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Head title="Gestion des Ressources | Crisis-Cap" />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Gestion des Ressources" />
          
          <main className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gestion des Ressources</h1>
              <Link href="/AddEditResource" className="btn btn-primary">
                <FaPlus className="mr-2" /> Ajouter une ressource
              </Link>
            </div>

            {/* Filters */}
            <div className="bg-base-200 p-4 rounded-lg mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Station</span>
                  </label>
                  <select 
                    className="select select-bordered w-full max-w-xs" 
                    value={stationFilter} 
                    onChange={(e) => setStationFilter(e.target.value)}
                  >
                    <option value="">Toutes les stations</option>
                    {stations.map((station) => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Type</span>
                  </label>
                  <select 
                    className="select select-bordered w-full max-w-xs" 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">Tous les types</option>
                    {types.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Statut</span>
                  </label>
                  <select 
                    className="select select-bordered w-full max-w-xs" 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tous les statuts</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-control flex items-end">
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setStationFilter("");
                      setTypeFilter("");
                      setStatusFilter("");
                    }}
                  >
                    <FaFilter className="mr-2" /> Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            {/* Resources Table */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Type</th>
                      <th>Statut</th>
                      <th>Station</th>
                      <th>Dernière maintenance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map((resource) => (
                      <tr key={resource.id}>
                        <td>{resource.name}</td>
                        <td>{resource.type}</td>
                        <td>
                          <span className={`badge badge-${
                            resource.status === "Disponible" ? "success" :
                            resource.status === "En intervention" ? "warning" :
                            resource.status === "En maintenance" ? "info" : "error"
                          }`}>
                            {resource.status}
                          </span>
                        </td>
                        <td>{resource.station}</td>
                        <td>{resource.lastMaintenance || "N/A"}</td>
                        <td>
                          <div className="flex gap-2">
                            <Link href={`/AddEditResource?id=${resource.id}`} className="btn btn-sm btn-outline">
                              <FaEdit />
                            </Link>
                            <button 
                              className="btn btn-sm btn-error btn-outline"
                              onClick={() => {
                                if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) {
                                  handleDeleteResource(resource.id);
                                }
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg">Aucune ressource trouvée avec ces critères.</p>
              </div>
            )}
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ResourceManagementPage;