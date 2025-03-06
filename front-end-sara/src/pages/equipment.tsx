import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaFilter, FaSync, FaTools, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import Footer from "@/components/Footer";
import Head from "@/components/Head";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import * as resourceService from "@/services/resourceService";
import useToast from "@/components/Toast";
import { Resource, ResourceStatus } from "@/services/resourceService";

// Define equipment-specific interface
interface Equipment extends Resource {
  lastMaintenance?: string;
  nextMaintenance?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
}

// Equipment status badge component
const StatusBadge = ({ status }: { status: ResourceStatus }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'badge-success';
      case 'assigned':
        return 'badge-warning';
      case 'unavailable':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className={`badge ${getStatusColor()} gap-1`}>
      {status === 'available' && <FaCheck />}
      {status === 'unavailable' && <FaExclamationTriangle />}
      {status === 'assigned' && <FaTools />}
      {status.replace('_', ' ')}
    </div>
  );
};

const EquipmentManagementPage = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [stationFilter, setStationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    status: "available" as ResourceStatus,
    station: "",
    capabilities: [] as string[],
  });
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  // Load equipment using the resourceService
  useEffect(() => {
    fetchEquipment();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [equipment, stationFilter, statusFilter]);

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const data = await resourceService.getAllEquipment();
      setEquipment(data as Equipment[]);
      setFilteredEquipment(data as Equipment[]);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les équipements",
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...equipment];

    if (stationFilter) {
      filtered = filtered.filter(
        (item) => item.station?.toLowerCase().includes(stationFilter.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (item) => item.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredEquipment(filtered);
  };

  const resetFilters = () => {
    setStationFilter("");
    setStatusFilter("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement?")) {
      try {
        const result = await resourceService.deleteEquipment(id);
        if (result.success) {
          toast({
            title: "Succès",
            description: "Équipement supprimé avec succès",
            status: "success"
          });
          fetchEquipment();
        } else {
          toast({
            title: "Erreur",
            description: result.error || "Échec de la suppression de l'équipement",
            status: "error"
          });
        }
      } catch (error) {
        console.error("Error deleting equipment:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la suppression",
          status: "error"
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCapabilitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capabilities = e.target.value.split(',').map(cap => cap.trim());
    setFormData({
      ...formData,
      capabilities,
    });
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await resourceService.createEquipment({
        name: formData.name,
        type: 'Equipment',
        status: formData.status,
        station: formData.station,
        capabilities: formData.capabilities,
      });

      if (result.success) {
        toast({
          title: "Succès",
          description: "Équipement ajouté avec succès",
          status: "success"
        });
        setShowAddModal(false);
        resetForm();
        fetchEquipment();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Échec de l'ajout de l'équipement",
          status: "error"
        });
      }
    } catch (error) {
      console.error("Error adding equipment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout",
        status: "error"
      });
    }
  };

  const handleEditEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEquipment) return;

    try {
      const result = await resourceService.updateEquipment(currentEquipment._id, {
        name: formData.name,
        type: 'Equipment',
        status: formData.status,
        station: formData.station,
        capabilities: formData.capabilities,
      });

      if (result.success) {
        toast({
          title: "Succès",
          description: "Équipement mis à jour avec succès",
          status: "success"
        });
        setShowEditModal(false);
        resetForm();
        fetchEquipment();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Échec de la mise à jour de l'équipement",
          status: "error"
        });
      }
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour",
        status: "error"
      });
    }
  };

  const openEditModal = (equipment: Equipment) => {
    setCurrentEquipment(equipment);
    setFormData({
      name: equipment.name,
      serialNumber: equipment.serialNumber || "",
      model: equipment.model || "",
      manufacturer: equipment.manufacturer || "",
      status: equipment.status,
      station: equipment.station || "",
      capabilities: equipment.capabilities || [],
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      serialNumber: "",
      model: "",
      manufacturer: "",
      status: "available",
      station: "",
      capabilities: [],
    });
    setCurrentEquipment(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Head title="Gestion des Équipements" />
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gestion des Équipements</h1>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="mr-2" /> Ajouter un équipement
              </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Station</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrer par station"
                    className="input input-bordered bg-gray-700 text-white"
                    value={stationFilter}
                    onChange={(e) => setStationFilter(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Statut</span>
                  </label>
                  <select
                    className="select select-bordered bg-gray-700 text-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="available">Disponible</option>
                    <option value="assigned">Assigné</option>
                    <option value="unavailable">Indisponible</option>
                  </select>
                </div>
                <div className="form-control mt-8">
                  <button
                    className="btn btn-outline btn-info"
                    onClick={resetFilters}
                  >
                    <FaFilter className="mr-2" /> Réinitialiser
                  </button>
                </div>
                <div className="form-control mt-8">
                  <button
                    className="btn btn-outline btn-success"
                    onClick={fetchEquipment}
                  >
                    <FaSync className="mr-2" /> Rafraîchir
                  </button>
                </div>
              </div>
            </div>

            {/* Equipment Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : filteredEquipment.length > 0 ? (
                <table className="table w-full bg-gray-800 text-white">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Numéro de série</th>
                      <th>Station</th>
                      <th>Statut</th>
                      <th>Dernière maintenance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipment.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.serialNumber || "N/A"}</td>
                        <td>{item.station || "N/A"}</td>
                        <td>
                          <StatusBadge status={item.status} />
                        </td>
                        <td>{item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString() : "N/A"}</td>
                        <td className="flex gap-2">
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => openEditModal(item)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDelete(item._id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                  <p className="text-xl">Aucun équipement trouvé</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-gray-800">
            <h3 className="font-bold text-lg mb-4">Ajouter un équipement</h3>
            <form onSubmit={handleAddEquipment}>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-white">Nom</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom de l'équipement"
                  className="input input-bordered bg-gray-700 text-white"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-white">Numéro de série</span>
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  placeholder="Numéro de série"
                  className="input input-bordered bg-gray-700 text-white"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-white">Station</span>
                </label>
                <input
                  type="text"
                  name="station"
                  placeholder="Station"
                  className="input input-bordered bg-gray-700 text-white"
                  value={formData.station}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-white">Statut</span>
                </label>
                <select
                  name="status"
                  className="select select-bordered bg-gray-700 text-white"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="available">Disponible</option>
                  <option value="assigned">Assigné</option>
                  <option value="unavailable">Indisponible</option>
                </select>
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-white">Capacités (séparées par des virgules)</span>
                </label>
                <input
                  type="text"
                  name="capabilities"
                  placeholder="ex: incendie, secours, médical"
                  className="input input-bordered bg-gray-700 text-white"
                  value={formData.capabilities.join(', ')}
                  onChange={handleCapabilitiesChange}
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  Ajouter
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-gray-800">
            <h3 className="font-bold text-lg mb-4">Modifier l'équipement</h3>
            <form onSubmit={handleEditEquipment}>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-white">Nom</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom de l'équipement"
                  className="input input-bordered bg-gray-700 text-white"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-white">Numéro de série</span>
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  placeholder="Numéro de série"
                  className="input input-bordered bg-gray-700 text-white"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-white">Station</span>
                </label>
                <input
                  type="text"
                  name="station"
                  placeholder="Station"
                  className="input input-bordered bg-gray-700 text-white"
                  value={formData.station}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-white">Statut</span>
                </label>
                <select
                  name="status"
                  className="select select-bordered bg-gray-700 text-white"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="available">Disponible</option>
                  <option value="assigned">Assigné</option>
                  <option value="unavailable">Indisponible</option>
                </select>
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text text-white">Capacités (séparées par des virgules)</span>
                </label>
                <input
                  type="text"
                  name="capabilities"
                  placeholder="ex: incendie, secours, médical"
                  className="input input-bordered bg-gray-700 text-white"
                  value={formData.capabilities.join(', ')}
                  onChange={handleCapabilitiesChange}
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  Mettre à jour
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentManagementPage;
