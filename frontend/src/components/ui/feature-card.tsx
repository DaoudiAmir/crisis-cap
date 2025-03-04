"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  className?: string
}

export function FeatureCard({ title, description, icon: Icon, className }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-xl transition-all hover:border-blue-500/50",
        className
      )}
    >
      <div className="relative z-10 flex flex-col items-start gap-4">
        <div className="rounded-xl bg-blue-500/10 p-3 ring-1 ring-blue-500/20">
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-white">{title}</h3>
        <p className="text-sm text-gray-400">
          {description}
        </p>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      
      {/* Glow effect */}
      <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300" />
    </motion.div>
  )
}
