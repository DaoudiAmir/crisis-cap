import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const Header = () => {
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isResourceOpen, setIsResourceOpen] = useState(false);

  const handleLogout = () => {
    console.log("Déconnexion réussie");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="text-xl font-bold">FireSphere</span>
        </div>

        <nav className="flex-1 flex justify-center">
          <ul className="flex space-x-6">
            <li className="relative group">
              <span
                className="text-black font-semibold hover:text-red-600 cursor-pointer"
                onClick={() => setIsIncidentOpen(!isIncidentOpen)}
              >
                Incidents
              </span>
              {isIncidentOpen && (
                <ul className="absolute left-0 mt-2 space-y-2 bg-white shadow-lg">
                  <li>
                    <Link
                      href="/AllIncidents"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsIncidentOpen(false)}
                    >
                      All Incidents
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/AddIncidents"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsIncidentOpen(false)}
                    >
                      Add Incidents
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li className="relative group">
              <span
                className="text-black font-semibold hover:text-red-600 cursor-pointer"
                onClick={() => setIsResourceOpen(!isResourceOpen)}
              >
                Ressources
              </span>
              {isResourceOpen && (
                <ul className="absolute left-0 mt-2 space-y-2 bg-white shadow-lg">
                  <li>
                    <Link
                      href="/RessourceManagement"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsResourceOpen(false)}
                    >
                      Gestion des Ressources
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/AddEditResource"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsResourceOpen(false)}
                    >
                      Ajouter/Modifier une Ressource
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li className="relative group">
              <span
                className="text-black font-semibold hover:text-red-600 cursor-pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                Profile
              </span>
              {isProfileOpen && (
                <ul className="absolute left-0 mt-2 space-y-2 bg-white shadow-lg">
                  <li>
                    <Link
                      href="/AddAdmin"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Add Admin
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/EditAdmin"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Edit Admin
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;