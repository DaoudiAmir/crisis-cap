import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { FaCode, FaLock, FaServer, FaExchangeAlt, FaBook, FaCopy, FaChevronDown, FaChevronRight, FaUsers, FaTruck } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// API Endpoint interface
interface ApiEndpoint {
  id: string;
  method: string;
  path: string;
  description: string;
  authentication: boolean;
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: ApiResponse[];
}

// API Parameter interface
interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  location: "path" | "query" | "header";
}

// API Request Body interface
interface ApiRequestBody {
  contentType: string;
  schema: any;
  example: any;
}

// API Response interface
interface ApiResponse {
  status: number;
  description: string;
  contentType?: string;
  schema?: any;
  example?: any;
}

// API Category interface
interface ApiCategory {
  id: string;
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
}

const ApiDocumentation = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("auth");
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"request" | "response">("request");

  // API Categories and Endpoints data
  const apiCategories: ApiCategory[] = [
    {
      id: "auth",
      name: "Authentification",
      description: "Endpoints pour l'authentification et la gestion des utilisateurs",
      endpoints: [
        {
          id: "auth-login",
          method: "POST",
          path: "/api/auth/login",
          description: "Authentifier un utilisateur et obtenir un token JWT",
          authentication: false,
          requestBody: {
            contentType: "application/json",
            schema: {
              type: "object",
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string" }
              },
              required: ["email", "password"]
            },
            example: {
              email: "utilisateur@exemple.com",
              password: "motdepasse123"
            }
          },
          responses: [
            {
              status: 200,
              description: "Authentification réussie",
              contentType: "application/json",
              example: {
                success: true,
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                user: {
                  id: "123456",
                  email: "utilisateur@exemple.com",
                  firstName: "Jean",
                  lastName: "Dupont",
                  role: "FIREFIGHTER"
                }
              }
            },
            {
              status: 400,
              description: "Données d'authentification invalides",
              contentType: "application/json",
              example: {
                success: false,
                message: "Email ou mot de passe incorrect"
              }
            }
          ]
        },
        {
          id: "auth-register",
          method: "POST",
          path: "/api/auth/register",
          description: "Créer un nouveau compte utilisateur",
          authentication: false,
          requestBody: {
            contentType: "application/json",
            schema: {
              type: "object",
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
                firstName: { type: "string" },
                lastName: { type: "string" },
                role: { type: "string", enum: ["FIREFIGHTER", "TEAM_LEADER", "OFFICER", "REGIONAL_COORDINATOR"] }
              },
              required: ["email", "password", "firstName", "lastName", "role"]
            },
            example: {
              email: "nouveau@exemple.com",
              password: "motdepasse123",
              firstName: "Pierre",
              lastName: "Martin",
              role: "FIREFIGHTER"
            }
          },
          responses: [
            {
              status: 201,
              description: "Utilisateur créé avec succès",
              contentType: "application/json",
              example: {
                success: true,
                message: "Utilisateur créé avec succès",
                userId: "123456"
              }
            },
            {
              status: 400,
              description: "Données d'inscription invalides",
              contentType: "application/json",
              example: {
                success: false,
                message: "L'email est déjà utilisé"
              }
            }
          ]
        },
        {
          id: "auth-logout",
          method: "POST",
          path: "/api/auth/logout",
          description: "Déconnecter un utilisateur",
          authentication: true,
          responses: [
            {
              status: 200,
              description: "Déconnexion réussie",
              contentType: "application/json",
              example: {
                success: true,
                message: "Déconnexion réussie"
              }
            }
          ]
        }
      ]
    },
    {
      id: "incidents",
      name: "Interventions",
      description: "Endpoints pour la gestion des interventions",
      endpoints: [
        {
          id: "incidents-list",
          method: "GET",
          path: "/api/v1/incidents",
          description: "Récupérer la liste des interventions",
          authentication: true,
          parameters: [
            {
              name: "page",
              type: "integer",
              required: false,
              description: "Numéro de page pour la pagination",
              location: "query"
            },
            {
              name: "limit",
              type: "integer",
              required: false,
              description: "Nombre d'éléments par page",
              location: "query"
            },
            {
              name: "status",
              type: "string",
              required: false,
              description: "Filtrer par statut (en_cours, terminé, planifié)",
              location: "query"
            }
          ],
          responses: [
            {
              status: 200,
              description: "Liste des interventions",
              contentType: "application/json",
              example: {
                success: true,
                data: [
                  {
                    id: "123456",
                    title: "Incendie résidentiel",
                    location: "123 Rue Principale, Paris",
                    status: "en_cours",
                    priority: "haute",
                    createdAt: "2023-03-15T14:30:00Z",
                    updatedAt: "2023-03-15T15:45:00Z"
                  },
                  {
                    id: "123457",
                    title: "Accident de la route",
                    location: "Autoroute A1, Km 45",
                    status: "terminé",
                    priority: "moyenne",
                    createdAt: "2023-03-14T09:15:00Z",
                    updatedAt: "2023-03-14T11:30:00Z"
                  }
                ],
                pagination: {
                  total: 42,
                  page: 1,
                  limit: 10,
                  pages: 5
                }
              }
            }
          ]
        },
        {
          id: "incidents-get",
          method: "GET",
          path: "/api/v1/incidents/{id}",
          description: "Récupérer les détails d'une intervention spécifique",
          authentication: true,
          parameters: [
            {
              name: "id",
              type: "string",
              required: true,
              description: "Identifiant unique de l'intervention",
              location: "path"
            }
          ],
          responses: [
            {
              status: 200,
              description: "Détails de l'intervention",
              contentType: "application/json",
              example: {
                success: true,
                data: {
                  id: "123456",
                  title: "Incendie résidentiel",
                  description: "Incendie dans un appartement au 3ème étage",
                  location: "123 Rue Principale, Paris",
                  coordinates: {
                    latitude: 48.8566,
                    longitude: 2.3522
                  },
                  status: "en_cours",
                  priority: "haute",
                  type: "incendie",
                  resources: [
                    {
                      id: "v-123",
                      type: "véhicule",
                      name: "VSAV 1"
                    },
                    {
                      id: "v-124",
                      type: "véhicule",
                      name: "FPT 2"
                    }
                  ],
                  teams: [
                    {
                      id: "t-123",
                      name: "Équipe Alpha",
                      members: 4
                    }
                  ],
                  timeline: [
                    {
                      timestamp: "2023-03-15T14:30:00Z",
                      event: "Alerte reçue",
                      author: "Système"
                    },
                    {
                      timestamp: "2023-03-15T14:35:00Z",
                      event: "Équipe Alpha assignée",
                      author: "Jean Dupont"
                    }
                  ],
                  createdAt: "2023-03-15T14:30:00Z",
                  updatedAt: "2023-03-15T15:45:00Z"
                }
              }
            },
            {
              status: 404,
              description: "Intervention non trouvée",
              contentType: "application/json",
              example: {
                success: false,
                message: "Intervention non trouvée"
              }
            }
          ]
        },
        {
          id: "incidents-create",
          method: "POST",
          path: "/api/v1/incidents",
          description: "Créer une nouvelle intervention",
          authentication: true,
          requestBody: {
            contentType: "application/json",
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                location: { type: "string" },
                coordinates: {
                  type: "object",
                  properties: {
                    latitude: { type: "number" },
                    longitude: { type: "number" }
                  }
                },
                priority: { type: "string", enum: ["basse", "moyenne", "haute", "critique"] },
                type: { type: "string" }
              },
              required: ["title", "location", "priority", "type"]
            },
            example: {
              title: "Incendie résidentiel",
              description: "Incendie dans un appartement au 3ème étage",
              location: "123 Rue Principale, Paris",
              coordinates: {
                latitude: 48.8566,
                longitude: 2.3522
              },
              priority: "haute",
              type: "incendie"
            }
          },
          responses: [
            {
              status: 201,
              description: "Intervention créée avec succès",
              contentType: "application/json",
              example: {
                success: true,
                message: "Intervention créée avec succès",
                data: {
                  id: "123456",
                  title: "Incendie résidentiel",
                  status: "planifié",
                  createdAt: "2023-03-15T14:30:00Z"
                }
              }
            },
            {
              status: 400,
              description: "Données invalides",
              contentType: "application/json",
              example: {
                success: false,
                message: "Données invalides",
                errors: [
                  {
                    field: "title",
                    message: "Le titre est requis"
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      id: "teams",
      name: "Équipes",
      description: "Endpoints pour la gestion des équipes",
      endpoints: [
        {
          id: "teams-list",
          method: "GET",
          path: "/api/v1/teams",
          description: "Récupérer la liste des équipes",
          authentication: true,
          responses: [
            {
              status: 200,
              description: "Liste des équipes",
              contentType: "application/json",
              example: {
                success: true,
                data: [
                  {
                    id: "t-123",
                    name: "Équipe Alpha",
                    leader: {
                      id: "u-123",
                      name: "Jean Dupont"
                    },
                    members: 4,
                    status: "disponible"
                  },
                  {
                    id: "t-124",
                    name: "Équipe Bravo",
                    leader: {
                      id: "u-124",
                      name: "Marie Martin"
                    },
                    members: 3,
                    status: "en_intervention"
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      id: "resources",
      name: "Ressources",
      description: "Endpoints pour la gestion des ressources (véhicules, équipements)",
      endpoints: [
        {
          id: "vehicles-list",
          method: "GET",
          path: "/api/v1/vehicles",
          description: "Récupérer la liste des véhicules",
          authentication: true,
          responses: [
            {
              status: 200,
              description: "Liste des véhicules",
              contentType: "application/json",
              example: {
                success: true,
                data: [
                  {
                    id: "v-123",
                    name: "VSAV 1",
                    type: "ambulance",
                    status: "disponible",
                    location: "Caserne Centrale"
                  },
                  {
                    id: "v-124",
                    name: "FPT 2",
                    type: "pompier",
                    status: "en_intervention",
                    location: "En déplacement"
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      id: "webhooks",
      name: "Webhooks",
      description: "Endpoints pour la configuration et la gestion des webhooks",
      endpoints: [
        {
          id: "webhooks-create",
          method: "POST",
          path: "/api/v1/webhooks",
          description: "Créer un nouveau webhook pour recevoir des notifications",
          authentication: true,
          requestBody: {
            contentType: "application/json",
            schema: {
              type: "object",
              properties: {
                url: { type: "string", format: "uri" },
                events: { 
                  type: "array",
                  items: { 
                    type: "string",
                    enum: ["incident.created", "incident.updated", "incident.closed", "team.assigned"]
                  }
                },
                description: { type: "string" }
              },
              required: ["url", "events"]
            },
            example: {
              url: "https://votreserveur.com/webhook-receiver",
              events: ["incident.created", "incident.updated"],
              description: "Notifications pour les nouveaux incidents et mises à jour"
            }
          },
          responses: [
            {
              status: 201,
              description: "Webhook créé avec succès",
              contentType: "application/json",
              example: {
                success: true,
                data: {
                  id: "wh-123",
                  url: "https://votreserveur.com/webhook-receiver",
                  events: ["incident.created", "incident.updated"],
                  secret: "whsec_abcdefghijklmnopqrstuvwxyz",
                  createdAt: "2023-03-15T14:30:00Z"
                }
              }
            }
          ]
        }
      ]
    }
  ];

  // Function to copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Toggle endpoint expansion
  const toggleEndpoint = (endpointId: string) => {
    if (expandedEndpoint === endpointId) {
      setExpandedEndpoint(null);
    } else {
      setExpandedEndpoint(endpointId);
    }
  };

  return (
    <>
      <Head>
        <title>Documentation API | Crisis-Cap</title>
        <meta name="description" content="Documentation complète de l'API Crisis-Cap pour les intégrations et le développement." />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-base-100">
        {/* Hero Section */}
        <section className="relative w-full h-64 bg-cover bg-center" style={{ backgroundImage: "url('/hero-api.jpg')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Documentation API</h1>
            <p className="text-xl text-white max-w-3xl">
              Tout ce dont vous avez besoin pour intégrer Crisis-Cap à vos systèmes
            </p>
          </div>
        </section>

        {/* API Documentation */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <div className="lg:w-1/4">
                <div className="sticky top-24 bg-base-200 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FaBook className="mr-2" />
                    Catégories
                  </h2>
                  <ul className="space-y-2">
                    {apiCategories.map((category) => (
                      <li key={category.id}>
                        <button
                          className={`w-full text-left p-3 rounded-lg flex items-center ${
                            activeCategory === category.id ? "bg-primary text-primary-content" : "hover:bg-base-300"
                          }`}
                          onClick={() => setActiveCategory(category.id)}
                        >
                          {category.id === "auth" && <FaLock className="mr-2" />}
                          {category.id === "incidents" && <FaServer className="mr-2" />}
                          {category.id === "teams" && <FaUsers className="mr-2" />}
                          {category.id === "resources" && <FaTruck className="mr-2" />}
                          {category.id === "webhooks" && <FaExchangeAlt className="mr-2" />}
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <h3 className="font-bold mb-4">Ressources</h3>
                    <ul className="space-y-2">
                      <li>
                        <button 
                          className="w-full text-left p-2 hover:bg-base-300 rounded-lg"
                          onClick={() => router.push('/integration')}
                        >
                          Guide d'intégration
                        </button>
                      </li>
                      <li>
                        <button className="w-full text-left p-2 hover:bg-base-300 rounded-lg">
                          SDK et bibliothèques
                        </button>
                      </li>
                      <li>
                        <button className="w-full text-left p-2 hover:bg-base-300 rounded-lg">
                          Exemples de code
                        </button>
                      </li>
                      <li>
                        <button className="w-full text-left p-2 hover:bg-base-300 rounded-lg">
                          Changelog de l'API
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:w-3/4">
                {apiCategories.map((category) => (
                  <div key={category.id} className={activeCategory === category.id ? "block" : "hidden"}>
                    <div className="bg-base-200 rounded-lg p-6 mb-8">
                      <h2 className="text-3xl font-bold mb-4">{category.name}</h2>
                      <p className="text-lg mb-4">{category.description}</p>
                    </div>

                    {/* Endpoints */}
                    <div className="space-y-6">
                      {category.endpoints.map((endpoint) => (
                        <div key={endpoint.id} className="card bg-base-200 shadow-xl overflow-hidden">
                          {/* Endpoint Header */}
                          <div 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-base-300"
                            onClick={() => toggleEndpoint(endpoint.id)}
                          >
                            <div className="flex items-center">
                              <span className={`
                                px-3 py-1 rounded-md font-mono text-sm font-bold mr-4
                                ${endpoint.method === 'GET' ? 'bg-blue-500 text-white' : ''}
                                ${endpoint.method === 'POST' ? 'bg-green-500 text-white' : ''}
                                ${endpoint.method === 'PUT' ? 'bg-yellow-500 text-white' : ''}
                                ${endpoint.method === 'DELETE' ? 'bg-red-500 text-white' : ''}
                              `}>
                                {endpoint.method}
                              </span>
                              <span className="font-mono">{endpoint.path}</span>
                            </div>
                            <div className="flex items-center">
                              {endpoint.authentication && (
                                <span className="badge badge-primary mr-2" title="Authentification requise">
                                  <FaLock className="mr-1" /> Auth
                                </span>
                              )}
                              {expandedEndpoint === endpoint.id ? <FaChevronDown /> : <FaChevronRight />}
                            </div>
                          </div>

                          {/* Endpoint Details */}
                          {expandedEndpoint === endpoint.id && (
                            <div className="p-6 border-t border-base-300">
                              <p className="mb-6">{endpoint.description}</p>

                              {/* Tabs */}
                              <div className="tabs mb-6">
                                <button 
                                  className={`tab tab-bordered ${selectedTab === 'request' ? 'tab-active' : ''}`}
                                  onClick={() => setSelectedTab('request')}
                                >
                                  Requête
                                </button>
                                <button 
                                  className={`tab tab-bordered ${selectedTab === 'response' ? 'tab-active' : ''}`}
                                  onClick={() => setSelectedTab('response')}
                                >
                                  Réponse
                                </button>
                              </div>

                              {/* Request Tab Content */}
                              {selectedTab === 'request' && (
                                <div>
                                  {/* URL Parameters */}
                                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                                    <div className="mb-6">
                                      <h4 className="font-bold mb-2">Paramètres</h4>
                                      <div className="overflow-x-auto">
                                        <table className="table table-compact w-full">
                                          <thead>
                                            <tr>
                                              <th>Nom</th>
                                              <th>Type</th>
                                              <th>Requis</th>
                                              <th>Description</th>
                                              <th>Emplacement</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {endpoint.parameters.map((param, index) => (
                                              <tr key={index}>
                                                <td className="font-mono">{param.name}</td>
                                                <td>{param.type}</td>
                                                <td>{param.required ? "Oui" : "Non"}</td>
                                                <td>{param.description}</td>
                                                <td>{param.location}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {/* Request Body */}
                                  {endpoint.requestBody && (
                                    <div className="mb-6">
                                      <h4 className="font-bold mb-2">Corps de la requête</h4>
                                      <p className="mb-2">Content-Type: {endpoint.requestBody.contentType}</p>
                                      <div className="relative bg-base-300 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                        <button 
                                          className="absolute top-2 right-2 p-2 hover:bg-base-200 rounded-md"
                                          onClick={() => copyToClipboard(JSON.stringify(endpoint.requestBody.example, null, 2))}
                                          title="Copier"
                                        >
                                          <FaCopy />
                                        </button>
                                        <pre>{JSON.stringify(endpoint.requestBody.example, null, 2)}</pre>
                                      </div>
                                    </div>
                                  )}

                                  {/* Example Request */}
                                  <div>
                                    <h4 className="font-bold mb-2">Exemple de requête</h4>
                                    <div className="tabs tabs-boxed mb-2">
                                      <button className="tab tab-active">cURL</button>
                                      <button className="tab">JavaScript</button>
                                      <button className="tab">Python</button>
                                    </div>
                                    <div className="relative bg-base-300 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                      <button 
                                        className="absolute top-2 right-2 p-2 hover:bg-base-200 rounded-md"
                                        onClick={() => copyToClipboard(`curl -X ${endpoint.method} \\
  https://api.crisis-cap.com${endpoint.path} \\
  -H "Content-Type: application/json" \\
  ${endpoint.authentication ? '-H "Authorization: Bearer YOUR_API_KEY" \\' : ''}
  ${endpoint.requestBody ? `-d '${JSON.stringify(endpoint.requestBody.example)}'` : ''}`)}
                                        title="Copier"
                                      >
                                        <FaCopy />
                                      </button>
                                      <pre>{`curl -X ${endpoint.method} \\
  https://api.crisis-cap.com${endpoint.path} \\
  -H "Content-Type: application/json" \\
  ${endpoint.authentication ? '-H "Authorization: Bearer YOUR_API_KEY" \\' : ''}
  ${endpoint.requestBody ? `-d '${JSON.stringify(endpoint.requestBody.example)}'` : ''}`}</pre>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Response Tab Content */}
                              {selectedTab === 'response' && (
                                <div>
                                  {/* Response Examples */}
                                  <div className="space-y-6">
                                    {endpoint.responses.map((response, index) => (
                                      <div key={index}>
                                        <h4 className="font-bold mb-2">
                                          <span className={`
                                            px-2 py-1 rounded-md font-mono text-sm mr-2
                                            ${response.status >= 200 && response.status < 300 ? 'bg-green-500 text-white' : ''}
                                            ${response.status >= 400 && response.status < 500 ? 'bg-yellow-500 text-white' : ''}
                                            ${response.status >= 500 ? 'bg-red-500 text-white' : ''}
                                          `}>
                                            {response.status}
                                          </span>
                                          {response.description}
                                        </h4>
                                        {response.contentType && <p className="mb-2">Content-Type: {response.contentType}</p>}
                                        {response.example && (
                                          <div className="relative bg-base-300 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                            <button 
                                              className="absolute top-2 right-2 p-2 hover:bg-base-200 rounded-md"
                                              onClick={() => copyToClipboard(JSON.stringify(response.example, null, 2))}
                                              title="Copier"
                                            >
                                              <FaCopy />
                                            </button>
                                            <pre>{JSON.stringify(response.example, null, 2)}</pre>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Section */}
        <section className="py-12 bg-base-200">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8">Authentification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold mb-4">Authentification par token JWT</h3>
                <p className="mb-4">
                  Crisis-Cap utilise l'authentification par token JWT (JSON Web Token) pour sécuriser l'accès à l'API. Pour authentifier vos requêtes, vous devez inclure le token dans l'en-tête Authorization de chaque requête.
                </p>
                <div className="bg-base-300 rounded-lg p-4 font-mono text-sm mb-4">
                  <pre>{`// Exemple d'en-tête d'authentification
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</pre>
                </div>
                <p>
                  Pour obtenir un token JWT, vous devez d'abord authentifier l'utilisateur en utilisant l'endpoint <code>/api/auth/login</code>.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Gestion des erreurs d'authentification</h3>
                <p className="mb-4">
                  Si une requête nécessitant une authentification est effectuée sans token valide, l'API répondra avec un code d'état 401 (Non autorisé).
                </p>
                <div className="bg-base-300 rounded-lg p-4 font-mono text-sm">
                  <pre>{JSON.stringify({
                    success: false,
                    message: "Authentification requise",
                    code: "auth_required"
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rate Limiting Section */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8">Limites de débit</h2>
            <p className="mb-6">
              Pour garantir la stabilité et la disponibilité de notre API, nous appliquons des limites de débit sur toutes les requêtes. Les limites sont basées sur l'adresse IP et/ou le token d'authentification.
            </p>
            
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Type d'utilisateur</th>
                    <th>Limite</th>
                    <th>Période</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Non authentifié</td>
                    <td>60 requêtes</td>
                    <td>Par heure</td>
                  </tr>
                  <tr>
                    <td>Authentifié (standard)</td>
                    <td>1000 requêtes</td>
                    <td>Par heure</td>
                  </tr>
                  <tr>
                    <td>Authentifié (premium)</td>
                    <td>5000 requêtes</td>
                    <td>Par heure</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <p className="mb-4">
                Lorsque vous dépassez la limite de débit, l'API répondra avec un code d'état 429 (Too Many Requests).
              </p>
              <div className="bg-base-300 rounded-lg p-4 font-mono text-sm">
                <pre>{JSON.stringify({
                  success: false,
                  message: "Limite de débit dépassée. Veuillez réessayer plus tard.",
                  code: "rate_limit_exceeded",
                  reset_at: "2023-03-15T15:45:00Z"
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Versioning Section */}
        <section className="py-12 bg-base-200">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8">Versionnement de l'API</h2>
            <p className="mb-6">
              Notre API est versionnée pour garantir la compatibilité et permettre l'évolution sans perturber les intégrations existantes. Le numéro de version est inclus dans le chemin de l'URL.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Versions actuelles</h3>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Version</th>
                        <th>Statut</th>
                        <th>Fin de support</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>v1</td>
                        <td>
                          <span className="badge badge-success">Actif</span>
                        </td>
                        <td>Non planifiée</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Politique de versionnement</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Les nouvelles fonctionnalités sont ajoutées sans changer la version</li>
                  <li>Les modifications non rétrocompatibles entraînent une nouvelle version</li>
                  <li>Les versions obsolètes sont supportées pendant au moins 12 mois</li>
                  <li>Les avis de dépréciation sont communiqués au moins 6 mois à l'avance</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Prêt à intégrer Crisis-Cap ?</h2>
              <p className="text-lg mb-8">
                Contactez notre équipe de développeurs pour obtenir de l'aide ou des conseils sur l'intégration de Crisis-Cap à vos systèmes.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push('/contact')}
                >
                  Contacter l'équipe technique
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => router.push('/integration')}
                >
                  Voir le guide d'intégration
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

export default ApiDocumentation;