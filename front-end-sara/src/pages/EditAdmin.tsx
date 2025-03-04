// pages/EditAdmin.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import Head from "@/components/Head";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

const EditAdmin = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState<Admin>({
    id: "",
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (id) {
      const fetchAdmin = async () => {
        const response = await fetch(`/api/admins/${id}`);
        const data: Admin = await response.json();
        setFormData(data);
      };

      fetchAdmin();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/admins/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admins");
      } else {
        console.error("Erreur lors de la modification de l'administrateur");
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admins/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admins");
      } else {
        console.error("Erreur lors de la suppression de l'administrateur");
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head />
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin email"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a role</option>
              <option value="Firefighter">Firefighter</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Officier de Commandement">Officier de Commandement</option>
              <option value="Coordonnateur Régional">Coordonnateur Régional</option>
              <option value="Logistic Officer">Logistic Officer</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete Account
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditAdmin;