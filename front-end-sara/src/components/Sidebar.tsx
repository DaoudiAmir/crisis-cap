import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { 
  FaHome, 
  FaFire, 
  FaUsers, 
  FaUserCircle, 
  FaTruck, 
  FaClipboardList, 
  FaChartLine, 
  FaCog, 
  FaSignOutAlt 
} from "react-icons/fa";

const Sidebar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Check if the current route matches the given path
  const isActive = (path: string) => {
    return router.pathname === path;
  };
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push("/LoginPage");
  };

  return (
    <div className="w-64 bg-base-200 fixed h-screen overflow-y-auto shadow-lg">
      {/* Logo and App Name */}
      <div className="flex items-center p-4 border-b border-base-300">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content">
            <FaFire size={20} />
          </div>
        </div>
        <span className="text-xl font-bold ml-2">Crisis-Cap</span>
      </div>
      
      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-12">
                <span>{user.firstName?.charAt(0) || ""}{user.lastName?.charAt(0) || ""}</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs opacity-70">{user.role}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Menu */}
      <ul className="menu p-2 text-base-content">
        {/* Dashboard */}
        <li>
          <Link href="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
            <FaHome className="mr-2" />
            Tableau de bord
          </Link>
        </li>
        
        {/* Interventions */}
        <li className="menu-title">
          <span>Interventions</span>
        </li>
        <li>
          <Link href="/AllIncidents" className={isActive("/AllIncidents") ? "active" : ""}>
            <FaFire className="mr-2" />
            Toutes les interventions
          </Link>
        </li>
        <li>
          <Link href="/AddIncidents" className={isActive("/AddIncidents") ? "active" : ""}>
            <FaClipboardList className="mr-2" />
            Ajouter une intervention
          </Link>
        </li>
        
        {/* Teams */}
        <li className="menu-title">
          <span>Équipes</span>
        </li>
        <li>
          <Link href="/teams" className={isActive("/teams") ? "active" : ""}>
            <FaUsers className="mr-2" />
            Gestion des équipes
          </Link>
        </li>
        
        {/* Resources */}
        <li className="menu-title">
          <span>Ressources</span>
        </li>
        <li>
          <Link href="/vehicles" className={isActive("/vehicles") ? "active" : ""}>
            <FaTruck className="mr-2" />
            Véhicules
          </Link>
        </li>
        <li>
          <Link href="/equipment" className={isActive("/equipment") ? "active" : ""}>
            <FaClipboardList className="mr-2" />
            Équipements
          </Link>
        </li>
        
        {/* Admin Section - Only show for admin roles */}
        {user && (user.role === "ADMIN" || user.role === "REGIONAL_COORDINATOR") && (
          <>
            <li className="menu-title">
              <span>Administration</span>
            </li>
            <li>
              <Link href="/analytics" className={isActive("/analytics") ? "active" : ""}>
                <FaChartLine className="mr-2" />
                Statistiques
              </Link>
            </li>
            <li>
              <Link href="/settings" className={isActive("/settings") ? "active" : ""}>
                <FaCog className="mr-2" />
                Paramètres
              </Link>
            </li>
            <li>
              <Link href="/profile/edit-admin" className={isActive("/profile/edit-admin") ? "active" : ""}>
                <FaUserCircle className="mr-2" />
                Gestion des utilisateurs
              </Link>
            </li>
          </>
        )}
      </ul>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <button 
          className="btn btn-outline btn-block" 
          onClick={handleLogout}
        >
          <FaSignOutAlt className="mr-2" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;