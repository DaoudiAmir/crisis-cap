import { useState, useEffect } from "react";
import Link from "next/link";
import { FaEdit, FaTrash, FaPlus, FaFilter, FaUsers, FaUserPlus } from "react-icons/fa";
import Footer from "@/components/Footer";
import Head from "@/components/Head";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import * as resourceService from "@/services/resourceService";
import useToast from "@/components/Toast";

// Define TypeScript interfaces for our data
interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: string;
  specialization?: string;
  experience?: number;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  station: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const TeamManagementPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [stationFilter, setStationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  // Load teams using the resourceService
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const data = await resourceService.getAllTeams();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les équipes",
          status: "error"
        });
        // Use mock data as fallback
        setTeams(getMockTeams());
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [toast]);

  // Delete a team
  const handleDeleteTeam = async (id: string) => {
    try {
      await resourceService.deleteTeam(id);
      setTeams((prev) => prev.filter((team) => team.id !== id));
      toast({
        title: "Succès",
        description: "Équipe supprimée avec succès",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'équipe",
        status: "error"
      });
    }
  };

  // Filter teams
  const filteredTeams = teams.filter((team) => {
    return (
      (stationFilter ? team.station === stationFilter : true) &&
      (statusFilter ? team.status === statusFilter : true)
    );
  });

  // Get unique stations for filter
  const stations = [...new Set(teams.map((t) => t.station))];
  // Get unique statuses for filter
  const statuses = [...new Set(teams.map((t) => t.status))];

  // View team details
  const viewTeamDetails = (team: Team) => {
    setSelectedTeam(team);
    setIsTeamModalOpen(true);
  };

  // Mock data generator for fallback
  const getMockTeams = (): Team[] => {
    return [
      {
        id: "team-001",
        name: "Équipe Alpha",
        description: "Équipe d'intervention rapide spécialisée dans les urgences médicales",
        station: "Station Paris Centre",
        status: "Disponible",
        createdAt: "2023-10-15T12:00:00Z",
        updatedAt: "2024-02-20T09:45:00Z",
        members: [
          {
            id: "user-001",
            name: "Jean Dupont",
            role: "Chef d'équipe",
            status: "Disponible",
            specialization: "Urgences médicales",
            experience: 10
          },
          {
            id: "user-002",
            name: "Marie Durand",
            role: "Infirmière",
            status: "Disponible",
            specialization: "Soins intensifs",
            experience: 7
          },
          {
            id: "user-003",
            name: "Pierre Martin",
            role: "Secouriste",
            status: "Disponible",
            specialization: "Premiers secours",
            experience: 5
          }
        ]
      },
      {
        id: "team-002",
        name: "Équipe Bravo",
        description: "Équipe spécialisée dans les interventions incendie",
        station: "Station Paris Nord",
        status: "En intervention",
        createdAt: "2023-11-05T14:30:00Z",
        updatedAt: "2024-03-01T11:20:00Z",
        members: [
          {
            id: "user-004",
            name: "Luc Bernard",
            role: "Chef d'équipe",
            status: "En intervention",
            specialization: "Lutte contre les incendies",
            experience: 12
          },
          {
            id: "user-005",
            name: "Sophie Petit",
            role: "Pompier",
            status: "En intervention",
            specialization: "Sauvetage",
            experience: 8
          }
        ]
      },
      {
        id: "team-003",
        name: "Équipe Charlie",
        description: "Équipe de sauvetage en hauteur et milieux périlleux",
        station: "Station Lyon Est",
        status: "En formation",
        createdAt: "2024-01-10T09:15:00Z",
        updatedAt: "2024-02-28T16:40:00Z",
        members: [
          {
            id: "user-006",
            name: "Thomas Leroy",
            role: "Chef d'équipe",
            status: "Disponible",
            specialization: "Sauvetage en hauteur",
            experience: 15
          },
          {
            id: "user-007",
            name: "Julie Moreau",
            role: "Secouriste",
            status: "En formation",
            specialization: "Secours en montagne",
            experience: 6
          },
          {
            id: "user-008",
            name: "Nicolas Dubois",
            role: "Technicien",
            status: "En formation",
            specialization: "Équipements spécialisés",
            experience: 4
          }
        ]
      }
    ];
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Head title="Gestion des Équipes | Crisis-Cap" />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Gestion des Équipes" />
          
          <main className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gestion des Équipes</h1>
              <Link href="/add-team" className="btn btn-primary">
                <FaUserPlus className="mr-2" /> Créer une équipe
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
                      setStatusFilter("");
                    }}
                  >
                    <FaFilter className="mr-2" /> Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            {/* Teams Cards */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : filteredTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                  <div key={team.id} className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title">
                        {team.name}
                        <span className={`badge badge-${
                          team.status === "Disponible" ? "success" :
                          team.status === "En intervention" ? "warning" :
                          team.status === "En formation" ? "info" : "error"
                        }`}>
                          {team.status}
                        </span>
                      </h2>
                      <p className="text-sm opacity-70">{team.description}</p>
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Station:</span>
                          <span>{team.station}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Membres:</span>
                          <span>{team.members.length}</span>
                        </div>
                        <div className="avatar-group -space-x-4 mt-3">
                          {team.members.slice(0, 3).map((member) => (
                            <div key={member.id} className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content w-8 rounded-full">
                                <span className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                            </div>
                          ))}
                          {team.members.length > 3 && (
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content w-8 rounded-full">
                                <span className="text-xs">+{team.members.length - 3}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => viewTeamDetails(team)}
                        >
                          <FaUsers className="mr-1" /> Détails
                        </button>
                        <Link href={`/edit-team?id=${team.id}`} className="btn btn-sm btn-outline">
                          <FaEdit className="mr-1" /> Modifier
                        </Link>
                        <button 
                          className="btn btn-sm btn-error btn-outline"
                          onClick={() => {
                            if (window.confirm("Êtes-vous sûr de vouloir supprimer cette équipe ?")) {
                              handleDeleteTeam(team.id);
                            }
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg">Aucune équipe trouvée avec ces critères.</p>
                <button 
                  className="btn btn-primary mt-4"
                  onClick={() => {
                    setStationFilter("");
                    setStatusFilter("");
                  }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </main>
          
          {/* Team Details Modal */}
          {selectedTeam && (
            <div className={`modal ${isTeamModalOpen ? "modal-open" : ""}`}>
              <div className="modal-box w-11/12 max-w-4xl">
                <h3 className="font-bold text-lg flex justify-between">
                  {selectedTeam.name}
                  <span className={`badge badge-${
                    selectedTeam.status === "Disponible" ? "success" :
                    selectedTeam.status === "En intervention" ? "warning" :
                    selectedTeam.status === "En formation" ? "info" : "error"
                  }`}>
                    {selectedTeam.status}
                  </span>
                </h3>
                <p className="py-4">{selectedTeam.description}</p>
                
                <div className="divider">Informations</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="font-semibold">Station:</span> {selectedTeam.station}
                  </div>
                  <div>
                    <span className="font-semibold">Créée le:</span> {new Date(selectedTeam.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">Dernière mise à jour:</span> {new Date(selectedTeam.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="divider">Membres de l'équipe</div>
                
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Spécialisation</th>
                        <th>Expérience</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTeam.members.map((member) => (
                        <tr key={member.id}>
                          <td>{member.name}</td>
                          <td>{member.role}</td>
                          <td>
                            <span className={`badge badge-${
                              member.status === "Disponible" ? "success" :
                              member.status === "En intervention" ? "warning" :
                              member.status === "En formation" ? "info" : "error"
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td>{member.specialization || "N/A"}</td>
                          <td>{member.experience ? `${member.experience} ans` : "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="modal-action">
                  <button className="btn" onClick={() => setIsTeamModalOpen(false)}>Fermer</button>
                  <Link href={`/edit-team?id=${selectedTeam.id}`} className="btn btn-primary">
                    <FaEdit className="mr-2" /> Modifier
                  </Link>
                </div>
              </div>
              <div className="modal-backdrop" onClick={() => setIsTeamModalOpen(false)}></div>
            </div>
          )}
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default TeamManagementPage;
