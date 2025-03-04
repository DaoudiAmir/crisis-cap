"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Users, Radio, Map, Bell, Headphones, ChartBar, Truck, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { FeaturesSection } from "@/components/ui/features-section";
import { Footer } from "@/components/ui/footer";
import { FeatureCard } from "@/components/ui/feature-card";

const features = [
  {
    name: "Gestion des Interventions",
    description: "Suivi en temps réel des interventions d'urgence",
    icon: Shield,
  },
  {
    name: "Coordination d'Équipe",
    description: "Communication et coordination efficace des équipes",
    icon: Users,
  },
  {
    name: "Suivi des Ressources",
    description: "Gestion optimisée des véhicules et équipements",
    icon: Truck,
  },
  {
    name: "Communication Radio",
    description: "Système de communication radio intégré",
    icon: Radio,
  },
  {
    name: "Cartographie",
    description: "Visualisation géographique des interventions",
    icon: Map,
  },
  {
    name: "Alertes",
    description: "Système d'alerte en temps réel",
    icon: Bell,
  },
  {
    name: "Support 24/7",
    description: "Assistance technique disponible 24h/24",
    icon: Headphones,
  },
  {
    name: "Analyses & Rapports",
    description: "Génération de rapports et analyses détaillées",
    icon: ChartBar,
  },
  {
    name: "Temps de Réponse",
    description: "Optimisation des temps de réponse",
    icon: Clock,
  },
]

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <HeroSection />
      <FeaturesSection features={features} />
      <Footer />
    </main>
  )
}
