import Head from "next/head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { FaSignInAlt, FaUserPlus, FaChartLine, FaMapMarkedAlt, FaUsers, FaHeadset, FaMobileAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import Link from "next/link";

const Home = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/LoginPage");
  };

  const handleSignupClick = () => {
    router.push("/SignupPage");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Crisis-Cap | Plateforme de Gestion des Interventions d'Urgence</title>
        <meta name="description" content="Crisis-Cap est une plateforme de gestion des interventions d'urgence pour les services de pompiers et de secours." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      {/* Hero Section */}
      <section className="hero min-h-[70vh] bg-base-200 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/OIP.jpeg)' }}
        ></div>
        <div className="hero-content text-center">
          <div className="max-w-3xl z-10">
            <h1 className="text-5xl font-bold mb-6">Crisis-Cap</h1>
            <h2 className="text-3xl font-semibold mb-4">Plateforme de Gestion des Interventions d'Urgence</h2>
            <p className="py-6 text-lg">
              Une solution complète pour les services de pompiers et de secours, offrant une coordination en temps réel, 
              des analyses prédictives, et des outils de gestion des ressources pour transformer la réponse aux situations d'urgence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <button 
                onClick={handleLoginClick}
                className="btn btn-primary"
              >
                <FaSignInAlt className="mr-2" />
                Connexion
              </button>
              <button 
                onClick={handleSignupClick}
                className="btn btn-outline btn-primary"
              >
                <FaUserPlus className="mr-2" />
                Inscription
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Fonctionnalités Principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
              <figure className="px-10 pt-10">
                <FaMapMarkedAlt className="text-6xl text-primary" />
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title text-xl">Cartographie en Temps Réel</h3>
                <p>Visualisez toutes les interventions en cours sur une carte interactive avec des mises à jour en temps réel.</p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
              <figure className="px-10 pt-10">
                <FaUsers className="text-6xl text-primary" />
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title text-xl">Gestion des Équipes</h3>
                <p>Coordonnez efficacement vos équipes d'intervention avec des outils de planification et de suivi avancés.</p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
              <figure className="px-10 pt-10">
                <FaChartLine className="text-6xl text-primary" />
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title text-xl">Analyses Prédictives</h3>
                <p>Anticipez les besoins en ressources grâce à des algorithmes d'analyse prédictive basés sur les données historiques.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6">À Propos de Crisis-Cap</h2>
              <p className="text-lg mb-6">
                Crisis-Cap est une plateforme de pointe conçue pour les services de pompiers et de secours, 
                offrant un suivi des incidents en temps réel, une gestion intelligente des ressources, 
                et des outils d'aide à la décision.
              </p>
              <p className="text-lg mb-6">
                Adaptée aux besoins des pompiers, des chefs d'équipe et des coordinateurs régionaux, 
                notre solution améliore la prise de décision, réduit les temps de réponse et garantit 
                la sécurité des intervenants et des citoyens.
              </p>
              <Link href="/about" className="btn btn-primary">
                En savoir plus
              </Link>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-2xl">
                <Image 
                  src="/Control.jpg" 
                  alt="Centre de contrôle" 
                  width={600} 
                  height={400} 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Crisis-Cap en Chiffres</h2>
          
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <FaMapMarkedAlt className="text-3xl" />
              </div>
              <div className="stat-title">Interventions</div>
              <div className="stat-value">1,000+</div>
              <div className="stat-desc">Gérées chaque mois</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-primary">
                <FaUsers className="text-3xl" />
              </div>
              <div className="stat-title">Utilisateurs</div>
              <div className="stat-value">500+</div>
              <div className="stat-desc">Pompiers et coordinateurs</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-primary">
                <FaHeadset className="text-3xl" />
              </div>
              <div className="stat-title">Support</div>
              <div className="stat-value">24/7</div>
              <div className="stat-desc">Assistance technique</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-primary">
                <FaMobileAlt className="text-3xl" />
              </div>
              <div className="stat-title">Disponibilité</div>
              <div className="stat-value">99.9%</div>
              <div className="stat-desc">Temps de fonctionnement</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à Améliorer Votre Gestion des Interventions?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Rejoignez les centaines de services de secours qui utilisent déjà Crisis-Cap pour optimiser 
            leurs opérations et sauver plus de vies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={handleSignupClick}
              className="btn btn-lg btn-secondary"
            >
              <FaUserPlus className="mr-2" />
              Commencer Maintenant
            </button>
            <Link href="/contact" className="btn btn-lg btn-outline btn-secondary">
              Nous Contacter
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
