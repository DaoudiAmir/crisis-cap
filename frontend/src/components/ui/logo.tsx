"use client"

import { Shield } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 text-foreground">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary to-primary/50 opacity-50 blur" />
        <div className="relative rounded-lg bg-background p-1">
          <Shield className="h-8 w-8 text-primary" />
        </div>
      </motion.div>
      <motion.span
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-xl font-bold tracking-tight"
      >
        Crisis CAP
      </motion.span>
    </Link>
  )
}
