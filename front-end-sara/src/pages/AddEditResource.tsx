// pages/AddEditResourcePage.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import Head from "@/components/Head";

interface Resource {
  id: string;
  name: string;
  type: string;
  status: string;
  caserne: string;
}

const AddEditResourcePage = () => {
  const router = useRouter();
  const { id } = router.query; // Récupérer l'ID de la ressource depuis l'URL (pour la modification)

  const [formData, setFormData] = useState<Resource>({
    id: "",
    name: "",
    type: "",
    status: "Available",
    caserne: "",
  });

  // Charger les données de la ressource à modifier (si l'ID est présent)
  useEffect(() => {
    if (id) {
      const fetchResource = async () => {
        const response = await fetch(`/api/resources/${id}`);
        const data: Resource = await response.json();
        setFormData(data);
      };

      fetchResource();
    }
  }, [id]);

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Soumettre le formulaire (ajout ou modification)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = id ? `/api/resources/${id}` : "/api/resources";
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Rediriger vers la page de gestion des ressources après l'ajout/modification
        router.push("/ResourceManagement");
      } else {
        console.error("Erreur lors de la soumission du formulaire");
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head />
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-6">
          {id ? "Modifier une ressource" : "Ajouter une ressource"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ : Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom de la ressource
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Camion 1"
              required
            />
          </div>

          {/* Champ : Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type de ressource
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Camion, Équipement"
              required
            />
          </div>

          {/* Champ : Statut */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Available">Disponible</option>
              <option value="In Use">En cours d'utilisation</option>
              <option value="Maintenance">En maintenance</option>
            </select>
          </div>

          {/* Champ : Caserne */}
          <div>
            <label htmlFor="caserne" className="block text-sm font-medium text-gray-700">
              Caserne
            </label>
            <input
              type="text"
              id="caserne"
              name="caserne"
              value={formData.caserne}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Caserne A"
              required
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {id ? "Modifier" : "Ajouter"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AddEditResourcePage;