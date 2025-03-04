import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { FaBell, FaSearch, FaMoon, FaSun, FaSignOutAlt, FaUser, FaCog, FaUserCircle } from "react-icons/fa";

const Header = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [theme, setTheme] = useState<string>("light");
  const [currentTime, setCurrentTime] = useState<string>("");

  // Get current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Mock notifications - in a real app, these would come from an API
  useEffect(() => {
    // Simulating notifications
    setNotifications([
      {
        id: 1,
        title: "Nouvelle intervention",
        message: "Incendie signalé à Paris 15ème",
        time: "Il y a 5 min",
        read: false
      },
      {
        id: 2,
        title: "Équipe mobilisée",
        message: "L'équipe Alpha a été déployée",
        time: "Il y a 15 min",
        read: false
      },
      {
        id: 3,
        title: "Rapport disponible",
        message: "Le rapport d'intervention #1234 est disponible",
        time: "Il y a 1h",
        read: true
      }
    ]);
  }, []);

  return (
    <header className="bg-base-100 p-3 shadow-md">
      <div className="flex justify-between items-center">
        {/* Left side - Page title */}
        <div>
          <h1 className="text-xl font-bold">
            {router.pathname === "/dashboard" && "Tableau de bord"}
            {router.pathname === "/AllIncidents" && "Toutes les interventions"}
            {router.pathname === "/AddIncidents" && "Ajouter une intervention"}
            {router.pathname === "/teams" && "Gestion des équipes"}
            {router.pathname === "/vehicles" && "Véhicules"}
            {router.pathname === "/equipment" && "Équipements"}
            {router.pathname === "/analytics" && "Statistiques"}
            {router.pathname === "/settings" && "Paramètres"}
            {router.pathname === "/profile" && "Mon Profil"}
            {router.pathname === "/training" && "Centre de Formation"}
            {router.pathname === "/support" && "Aide et Support"}
            {router.pathname === "/resources" && "Centre de Ressources"}
            {router.pathname === "/about" && "À Propos"}
          </h1>
          <p className="text-sm opacity-70">
            {currentTime} | {user?.station?.name || "Station non assignée"}
          </p>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="input input-bordered w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <FaSearch className="text-gray-400" />
            </button>
          </form>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button 
            className="btn btn-circle btn-ghost" 
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
          
          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-circle btn-ghost indicator">
              <FaBell />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="indicator-item badge badge-primary badge-sm">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </label>
            <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-80 p-2 shadow bg-base-100">
              <div className="card-body">
                <h3 className="font-bold text-lg">Notifications</h3>
                <div className="divider my-0"></div>
                {notifications.length === 0 ? (
                  <p className="text-center py-4">Aucune notification</p>
                ) : (
                  <ul className="space-y-2 max-h-64 overflow-auto">
                    {notifications.map((notification) => (
                      <li 
                        key={notification.id} 
                        className={`p-2 rounded-lg ${notification.read ? 'bg-base-200' : 'bg-base-300'}`}
                      >
                        <div className="font-semibold">{notification.title}</div>
                        <p className="text-sm">{notification.message}</p>
                        <div className="text-xs opacity-70 mt-1">{notification.time}</div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="card-actions justify-end mt-2">
                  <button className="btn btn-primary btn-sm">Tout marquer comme lu</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-circle btn-ghost avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span>{user?.firstName?.charAt(0) || ""}{user?.lastName?.charAt(0) || ""}</span>
              </div>
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <Link href="/profile" className="flex items-center">
                  <FaUserCircle className="mr-2" />
                  Mon Profil
                </Link>
              </li>
              <li>
                <Link href="/settings" className="flex items-center">
                  <FaCog className="mr-2" />
                  Paramètres
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="flex items-center text-error">
                  <FaSignOutAlt className="mr-2" />
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;