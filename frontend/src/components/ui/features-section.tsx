"use client"

import { motion } from "framer-motion"
import { Radio, Users, Truck, Activity, Bell, Shield } from "lucide-react"

const features = [
  {
    title: "Real-time Coordination",
    description: "Seamless communication and coordination between emergency response teams.",
    icon: Radio,
  },
  {
    title: "Resource Management",
    description: "Efficient allocation and tracking of vehicles, equipment, and personnel.",
    icon: Truck,
  },
  {
    title: "Team Management",
    description: "Organize and manage response teams effectively with real-time status updates.",
    icon: Users,
  },
  {
    title: "Incident Tracking",
    description: "Monitor and manage emergency incidents with detailed status tracking.",
    icon: Activity,
  },
  {
    title: "Alert System",
    description: "Instant notifications and alerts for rapid emergency response.",
    icon: Bell,
  },
  {
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime guarantee.",
    icon: Shield,
  },
]

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-black px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-grid opacity-25" />
      
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Key Features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            A comprehensive suite of tools for every level of emergency response
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-xl transition-all hover:border-blue-500/50"
            >
              <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="rounded-xl bg-blue-500/10 p-3 ring-1 ring-blue-500/20">
                  <feature.icon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              
              {/* Animated border gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              
              {/* Glow effect */}
              <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
