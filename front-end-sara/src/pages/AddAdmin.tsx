import { useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import Head from "@/components/Head";

const AddAdmin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admins");
      } else {
        console.error("Erreur lors de l'ajout de l'administrateur");
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head />
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-6">Add Admin</h1>
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
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Admin
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AddAdmin;