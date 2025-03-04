import { useState } from "react";

const RecentIncidents = () => {
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

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
  ];

  const showDetails = (description: string) => {
    setSelectedIncident(description);
  };

  const closeModal = () => {
    setSelectedIncident(null);
  };

  return (
    <section className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Recent Incidents</h2>
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
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => showDetails(incident.description)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Incident Details</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                &#10006;
              </button>
            </div>
            <p>{selectedIncident}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default RecentIncidents;