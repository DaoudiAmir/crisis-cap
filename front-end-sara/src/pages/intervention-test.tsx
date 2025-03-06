import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from '@/components/Head';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { createIntervention } from '@/services/interventionService';
import useToast from '@/components/Toast';
import AddressAutocomplete from '@/components/AddressAutocomplete';

const InterventionTestPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: 'Test Intervention',
    description: 'This is a test intervention',
    type: 'fire',
    priority: 'MEDIUM',
    location: {
      type: 'Point',
      coordinates: [null, null] as [number | null, number | null],
      address: ''
    },
    status: 'pending',
    region: '',
    station: '',
    startTime: new Date().toISOString(),
    createdBy: 'system'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddressSelect = (address: string, coordinates: { latitude: number; longitude: number; coordinates: [number, number] }) => {
    console.log('Address selected:', address);
    console.log('Coordinates:', coordinates);
    
    setFormData({
      ...formData,
      location: {
        type: 'Point',
        coordinates: coordinates.coordinates,
        address: address
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('Submitting intervention with data:', formData);
      const response = await createIntervention(formData);
      setResult(response);
      
      if (response.success) {
        toast({
          title: 'Succès',
          description: 'Intervention créée avec succès',
          status: 'success'
        });
      } else {
        toast({
          title: 'Erreur',
          description: response.error || 'Échec de la création de l\'intervention',
          status: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating intervention:', error);
      setResult({ error: 'Exception occurred', details: error });
      toast({
        title: 'Erreur',
        description: 'Une exception s\'est produite lors de la création',
        status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Head title="Test de Création d'Intervention" />
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test de Création d'Intervention</h1>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">Titre</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input input-bordered bg-gray-700 text-white"
                      required
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">Type</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="select select-bordered bg-gray-700 text-white"
                      required
                    >
                      <option value="fire">Incendie</option>
                      <option value="medical">Médical</option>
                      <option value="rescue">Sauvetage</option>
                      <option value="hazmat">Matières dangereuses</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">Priorité</span>
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="select select-bordered bg-gray-700 text-white"
                      required
                    >
                      <option value="LOW">Basse</option>
                      <option value="MEDIUM">Moyenne</option>
                      <option value="HIGH">Haute</option>
                      <option value="CRITICAL">Critique</option>
                    </select>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">Statut</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="select select-bordered bg-gray-700 text-white"
                    >
                      <option value="pending">En attente</option>
                      <option value="dispatched">Dispatché</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Terminé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">Station</span>
                    </label>
                    <input
                      type="text"
                      name="station"
                      value={formData.station}
                      onChange={handleInputChange}
                      className="input input-bordered bg-gray-700 text-white"
                      placeholder="Laissez vide pour utiliser la valeur par défaut"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">Région</span>
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="input input-bordered bg-gray-700 text-white"
                      placeholder="Laissez vide pour utiliser la valeur par défaut"
                    />
                  </div>
                  
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text text-white">Adresse</span>
                    </label>
                    <AddressAutocomplete
                      onAddressSelect={handleAddressSelect}
                      placeholder="Entrez une adresse"
                      className="w-full"
                    />
                    <div className="text-xs mt-1 text-gray-400">
                      Adresse actuelle: {formData.location.address || 'Non spécifiée'}
                    </div>
                    <div className="text-xs mt-1 text-gray-400">
                      Coordonnées: {formData.location.coordinates[0] !== null ? `[${formData.location.coordinates[0]}, ${formData.location.coordinates[1]}]` : 'Non spécifiées'}
                    </div>
                  </div>
                  
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text text-white">Description</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="textarea textarea-bordered bg-gray-700 text-white h-24"
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Création en cours...
                      </>
                    ) : (
                      'Créer l\'intervention'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {result && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Résultat</h2>
                <div className="bg-gray-700 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default InterventionTestPage;
