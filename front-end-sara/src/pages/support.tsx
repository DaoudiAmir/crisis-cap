import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { FaQuestionCircle, FaBook, FaHeadset, FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

// FAQ item interface
interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const Support = () => {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openFAQs, setOpenFAQs] = useState<string[]>([]);
  
  // Sample FAQ data
  const faqs: FAQItem[] = [
    {
      question: "Comment mettre à jour mon statut d'intervention ?",
      answer: "Pour mettre à jour votre statut d'intervention, accédez au tableau de bord, sélectionnez l'intervention concernée et utilisez le menu déroulant 'Statut' pour choisir votre nouveau statut. Confirmez en cliquant sur 'Mettre à jour'. Tous les membres de l'équipe et le centre de commandement seront automatiquement notifiés du changement.",
      category: "interventions"
    },
    {
      question: "Comment partager ma localisation avec mon équipe ?",
      answer: "Pour partager votre localisation, assurez-vous que la géolocalisation est activée sur votre appareil. Dans l'application, accédez à votre profil, puis à 'Paramètres de localisation' et activez 'Partage de localisation'. Vous pouvez choisir de partager votre position uniquement pendant les interventions ou en permanence avec votre équipe.",
      category: "localisation"
    },
    {
      question: "Comment consulter les transcriptions d'appels d'urgence ?",
      answer: "Les transcriptions d'appels sont disponibles dans la section 'Détails de l'intervention'. Cliquez sur l'onglet 'Communications' puis sur 'Transcriptions d'appels'. Vous pouvez filtrer par date ou par mot-clé pour trouver rapidement l'information recherchée.",
      category: "communications"
    },
    {
      question: "Comment assigner des tâches aux membres de mon équipe ?",
      answer: "En tant que chef d'équipe, accédez à la page 'Gestion des équipes', sélectionnez votre équipe, puis cliquez sur 'Assigner des tâches'. Vous pourrez sélectionner chaque membre et lui attribuer une tâche spécifique avec une description, une priorité et une échéance.",
      category: "equipes"
    },
    {
      question: "Comment accéder aux données météorologiques pour une intervention ?",
      answer: "Les données météorologiques sont automatiquement intégrées à chaque fiche d'intervention. Dans les détails de l'intervention, consultez le widget météo en haut à droite. Pour des prévisions plus détaillées, cliquez sur 'Voir plus' pour accéder aux données complètes, y compris la direction du vent et les précipitations prévues.",
      category: "interventions"
    },
    {
      question: "Comment signaler un problème technique dans l'application ?",
      answer: "Pour signaler un problème technique, accédez à 'Paramètres' puis 'Support technique'. Cliquez sur 'Signaler un problème' et remplissez le formulaire en détaillant le problème rencontré. Vous pouvez également joindre des captures d'écran. Notre équipe technique vous répondra sous 24 heures ouvrées.",
      category: "technique"
    },
    {
      question: "Comment modifier mes informations personnelles ?",
      answer: "Pour modifier vos informations personnelles, accédez à votre profil en cliquant sur votre avatar en haut à droite, puis sélectionnez 'Modifier le profil'. Vous pourrez mettre à jour vos coordonnées, votre photo et vos préférences de notification. N'oubliez pas de cliquer sur 'Enregistrer' pour confirmer vos modifications.",
      category: "compte"
    },
    {
      question: "Comment consulter l'historique des interventions passées ?",
      answer: "L'historique des interventions est accessible depuis le menu principal en cliquant sur 'Historique des interventions'. Vous pouvez filtrer par date, type d'incident ou statut. Pour les interventions auxquelles vous avez participé, consultez la section 'Mes interventions' dans votre profil.",
      category: "interventions"
    },
    {
      question: "Comment utiliser le système de communication radio intégré ?",
      answer: "Le système de communication radio intégré est accessible depuis l'écran d'intervention en cliquant sur l'icône radio. Sélectionnez le canal approprié, puis maintenez le bouton 'Parler' enfoncé pour transmettre. Assurez-vous que votre microphone est correctement configuré dans les paramètres de l'application.",
      category: "communications"
    },
    {
      question: "Comment accéder aux rapports statistiques des interventions ?",
      answer: "Les rapports statistiques sont disponibles dans la section 'Statistiques' du menu principal. Vous pouvez générer des rapports personnalisés en sélectionnant la période, le type d'intervention et d'autres paramètres. Les rapports peuvent être exportés en PDF ou Excel pour un usage hors ligne.",
      category: "statistiques"
    }
  ];

  // Toggle FAQ open/closed state
  const toggleFAQ = (question: string) => {
    if (openFAQs.includes(question)) {
      setOpenFAQs(openFAQs.filter(q => q !== question));
    } else {
      setOpenFAQs([...openFAQs, question]);
    }
  };

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(faqs.map(faq => faq.category)))];

  // Redirect if not logged in
  if (!isLoading && !isLoggedIn) {
    router.push("/LoginPage");
    return null;
  }

  return (
    <div className="flex h-screen bg-base-100">
      <Head>
        <title>Aide et Support | Crisis-Cap</title>
      </Head>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Aide et Support</h1>
            <p className="text-base-content/70">
              Trouvez des réponses à vos questions et obtenez de l'aide pour utiliser la plateforme Crisis-Cap.
            </p>
          </div>
          
          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card bg-primary text-primary-content">
              <div className="card-body">
                <h2 className="card-title"><FaQuestionCircle className="mr-2" /> FAQ</h2>
                <p>Consultez notre base de connaissances pour trouver rapidement des réponses à vos questions.</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-sm" onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    Voir la FAQ
                  </button>
                </div>
              </div>
            </div>
            
            <div className="card bg-secondary text-secondary-content">
              <div className="card-body">
                <h2 className="card-title"><FaBook className="mr-2" /> Documentation</h2>
                <p>Accédez à notre documentation détaillée pour maîtriser toutes les fonctionnalités.</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-sm" onClick={() => router.push('/documentation')}>
                    Consulter
                  </button>
                </div>
              </div>
            </div>
            
            <div className="card bg-accent text-accent-content">
              <div className="card-body">
                <h2 className="card-title"><FaHeadset className="mr-2" /> Support Technique</h2>
                <p>Besoin d'aide personnalisée ? Contactez notre équipe de support technique.</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-sm" onClick={() => router.push('/contact-support')}>
                    Contacter
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div id="faq-section" className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Questions fréquemment posées</h2>
            
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="form-control flex-1">
                <div className="input-group">
                  <input 
                    type="text" 
                    placeholder="Rechercher dans la FAQ..." 
                    className="input input-bordered w-full" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-square">
                    <FaSearch />
                  </button>
                </div>
              </div>
              
              <select 
                className="select select-bordered" 
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
              >
                <option value="all">Toutes les catégories</option>
                {categories.filter(c => c !== "all").map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq, index) => (
                  <div key={index} className="collapse collapse-arrow bg-base-200">
                    <input 
                      type="checkbox" 
                      checked={openFAQs.includes(faq.question)} 
                      onChange={() => toggleFAQ(faq.question)}
                    /> 
                    <div className="collapse-title text-xl font-medium flex items-center">
                      <span className="badge badge-primary mr-2">{faq.category}</span>
                      {faq.question}
                    </div>
                    <div className="collapse-content"> 
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xl mb-4">Aucune question ne correspond à votre recherche.</p>
                  <p>Essayez de modifier vos critères de recherche ou contactez notre support technique.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="mt-16 card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Vous n'avez pas trouvé votre réponse ?</h2>
              <p className="mb-4">Envoyez-nous votre question et notre équipe vous répondra dans les plus brefs délais.</p>
              
              <form className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Sujet</span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option disabled selected>Sélectionnez un sujet</option>
                    <option>Problème technique</option>
                    <option>Question sur les fonctionnalités</option>
                    <option>Suggestion d'amélioration</option>
                    <option>Autre</option>
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Votre question</span>
                  </label>
                  <textarea className="textarea textarea-bordered h-24" placeholder="Décrivez votre problème ou posez votre question..."></textarea>
                </div>
                
                <div className="form-control mt-6">
                  <button className="btn btn-primary">Envoyer</button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Support;
