import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { FaFire, FaUsers, FaMapMarkedAlt, FaUserCircle, FaClipboardList } from "react-icons/fa";
import dynamic from "next/dynamic";

// Import map component dynamically to avoid SSR issues
const MapSection = dynamic(() => import("@/components/Mapsection"), { ssr: false });

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Define types for our data
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

interface UserStatus {
  status: string;
  location?: {
    coordinates: [number, number];
  };
  currentIntervention?: string;
  team?: {
    _id: string;
    name: string;
    members: number;
  };
}

const Dashboard = () => {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [recentInterventions, setRecentInterventions] = useState<Intervention[]>([]);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/LoginPage");
    } else if (!isLoading && isLoggedIn && user) {
      fetchDashboardData();
    }
  }, [isLoggedIn, isLoading, router, user]);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      
      // Fetch recent interventions
      const interventionsResponse = await axios.get(`${API_URL}/v1/interventions/recent`, {
        withCredentials: true
      });
      
      if (interventionsResponse.data && interventionsResponse.data.data) {
        setRecentInterventions(interventionsResponse.data.data.interventions);
      }
      
      // Fetch user status
      if (user && user._id) {
        const userStatusResponse = await axios.get(`${API_URL}/v1/users/${user._id}/status`, {
          withCredentials: true
        });
        
        if (userStatusResponse.data && userStatusResponse.data.data) {
          setUserStatus(userStatusResponse.data.data);
          
          // If user is in a team, fetch team members
          if (userStatusResponse.data.data.team && userStatusResponse.data.data.team._id) {
            const teamResponse = await axios.get(`${API_URL}/v1/teams/${userStatusResponse.data.data.team._id}/members`, {
              withCredentials: true
            });
            
            if (teamResponse.data && teamResponse.data.data) {
              setTeamMembers(teamResponse.data.data.members);
            }
          }
        }
      }
      
      setDashboardLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
      setDashboardLoading(false);
    }
  };

  // Function to update user status
  const updateUserStatus = async (newStatus: string) => {
    try {
      await axios.patch(`${API_URL}/v1/users/${user?._id}/status`, {
        status: newStatus
      }, {
        withCredentials: true
      });
      
      // Refresh dashboard data after status update
      fetchDashboardData();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status. Please try again.");
    }
  };

  if (isLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader color="#0066CC" size={50} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          {error && (
            <div className="alert alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* User Status Card */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FaUserCircle className="mr-2 text-primary" />
                Votre Statut
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">Statut actuel</div>
                  <div className="stat-value text-lg">
                    <span className={`badge ${
                      userStatus?.status === 'AVAILABLE' ? 'badge-success' : 
                      userStatus?.status === 'ON_DUTY' ? 'badge-warning' : 
                      userStatus?.status === 'OFF_DUTY' ? 'badge-error' : 'badge-info'
                    } p-3`}>
                      {userStatus?.status === 'AVAILABLE' ? 'Disponible' : 
                       userStatus?.status === 'ON_DUTY' ? 'En service' : 
                       userStatus?.status === 'OFF_DUTY' ? 'Hors service' : 
                       userStatus?.status || 'Non défini'}
                    </span>
                  </div>
                </div>
                
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">Équipe</div>
                  <div className="stat-value text-lg">
                    {userStatus?.team ? userStatus.team.name : 'Non assigné'}
                  </div>
                  <div className="stat-desc">
                    {userStatus?.team ? `${userStatus.team.members} membres` : ''}
                  </div>
                </div>
                
                <div className="stat bg-base-200 rounded-box">
                  <div className="stat-title">Intervention actuelle</div>
                  <div className="stat-value text-lg">
                    {userStatus?.currentIntervention ? 'En cours' : 'Aucune'}
                  </div>
                </div>
              </div>
              
              <div className="card-actions justify-end mt-4">
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-primary m-1">Mettre à jour le statut</label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a onClick={() => updateUserStatus('AVAILABLE')}>Disponible</a></li>
                    <li><a onClick={() => updateUserStatus('ON_DUTY')}>En service</a></li>
                    <li><a onClick={() => updateUserStatus('OFF_DUTY')}>Hors service</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Recent Interventions */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title flex items-center">
                  <FaFire className="mr-2 text-red-500" />
                  Interventions Récentes
                </h2>
                
                {recentInterventions.length === 0 ? (
                  <div className="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Aucune intervention récente.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Titre</th>
                          <th>Priorité</th>
                          <th>Statut</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentInterventions.map((intervention) => (
                          <tr key={intervention._id}>
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
                                intervention.status === 'DISPATCHED' ? 'badge-info' : 
                                intervention.status === 'COMPLETED' ? 'badge-success' : 'badge-error'
                              }`}>
                                {intervention.status === 'IN_PROGRESS' ? 'En cours' : 
                                 intervention.status === 'DISPATCHED' ? 'Déployée' : 
                                 intervention.status === 'COMPLETED' ? 'Terminée' : 'Urgente'}
                              </div>
                            </td>
                            <td>{new Date(intervention.createdAt).toLocaleDateString()}</td>
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
            
            {/* Team Members */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title flex items-center">
                  <FaUsers className="mr-2 text-blue-500" />
                  Membres de l'équipe
                </h2>
                
                {!userStatus?.team ? (
                  <div className="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Vous n'êtes pas assigné à une équipe.</span>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Aucun autre membre dans votre équipe.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Rôle</th>
                          <th>Statut</th>
                          <th>Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.map((member) => (
                          <tr key={member._id}>
                            <td>
                              <div className="flex items-center space-x-3">
                                <div className="avatar placeholder">
                                  <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                                    <span>{member.firstName.charAt(0)}{member.lastName.charAt(0)}</span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold">{member.firstName} {member.lastName}</div>
                                  <div className="text-sm opacity-50">{member.badgeNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td>{member.role}</td>
                            <td>
                              <div className={`badge ${
                                member.status === 'AVAILABLE' ? 'badge-success' : 
                                member.status === 'ON_DUTY' ? 'badge-warning' : 'badge-error'
                              }`}>
                                {member.status}
                              </div>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-circle btn-outline">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Map Section */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FaMapMarkedAlt className="mr-2 text-green-500" />
                Carte des interventions
              </h2>
              
              <div className="h-96 w-full rounded-lg overflow-hidden">
                <MapSection />
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FaClipboardList className="mr-2 text-purple-500" />
                Actions rapides
              </h2>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <button className="btn btn-primary">
                  Voir mon planning
                </button>
                <button className="btn btn-secondary">
                  Consulter les équipements
                </button>
                <button className="btn btn-accent">
                  Signaler un problème
                </button>
                <button className="btn btn-info">
                  Demander un renfort
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;