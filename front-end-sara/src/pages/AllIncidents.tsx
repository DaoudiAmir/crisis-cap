import Link from "next/link";
import Head from "@/components/Head";
import Footer from "@/components/Footer";

const AllIncidents = () => {
  const incidents = [
    {
      id: 1,
      name: "Incident 1",
      type: "Fire, Residential",
      address: "Place de la Bastille, 75011 Paris, France",
      description: "Fire in kitchen",
    },
    {
      id: 2,
      name: "Incident 2",
      type: "Accident, Traffic",
      address: "Avenue Montaigne, 75008 Paris, France",
      description: "Car crash",
    },
    {
      id: 3,
      name: "Incident 3",
      type: "Flood, Residential",
      address: "Rue de la République, 69001 Lyon, France",
      description: "Basement flooded",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Head/>
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-6">All Incidents</h1>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="p-3">Incident</th>
                <th className="p-3">Type & Category</th>
                <th className="p-3">Address</th>
                <th className="p-3">Description</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id} className="border-b">
                  <td className="p-3">{incident.name}</td>
                  <td className="p-3">{incident.type}</td>
                  <td className="p-3">{incident.address}</td>
                  <td className="p-3">{incident.description}</td>
                  <td className="p-3">
                    <Link
                      href={`/incidents/${incident.id}`} 
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllIncidents;