import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaBook, FaVideo, FaClipboard, FaCheckCircle, FaLock } from "react-icons/fa";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

// Define training module types
interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  image: string;
  completed: boolean;
  locked: boolean;
}

const Training = () => {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  
  // Sample training modules data
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([
    {
      id: "module-1",
      title: "Fondamentaux de la lutte contre les incendies",
      description: "Apprenez les bases de la lutte contre les incendies, y compris les types de feux, les équipements de protection et les techniques de base.",
      duration: "2 heures",
      level: "Débutant",
      image: "/training/fire-basics.jpg",
      completed: true,
      locked: false
    },
    {
      id: "module-2",
      title: "Coordination d'équipe en situation d'urgence",
      description: "Développez des compétences de leadership et de coordination pour gérer efficacement votre équipe lors d'interventions critiques.",
      duration: "3 heures",
      level: "Intermédiaire",
      image: "/training/team-coordination.jpg",
      completed: false,
      locked: false
    },
    {
      id: "module-3",
      title: "Utilisation avancée des équipements spécialisés",
      description: "Formation approfondie sur l'utilisation des équipements spécialisés pour les interventions complexes.",
      duration: "4 heures",
      level: "Avancé",
      image: "/training/advanced-equipment.jpg",
      completed: false,
      locked: true
    },
    {
      id: "module-4",
      title: "Secourisme et premiers soins",
      description: "Techniques essentielles de premiers soins pour les situations d'urgence sur le terrain.",
      duration: "2.5 heures",
      level: "Débutant",
      image: "/training/first-aid.jpg",
      completed: false,
      locked: false
    },
    {
      id: "module-5",
      title: "Gestion des crises majeures",
      description: "Stratégies et protocoles pour la gestion des incidents à grande échelle impliquant plusieurs équipes.",
      duration: "5 heures",
      level: "Avancé",
      image: "/training/crisis-management.jpg",
      completed: false,
      locked: true
    },
    {
      id: "module-6",
      title: "Communication radio efficace",
      description: "Maîtrisez les protocoles de communication radio pour une coordination optimale pendant les interventions.",
      duration: "1.5 heures",
      level: "Intermédiaire",
      image: "/training/radio-communication.jpg",
      completed: false,
      locked: false
    }
  ]);

  // Function to handle starting a training module
  const startTraining = (moduleId: string) => {
    // In a real app, this would navigate to the specific training module
    router.push(`/training/${moduleId}`);
  };

  // Filter modules based on search or category (could be expanded)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const filteredModules = trainingModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || module.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  // Redirect if not logged in
  if (!isLoading && !isLoggedIn) {
    router.push("/LoginPage");
    return null;
  }

  return (
    <div className="flex h-screen bg-base-100">
      <Head>
        <title>Formation | Crisis-Cap</title>
      </Head>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Centre de Formation</h1>
            <p className="text-base-content/70">
              Améliorez vos compétences avec nos modules de formation spécialisés pour les services d'urgence.
            </p>
          </div>
          
          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="form-control flex-1">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Rechercher des formations..." 
                  className="input input-bordered w-full" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-square btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <select 
              className="select select-bordered" 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">Tous les niveaux</option>
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
            </select>
          </div>
          
          {/* Training Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <div key={module.id} className="card bg-base-200 shadow-xl overflow-hidden">
                <figure className="relative h-48">
                  {/* Fallback image if the actual image doesn't exist */}
                  <div className="w-full h-full bg-gradient-to-r from-primary/30 to-secondary/30 flex items-center justify-center">
                    <FaBook size={48} className="text-primary/50" />
                  </div>
                  
                  {/* Status indicators */}
                  {module.completed && (
                    <div className="absolute top-2 right-2 bg-success text-white p-1 rounded-full">
                      <FaCheckCircle size={20} />
                    </div>
                  )}
                  {module.locked && (
                    <div className="absolute inset-0 bg-base-300/80 flex items-center justify-center">
                      <FaLock size={32} className="text-base-content/50" />
                    </div>
                  )}
                </figure>
                
                <div className="card-body">
                  <h2 className="card-title">{module.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-base-content/70 mb-2">
                    <span className="badge badge-outline">{module.level}</span>
                    <span>{module.duration}</span>
                  </div>
                  <p className="text-sm mb-4">{module.description}</p>
                  
                  <div className="card-actions justify-end mt-auto">
                    <button 
                      className={`btn ${module.locked ? 'btn-disabled' : 'btn-primary'}`}
                      onClick={() => !module.locked && startTraining(module.id)}
                      disabled={module.locked}
                    >
                      {module.completed ? 'Revoir' : module.locked ? 'Verrouillé' : 'Commencer'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* If no modules match the filters */}
          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl">Aucun module de formation ne correspond à votre recherche.</p>
            </div>
          )}
          
          {/* Training Progress */}
          <div className="mt-12 card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Votre progression</h2>
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <span>Progression globale</span>
                  <span>{Math.round((trainingModules.filter(m => m.completed).length / trainingModules.length) * 100)}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={trainingModules.filter(m => m.completed).length} 
                  max={trainingModules.length}
                ></progress>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Training;
