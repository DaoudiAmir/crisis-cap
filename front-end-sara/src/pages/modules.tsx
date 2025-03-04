import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaFire, FaUsers, FaTruck, FaMapMarkerAlt, FaChartLine, FaMobileAlt, FaClipboardCheck, FaDatabase } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Feature module interface
interface FeatureModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  benefits: string[];
}

const Modules = () => {
  const router = useRouter();

  // Feature modules data
  const modules: FeatureModule[] = [
    {
      id: "incident-management",
      title: "Gestion des Interventions",
      description: "Système complet de gestion des interventions d'urgence, permettant de suivre en temps réel l'état des opérations, d'assigner des ressources et de coordonner les équipes sur le terrain.",
      icon: <FaFire size={24} className="text-red-500" />,
      image: "/modules/incident-management.jpg",
      benefits: [
        "Suivi en temps réel des interventions",
        "Assignation automatique des ressources",
        "Historique complet des opérations",
        "Rapports détaillés post-intervention"
      ]
    },
    {
      id: "team-coordination",
      title: "Coordination d'Équipes",
      description: "Outils avancés pour la gestion et la coordination des équipes d'intervention, facilitant la communication et assurant une réponse efficace aux situations d'urgence.",
      icon: <FaUsers size={24} className="text-blue-500" />,
      image: "/modules/team-coordination.jpg",
      benefits: [
        "Communication instantanée entre équipes",
        "Gestion des disponibilités du personnel",
        "Suivi des compétences et certifications",
        "Planification des rotations d'équipes"
      ]
    },
    {
      id: "resource-management",
      title: "Gestion des Ressources",
      description: "Système intégré pour la gestion des véhicules, équipements et matériels, permettant d'optimiser l'utilisation des ressources et de maintenir leur état opérationnel.",
      icon: <FaTruck size={24} className="text-green-500" />,
      image: "/modules/resource-management.jpg",
      benefits: [
        "Inventaire en temps réel des équipements",
        "Suivi de la maintenance des véhicules",
        "Gestion des stocks de consommables",
        "Optimisation de la distribution des ressources"
      ]
    },
    {
      id: "geospatial-intelligence",
      title: "Intelligence Géospatiale",
      description: "Cartographie avancée et analyse géospatiale pour visualiser les incidents, planifier les interventions et optimiser le déploiement des ressources sur le terrain.",
      icon: <FaMapMarkerAlt size={24} className="text-purple-500" />,
      image: "/modules/geospatial-intelligence.jpg",
      benefits: [
        "Cartographie en temps réel des incidents",
        "Analyse des zones à risque",
        "Optimisation des itinéraires d'intervention",
        "Visualisation des ressources sur le terrain"
      ]
    },
    {
      id: "analytics-reporting",
      title: "Analyse et Rapports",
      description: "Outils d'analyse de données et de génération de rapports pour évaluer les performances, identifier les tendances et améliorer continuellement les opérations.",
      icon: <FaChartLine size={24} className="text-yellow-500" />,
      image: "/modules/analytics-reporting.jpg",
      benefits: [
        "Tableaux de bord personnalisables",
        "Rapports automatisés périodiques",
        "Analyse prédictive des risques",
        "Indicateurs de performance clés"
      ]
    },
    {
      id: "mobile-access",
      title: "Accès Mobile",
      description: "Applications mobiles dédiées permettant aux équipes sur le terrain d'accéder aux informations critiques, de mettre à jour les statuts d'intervention et de communiquer efficacement.",
      icon: <FaMobileAlt size={24} className="text-orange-500" />,
      image: "/modules/mobile-access.jpg",
      benefits: [
        "Accès aux données même hors connexion",
        "Mise à jour en temps réel des statuts",
        "Capture de photos et vidéos sur le terrain",
        "Navigation GPS intégrée"
      ]
    },
    {
      id: "compliance-standards",
      title: "Conformité et Normes",
      description: "Outils pour assurer la conformité aux réglementations et normes en vigueur dans le domaine de la sécurité civile et des services d'urgence.",
      icon: <FaClipboardCheck size={24} className="text-teal-500" />,
      image: "/modules/compliance-standards.jpg",
      benefits: [
        "Suivi automatisé des exigences réglementaires",
        "Documentation standardisée des interventions",
        "Audits de conformité intégrés",
        "Mise à jour automatique des procédures"
      ]
    },
    {
      id: "data-integration",
      title: "Intégration de Données",
      description: "Capacités d'intégration avec les systèmes existants et les sources de données externes pour une vision complète et unifiée des opérations.",
      icon: <FaDatabase size={24} className="text-indigo-500" />,
      image: "/modules/data-integration.jpg",
      benefits: [
        "API ouvertes pour l'intégration de systèmes tiers",
        "Connecteurs pour les systèmes d'alerte nationaux",
        "Import/export de données standardisé",
        "Synchronisation avec les bases de données externes"
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Fonctionnalités | Crisis-Cap</title>
        <meta name="description" content="Découvrez les fonctionnalités avancées de Crisis-Cap pour la gestion des interventions d'urgence et la coordination des équipes de secours." />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative w-full h-80 bg-cover bg-center" style={{ backgroundImage: "url('/hero-modules.jpg')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Fonctionnalités de Crisis-Cap</h1>
            <p className="text-xl text-white max-w-3xl">
              Une suite complète d'outils pour optimiser la gestion des interventions d'urgence et sauver des vies
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-base-100">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-6">Une plateforme intégrée pour les services d'urgence</h2>
              <p className="text-lg">
                Crisis-Cap offre une suite complète de modules conçus spécifiquement pour répondre aux besoins des services d'incendie et de secours. Notre plateforme s'adapte à vos processus existants tout en apportant des améliorations significatives en termes d'efficacité et de coordination.
              </p>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modules.map((module) => (
                <div key={module.id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <figure className="h-48 bg-gray-300 relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-primary/20 to-secondary/20">
                      {module.icon}
                    </div>
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title flex items-center">
                      {module.icon}
                      <span className="ml-2">{module.title}</span>
                    </h3>
                    <p className="my-4">{module.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2">Avantages clés :</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {module.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => router.push(`/modules/${module.id}`)}
                      >
                        En savoir plus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-16 bg-base-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold mb-6">Une solution qui s'intègre à votre écosystème</h2>
                <p className="mb-4">
                  Crisis-Cap a été conçu pour s'intégrer parfaitement à vos systèmes existants, minimisant ainsi les perturbations opérationnelles tout en maximisant les bénéfices.
                </p>
                <p className="mb-6">
                  Notre architecture ouverte et nos API documentées permettent une intégration fluide avec vos outils de gestion, systèmes de communication et bases de données.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push('/integration')}
                >
                  Découvrir nos options d'intégration
                </button>
              </div>
              <div className="lg:w-1/2 bg-base-300 p-8 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Compatibilité avec :</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-primary mr-3"></div>
                    <span>Systèmes d'alerte nationaux</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-primary mr-3"></div>
                    <span>Logiciels de gestion des services d'incendie</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-primary mr-3"></div>
                    <span>Systèmes de répartition assistée par ordinateur</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-primary mr-3"></div>
                    <span>Plateformes SIG et cartographiques</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-primary mr-3"></div>
                    <span>Systèmes de gestion des ressources humaines</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-primary mr-3"></div>
                    <span>Logiciels de maintenance des équipements</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-primary mr-3"></div>
                    <span>Systèmes de communication radio</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-content">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Prêt à transformer votre gestion des interventions ?</h2>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Rejoignez les services d'urgence qui font confiance à Crisis-Cap pour améliorer leur efficacité opérationnelle et sauver plus de vies.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                className="btn btn-secondary"
                onClick={() => router.push('/contact')}
              >
                Demander une démonstration
              </button>
              <button 
                className="btn btn-outline border-white text-white hover:bg-white hover:text-primary"
                onClick={() => router.push('/contact')}
              >
                Contacter un conseiller
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Modules;
