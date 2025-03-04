import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaDownload, FaFilePdf, FaFileWord, FaFileExcel, FaFileVideo, FaSearch, FaFilter } from "react-icons/fa";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

// Resource item interface
interface Resource {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "doc" | "xls" | "video" | "image" | "other";
  category: string;
  tags: string[];
  url: string;
  dateAdded: string;
  size: string;
  downloads: number;
  featured: boolean;
}

const Resources = () => {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Sample resources data
  const resources: Resource[] = [
    {
      id: "res-001",
      title: "Guide d'intervention pour feux de forêt",
      description: "Document complet détaillant les procédures standard pour les interventions sur les feux de forêt, incluant les stratégies de confinement et d'extinction.",
      type: "pdf",
      category: "procedures",
      tags: ["feux de forêt", "intervention", "guide"],
      url: "/resources/guide-feux-foret.pdf",
      dateAdded: "2023-06-15",
      size: "4.2 MB",
      downloads: 342,
      featured: true
    },
    {
      id: "res-002",
      title: "Formulaire de rapport d'intervention",
      description: "Modèle officiel pour la rédaction des rapports d'intervention, conforme aux exigences réglementaires nationales.",
      type: "doc",
      category: "formulaires",
      tags: ["rapport", "formulaire", "documentation"],
      url: "/resources/formulaire-rapport.docx",
      dateAdded: "2023-05-22",
      size: "1.8 MB",
      downloads: 567,
      featured: false
    },
    {
      id: "res-003",
      title: "Tableau de suivi des ressources matérielles",
      description: "Outil de suivi pour la gestion des équipements et ressources matérielles lors des interventions prolongées.",
      type: "xls",
      category: "outils",
      tags: ["logistique", "ressources", "suivi"],
      url: "/resources/suivi-ressources.xlsx",
      dateAdded: "2023-07-10",
      size: "2.5 MB",
      downloads: 189,
      featured: false
    },
    {
      id: "res-004",
      title: "Formation sur l'utilisation des drones en intervention",
      description: "Vidéo de formation expliquant les protocoles d'utilisation des drones pour la reconnaissance aérienne lors des interventions.",
      type: "video",
      category: "formations",
      tags: ["drone", "reconnaissance", "formation"],
      url: "/resources/formation-drones.mp4",
      dateAdded: "2023-08-05",
      size: "156 MB",
      downloads: 231,
      featured: true
    },
    {
      id: "res-005",
      title: "Protocole de coordination inter-services",
      description: "Document détaillant les procédures de coordination entre les différents services d'urgence lors d'interventions majeures.",
      type: "pdf",
      category: "procedures",
      tags: ["coordination", "inter-services", "protocole"],
      url: "/resources/protocole-coordination.pdf",
      dateAdded: "2023-04-18",
      size: "3.7 MB",
      downloads: 412,
      featured: false
    },
    {
      id: "res-006",
      title: "Guide des communications radio",
      description: "Manuel complet sur les protocoles de communication radio, incluant les codes et procédures standardisés.",
      type: "pdf",
      category: "guides",
      tags: ["communication", "radio", "protocole"],
      url: "/resources/guide-communications.pdf",
      dateAdded: "2023-03-30",
      size: "5.1 MB",
      downloads: 378,
      featured: false
    },
    {
      id: "res-007",
      title: "Formation sur les premiers secours tactiques",
      description: "Vidéo de formation sur les techniques de premiers secours en environnement tactique et hostile.",
      type: "video",
      category: "formations",
      tags: ["premiers secours", "tactique", "formation"],
      url: "/resources/secours-tactiques.mp4",
      dateAdded: "2023-09-12",
      size: "178 MB",
      downloads: 145,
      featured: true
    },
    {
      id: "res-008",
      title: "Cartographie des risques naturels par région",
      description: "Ensemble de cartes détaillant les zones à risque pour différents types de catastrophes naturelles par région.",
      type: "pdf",
      category: "cartographie",
      tags: ["risques", "cartographie", "prévention"],
      url: "/resources/cartographie-risques.pdf",
      dateAdded: "2023-02-08",
      size: "12.3 MB",
      downloads: 267,
      featured: false
    }
  ];

  // Get unique categories and types
  const categories = ["all", ...Array.from(new Set(resources.map(res => res.category)))];
  const types = ["all", ...Array.from(new Set(resources.map(res => res.type)))];

  // Filter resources based on search, category, and type
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Function to get icon based on resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FaFilePdf className="text-red-500" size={24} />;
      case "doc":
        return <FaFileWord className="text-blue-500" size={24} />;
      case "xls":
        return <FaFileExcel className="text-green-500" size={24} />;
      case "video":
        return <FaFileVideo className="text-purple-500" size={24} />;
      default:
        return <FaFilePdf className="text-gray-500" size={24} />;
    }
  };

  // Function to handle resource download
  const downloadResource = (resource: Resource) => {
    // In a real app, this would trigger the download
    console.log(`Downloading ${resource.title}`);
    // Could increment download count in the database
  };

  // Redirect if not logged in
  if (!isLoading && !isLoggedIn) {
    router.push("/LoginPage");
    return null;
  }

  return (
    <div className="flex h-screen bg-base-100">
      <Head>
        <title>Ressources | Crisis-Cap</title>
      </Head>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Centre de Ressources</h1>
            <p className="text-base-content/70">
              Accédez à tous les documents, formulaires et ressources de formation pour optimiser vos interventions.
            </p>
          </div>
          
          {/* Featured Resources */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ressources en vedette</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resources.filter(res => res.featured).map(resource => (
                <div key={resource.id} className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-start gap-3">
                      {getResourceIcon(resource.type)}
                      <div>
                        <h3 className="card-title text-lg">{resource.title}</h3>
                        <div className="badge badge-primary mt-1">{resource.category}</div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm">{resource.description}</p>
                    <div className="card-actions justify-end mt-4">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => downloadResource(resource)}
                      >
                        <FaDownload className="mr-2" /> Télécharger
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="bg-base-200 p-4 rounded-lg mb-8">
            <div className="flex flex-wrap gap-4">
              <div className="form-control flex-1">
                <div className="input-group">
                  <input 
                    type="text" 
                    placeholder="Rechercher des ressources..." 
                    className="input input-bordered w-full" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-square">
                    <FaSearch />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <select 
                  className="select select-bordered" 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.filter(c => c !== "all").map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                
                <select 
                  className="select select-bordered" 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  {types.filter(t => t !== "all").map(type => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* All Resources */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Toutes les ressources</h2>
            
            {filteredResources.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Titre</th>
                      <th className="hidden md:table-cell">Catégorie</th>
                      <th className="hidden lg:table-cell">Date d'ajout</th>
                      <th className="hidden lg:table-cell">Taille</th>
                      <th className="hidden md:table-cell">Téléchargements</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map(resource => (
                      <tr key={resource.id} className="hover">
                        <td>{getResourceIcon(resource.type)}</td>
                        <td>
                          <div>
                            <div className="font-bold">{resource.title}</div>
                            <div className="text-sm opacity-50 truncate max-w-xs">{resource.description}</div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          <div className="badge badge-outline">{resource.category}</div>
                        </td>
                        <td className="hidden lg:table-cell">{resource.dateAdded}</td>
                        <td className="hidden lg:table-cell">{resource.size}</td>
                        <td className="hidden md:table-cell">{resource.downloads}</td>
                        <td>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => downloadResource(resource)}
                          >
                            <FaDownload />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-base-200 rounded-lg">
                <FaSearch size={48} className="mx-auto text-base-content/30 mb-4" />
                <p className="text-xl mb-2">Aucune ressource ne correspond à votre recherche</p>
                <p className="text-base-content/70">Essayez de modifier vos critères de recherche ou de filtrage</p>
              </div>
            )}
          </div>
          
          {/* Resource Request */}
          <div className="mt-16 card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Vous ne trouvez pas ce que vous cherchez ?</h2>
              <p className="mb-4">Demandez une ressource spécifique à notre équipe de documentation.</p>
              
              <form className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Type de ressource demandée</span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option disabled selected>Sélectionnez un type</option>
                    <option>Document procédural</option>
                    <option>Formulaire</option>
                    <option>Guide technique</option>
                    <option>Matériel de formation</option>
                    <option>Autre</option>
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description de la ressource</span>
                  </label>
                  <textarea className="textarea textarea-bordered h-24" placeholder="Décrivez la ressource dont vous avez besoin..."></textarea>
                </div>
                
                <div className="form-control mt-6">
                  <button className="btn btn-primary">Soumettre la demande</button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Resources;
