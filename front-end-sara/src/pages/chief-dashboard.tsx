import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { FaFire, FaUsers, FaAmbulance, FaMapMarkerAlt, FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Ensure consistent API base URL format
const getApiEndpoint = (path: string) => {
  // If API_URL already ends with '/api', just append '/v1' and the path
  // Otherwise append '/api/v1' and the path
  return API_URL.endsWith('/api')
    ? `${API_URL}/v1${path}`
    : `${API_URL}/api/v1${path}`;
};

// Define types
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
  teams: Team[];
}

interface Team {
  _id: string;
  name: string;
  members: number;
  status: string;
}

interface ResourceSummary {
  totalTeams: number;
  availableTeams: number;
  totalVehicles: number;
  availableVehicles: number;
  totalFirefighters: number;
  availableFirefighters: number;
}

const ChiefDashboard = () => {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [activeInterventions, setActiveInterventions] = useState<Intervention[]>([]);
  const [resourceSummary, setResourceSummary] = useState<ResourceSummary>({
    totalTeams: 0,
    availableTeams: 0,
    totalVehicles: 0,
    availableVehicles: 0,
    totalFirefighters: 0,
    availableFirefighters: 0
  });
  const [highRiskAreas, setHighRiskAreas] = useState<any[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authorized to access this page
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/LoginPage");
    } else if (!isLoading && isLoggedIn && user) {
      if (user.role !== 'OFFICER' && user.role !== 'REGIONAL_COORDINATOR') {
        router.push("/dashboard");
      } else {
        fetchDashboardData();
      }
    }
  }, [isLoggedIn, isLoading, router, user]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      
      // Fetch active interventions
      const interventionsResponse = await axios.get(getApiEndpoint('/interventions?status=IN_PROGRESS,DISPATCHED&limit=5'));
      
      if (interventionsResponse.data && interventionsResponse.data.data) {
        setActiveInterventions(interventionsResponse.data.data.interventions);
      }
      
      // Fetch resource summary
      const resourcesResponse = await axios.get(getApiEndpoint('/resources/summary'));
      
      if (resourcesResponse.data && resourcesResponse.data.data) {
        setResourceSummary(resourcesResponse.data.data);
      }
      
      // Fetch high risk areas (mock data for now)
      setHighRiskAreas([
        { id: 1, name: "Downtown", riskLevel: "High", incidents: 12 },
        { id: 2, name: "Industrial Zone", riskLevel: "Medium", incidents: 8 },
        { id: 3, name: "Residential Area", riskLevel: "Low", incidents: 3 }
      ]);
      
      setDashboardLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
      setDashboardLoading(false);
    }
  };

  // Handle intervention selection
  const handleInterventionSelect = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
  };

  if (isLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader color="#0066CC" size={50} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Tableau de bord du chef {user?.firstName} {user?.lastName}
          </h1>
          <div className="badge badge-primary p-3">
            {user?.role === 'OFFICER' ? 'Officier' : 'Coordinateur Régional'}
          </div>
        </div>
        
        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {/* Resource Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <FaUsers className="text-3xl" />
              </div>
              <div className="stat-title">Pompiers</div>
              <div className="stat-value">{resourceSummary.availableFirefighters}/{resourceSummary.totalFirefighters}</div>
              <div className="stat-desc">Disponibles</div>
            </div>
          </div>
          
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <FaUsers className="text-3xl" />
              </div>
              <div className="stat-title">Équipes</div>
              <div className="stat-value">{resourceSummary.availableTeams}/{resourceSummary.totalTeams}</div>
              <div className="stat-desc">Disponibles</div>
            </div>
          </div>
          
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-accent">
                <FaAmbulance className="text-3xl" />
              </div>
              <div className="stat-title">Véhicules</div>
              <div className="stat-value">{resourceSummary.availableVehicles}/{resourceSummary.totalVehicles}</div>
              <div className="stat-desc">Disponibles</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Active Interventions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FaFire className="mr-2 text-red-500" />
                Interventions Actives
              </h2>
              
              {activeInterventions.length === 0 ? (
                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Aucune intervention active actuellement.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Priorité</th>
                        <th>Statut</th>
                        <th>Équipes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeInterventions.map((intervention) => (
                        <tr key={intervention._id} className={selectedIntervention?._id === intervention._id ? "bg-primary bg-opacity-10" : ""}>
                          <td>{intervention.title}</td>
                          <td>
                            <div className={`badge ${
                              intervention.priority === 'HIGH' ? 'badge-error' : 
                              intervention.priority === 'MEDIUM' ? 'badge-warning' : 'badge-info'
                            }`}>
                              {intervention.priority === 'HIGH' ? 'Haute' : 
                               intervention.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                            </div>
                          </td>
                          <td>
                            <div className={`badge ${
                              intervention.status === 'IN_PROGRESS' ? 'badge-warning' : 
                              intervention.status === 'DISPATCHED' ? 'badge-info' : 'badge-success'
                            }`}>
                              {intervention.status === 'IN_PROGRESS' ? 'En cours' : 
                               intervention.status === 'DISPATCHED' ? 'Déployée' : 'Terminée'}
                            </div>
                          </td>
                          <td>{intervention.teams?.length || 0}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleInterventionSelect(intervention)}
                            >
                              Détails
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary" onClick={() => router.push('/AllIncidents')}>
                  Voir toutes les interventions
                </button>
              </div>
            </div>
          </div>
          
          {/* Intervention Details or High Risk Areas */}
          {selectedIntervention ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h2 className="card-title">Détails de l'intervention</h2>
                  <button 
                    className="btn btn-sm btn-circle"
                    onClick={() => setSelectedIntervention(null)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{selectedIntervention.title}</h3>
                    <p className="text-gray-600">{selectedIntervention.description}</p>
                    
                    <div className="mt-4">
                      <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="mr-2 text-gray-600" />
                        <span>{selectedIntervention.location.address}</span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <FaCalendarAlt className="mr-2 text-gray-600" />
                        <span>{new Date(selectedIntervention.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Équipes assignées</h4>
                    {selectedIntervention.teams && selectedIntervention.teams.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {selectedIntervention.teams.map(team => (
                          <li key={team._id}>
                            {team.name} - {team.members} membres - {team.status}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">Aucune équipe assignée</p>
                    )}
                    
                    <div className="mt-4 flex space-x-2">
                      <button className="btn btn-sm btn-primary">Assigner des équipes</button>
                      <button className="btn btn-sm btn-secondary">Modifier le statut</button>
                    </div>
                  </div>
                </div>
                
                <div className="card-actions justify-end mt-4">
                  <button 
                    className="btn btn-outline btn-primary"
                    onClick={() => router.push(`/intervention/${selectedIntervention._id}`)}
                  >
                    Voir tous les détails
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title flex items-center">
                  <FaExclamationTriangle className="mr-2 text-yellow-500" />
                  Zones à risque élevé
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Zone</th>
                        <th>Niveau de risque</th>
                        <th>Incidents récents</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highRiskAreas.map((area) => (
                        <tr key={area.id}>
                          <td>{area.name}</td>
                          <td>
                            <div className={`badge ${
                              area.riskLevel === 'High' ? 'badge-error' : 
                              area.riskLevel === 'Medium' ? 'badge-warning' : 'badge-info'
                            }`}>
                              {area.riskLevel}
                            </div>
                          </td>
                          <td>{area.incidents}</td>
                          <td>
                            <button className="btn btn-sm btn-primary">
                              Analyser
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary">
                    Voir toutes les zones
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Actions rapides</h2>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <button className="btn btn-primary" onClick={() => router.push('/AddIncidents')}>
                Nouvelle intervention
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/AddAdmin')}>
                Ajouter un pompier
              </button>
              <button className="btn btn-accent" onClick={() => router.push('/RessourceManagement')}>
                Gérer les ressources
              </button>
              <button className="btn btn-info">
                Générer un rapport
              </button>
              <button className="btn btn-warning">
                Alertes météo
              </button>
              <button className="btn btn-error">
                Situation d'urgence
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChiefDashboard;
