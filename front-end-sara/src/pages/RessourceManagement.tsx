// pages/ResourceManagementPage.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Head from "@/components/Head";

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  caserne: string;
}

const ResourceManagementPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [caserneFilter, setCaserneFilter] = useState("");

  // Charger les ressources depuis l'API
  useEffect(() => {
    const fetchResources = async () => {
      const response = await fetch("/api/resources");
      const data: Resource[] = await response.json();
      setResources(data);
    };

    fetchResources();
  }, []);

  // Supprimer une ressource
  const handleDeleteResource = async (id: string) => {
    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setResources((prev) => prev.filter((resource) => resource.id !== id));
      } else {
        console.error("Erreur lors de la suppression de la ressource");
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  // Filtrer les ressources par caserne
  const filteredResources = caserneFilter
    ? resources.filter((resource) => resource.caserne === caserneFilter)
    : resources;

  return (
    <div className="min-h-screen flex flex-col">
      <Head />
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-6">Gestion des Ressources</h1>

        {/* Filtre par caserne */}
        <div className="mb-6">
          <label htmlFor="caserneFilter" className="block text-sm font-medium text-gray-700">
            Filtrer par caserne
          </label>
          <input
            type="text"
            id="caserneFilter"
            value={caserneFilter}
            onChange={(e) => setCaserneFilter(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Entrez le nom de la caserne"
          />
        </div>

        {/* Bouton pour ajouter une ressource */}
        <div className="mb-6">
          <Link
            href="/AddEditResource"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ajouter une ressource
          </Link>
        </div>

        {/* Liste des ressources */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Liste des ressources</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="p-3">Nom</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Caserne</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => (
                  <tr key={resource.id} className="border-b">
                    <td className="p-3">{resource.name}</td>
                    <td className="p-3">{resource.type}</td>
                    <td className="p-3">{resource.status}</td>
                    <td className="p-3">{resource.caserne}</td>
                    <td className="p-3 space-x-2">
                      <Link
                        href={`/AddEditResource?id=${resource.id}`}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResourceManagementPage;