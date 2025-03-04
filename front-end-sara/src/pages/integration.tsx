import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaPlug, FaExchangeAlt, FaLock, FaCloud, FaCode, FaDatabase, FaRocket, FaTools } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Integration type interface
interface IntegrationType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

// Integration partner interface
interface IntegrationPartner {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
}

const Integration = () => {
  const router = useRouter();

  // Integration types data
  const integrationTypes: IntegrationType[] = [
    {
      id: "api",
      title: "API RESTful",
      description: "Notre API RESTful complète permet une intégration flexible avec vos systèmes existants, offrant un accès sécurisé à toutes les fonctionnalités de Crisis-Cap.",
      icon: <FaCode size={24} className="text-blue-500" />,
      features: [
        "Documentation complète avec exemples de code",
        "Authentification OAuth 2.0",
        "Versionnement des API pour une compatibilité durable",
        "Limites de débit configurables",
        "Environnements de test et de production"
      ]
    },
    {
      id: "webhooks",
      title: "Webhooks",
      description: "Recevez des notifications en temps réel sur vos systèmes lorsque des événements spécifiques se produisent dans Crisis-Cap, permettant des actions automatisées.",
      icon: <FaExchangeAlt size={24} className="text-green-500" />,
      features: [
        "Notifications en temps réel",
        "Filtrage par type d'événement",
        "Tentatives automatiques en cas d'échec",
        "Signatures de sécurité pour la validation",
        "Journal des livraisons pour le débogage"
      ]
    },
    {
      id: "data-import",
      title: "Import de données",
      description: "Importez facilement des données depuis vos systèmes existants vers Crisis-Cap, assurant une transition fluide et minimisant la double saisie.",
      icon: <FaDatabase size={24} className="text-purple-500" />,
      features: [
        "Support des formats CSV, JSON et XML",
        "Mappages de données personnalisables",
        "Validation et nettoyage des données",
        "Imports planifiés ou à la demande",
        "Journalisation détaillée des erreurs"
      ]
    },
    {
      id: "sso",
      title: "Authentification unique (SSO)",
      description: "Intégrez Crisis-Cap à votre système d'authentification existant pour offrir une expérience de connexion fluide à vos utilisateurs.",
      icon: <FaLock size={24} className="text-red-500" />,
      features: [
        "Support SAML 2.0 et OpenID Connect",
        "Intégration avec Active Directory",
        "Authentification multi-facteurs",
        "Provisionnement automatique des utilisateurs",
        "Politiques de sécurité personnalisables"
      ]
    },
    {
      id: "cloud",
      title: "Intégration cloud",
      description: "Déployez Crisis-Cap dans votre environnement cloud préféré ou utilisez notre solution SaaS entièrement gérée.",
      icon: <FaCloud size={24} className="text-cyan-500" />,
      features: [
        "Compatible avec AWS, Azure et Google Cloud",
        "Options de déploiement hybride",
        "Sauvegardes automatisées",
        "Mise à l'échelle automatique",
        "Surveillance et alertes intégrées"
      ]
    },
    {
      id: "custom",
      title: "Intégrations personnalisées",
      description: "Notre équipe d'experts peut développer des intégrations sur mesure pour répondre à vos besoins spécifiques et s'adapter à votre écosystème unique.",
      icon: <FaTools size={24} className="text-orange-500" />,
      features: [
        "Analyse des besoins détaillée",
        "Développement sur mesure",
        "Tests rigoureux",
        "Documentation complète",
        "Support dédié post-déploiement"
      ]
    }
  ];

  // Integration partners data
  const integrationPartners: IntegrationPartner[] = [
    {
      id: "partner-1",
      name: "EmergencyAlert",
      logo: "/partners/emergency-alert.png",
      description: "Système national d'alerte et de notification pour les situations d'urgence",
      category: "Alertes"
    },
    {
      id: "partner-2",
      name: "RescueTrack",
      logo: "/partners/rescue-track.png",
      description: "Logiciel de suivi et de gestion des ressources d'urgence",
      category: "Gestion des ressources"
    },
    {
      id: "partner-3",
      name: "FireCommand",
      logo: "/partners/fire-command.png",
      description: "Solution complète de gestion des services d'incendie",
      category: "Gestion des services"
    },
    {
      id: "partner-4",
      name: "MedResponse",
      logo: "/partners/med-response.png",
      description: "Plateforme de coordination des services médicaux d'urgence",
      category: "Services médicaux"
    },
    {
      id: "partner-5",
      name: "GeoEmergency",
      logo: "/partners/geo-emergency.png",
      description: "Solutions cartographiques avancées pour les services d'urgence",
      category: "Cartographie"
    },
    {
      id: "partner-6",
      name: "CommunicateNow",
      logo: "/partners/communicate-now.png",
      description: "Systèmes de communication d'urgence multicanaux",
      category: "Communication"
    },
    {
      id: "partner-7",
      name: "DataSafe",
      logo: "/partners/data-safe.png",
      description: "Solutions de stockage et de protection des données critiques",
      category: "Données"
    },
    {
      id: "partner-8",
      name: "SmartDispatch",
      logo: "/partners/smart-dispatch.png",
      description: "Système de répartition assistée par ordinateur",
      category: "Répartition"
    }
  ];

  return (
    <>
      <Head>
        <title>Intégration | Crisis-Cap</title>
        <meta name="description" content="Découvrez comment Crisis-Cap s'intègre parfaitement à votre écosystème technologique existant pour une gestion optimale des interventions d'urgence." />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative w-full h-80 bg-cover bg-center" style={{ backgroundImage: "url('/hero-integration.jpg')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Intégration Transparente</h1>
            <p className="text-xl text-white max-w-3xl">
              Crisis-Cap s'intègre parfaitement à votre écosystème technologique existant pour une expérience unifiée
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-base-100">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-6">Une plateforme conçue pour l'interopérabilité</h2>
              <p className="text-lg">
                Chez Crisis-Cap, nous comprenons que votre organisation utilise déjà de nombreux systèmes et outils. Notre plateforme a été conçue dès le départ pour s'intégrer facilement à votre infrastructure existante, minimisant ainsi les perturbations tout en maximisant la valeur ajoutée.
              </p>
            </div>

            {/* Integration Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {integrationTypes.map((type) => (
                <div key={type.id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <div className="card-body">
                    <h3 className="card-title flex items-center">
                      {type.icon}
                      <span className="ml-2">{type.title}</span>
                    </h3>
                    <p className="my-4">{type.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2">Caractéristiques :</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {type.features.map((feature, index) => (
                          <li key={index} className="text-sm">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Documentation Teaser */}
        <section className="py-16 bg-base-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold mb-6">API Robuste et Documentée</h2>
                <p className="mb-4">
                  Notre API RESTful complète permet à vos développeurs d'intégrer facilement Crisis-Cap à vos systèmes existants. Avec une documentation détaillée, des exemples de code et des environnements de test, nous facilitons le processus d'intégration.
                </p>
                <p className="mb-6">
                  Que vous souhaitiez synchroniser des données, automatiser des processus ou créer des applications personnalisées, notre API vous offre la flexibilité nécessaire.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push('/api-documentation')}
                >
                  Explorer la documentation API
                </button>
              </div>
              <div className="lg:w-1/2 bg-base-300 p-6 rounded-xl font-mono text-sm overflow-hidden">
                <div className="bg-base-100 p-3 rounded-t-lg flex justify-between items-center">
                  <span>Exemple de requête API</span>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <pre className="p-4 overflow-x-auto">
{`// Récupérer les détails d'une intervention
fetch('https://api.crisis-cap.com/v1/incidents/12345', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Incident details:', data);
})
.catch(error => {
  console.error('Error:', error);
});`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Partners */}
        <section className="py-16 bg-base-100">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-6">Nos Partenaires d'Intégration</h2>
              <p className="text-lg">
                Crisis-Cap collabore avec les principaux fournisseurs de technologies pour les services d'urgence afin d'offrir des intégrations prêtes à l'emploi qui améliorent votre expérience.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {integrationPartners.map((partner) => (
                <div key={partner.id} className="card bg-base-200 shadow-xl">
                  <div className="card-body items-center text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                      <div className="text-2xl font-bold text-primary">
                        {partner.name.charAt(0)}
                      </div>
                    </div>
                    <h3 className="card-title text-lg">{partner.name}</h3>
                    <div className="badge badge-primary mb-2">{partner.category}</div>
                    <p className="text-sm">{partner.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Process */}
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-6">Notre Processus d'Intégration</h2>
              <p className="text-lg">
                Nous vous accompagnons à chaque étape du processus d'intégration pour garantir une transition en douceur et une adoption réussie.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="card bg-white/10 backdrop-blur-sm">
                <div className="card-body items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center text-xl font-bold mb-4">1</div>
                  <h3 className="card-title">Évaluation</h3>
                  <p>Analyse de votre infrastructure existante et identification des besoins d'intégration</p>
                </div>
              </div>
              
              <div className="card bg-white/10 backdrop-blur-sm">
                <div className="card-body items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center text-xl font-bold mb-4">2</div>
                  <h3 className="card-title">Planification</h3>
                  <p>Élaboration d'une stratégie d'intégration détaillée avec calendrier et jalons</p>
                </div>
              </div>
              
              <div className="card bg-white/10 backdrop-blur-sm">
                <div className="card-body items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center text-xl font-bold mb-4">3</div>
                  <h3 className="card-title">Implémentation</h3>
                  <p>Développement et configuration des intégrations avec tests rigoureux</p>
                </div>
              </div>
              
              <div className="card bg-white/10 backdrop-blur-sm">
                <div className="card-body items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center text-xl font-bold mb-4">4</div>
                  <h3 className="card-title">Support</h3>
                  <p>Formation, documentation et support continu pour assurer le succès à long terme</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-base-100">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Prêt à intégrer Crisis-Cap à votre écosystème ?</h2>
              <p className="text-lg mb-8">
                Contactez notre équipe d'experts en intégration pour discuter de vos besoins spécifiques et découvrir comment nous pouvons vous aider à tirer le meilleur parti de Crisis-Cap.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push('/contact')}
                >
                  Parler à un expert en intégration
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => router.push('/resources')}
                >
                  Consulter nos ressources techniques
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Integration;
