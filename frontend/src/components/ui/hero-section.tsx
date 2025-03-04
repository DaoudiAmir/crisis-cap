"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Bell, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-background px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-x-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm font-medium text-foreground/80 backdrop-blur-xl"
          >
            <Shield className="h-4 w-4 text-primary" />
            <span>Trusted by Emergency Response Teams Worldwide</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl"
          >
            Crisis Management Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
          >
            Empowering emergency response teams with real-time coordination, resource management, and intelligent decision support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-border/50 text-foreground hover:bg-muted/50"
            >
              <Link href="/learn-more">Learn More</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Enterprise-grade security with 99.9% uptime",
              },
              {
                icon: Bell,
                title: "Real-time Alerts",
                description: "Instant notifications for critical updates",
              },
              {
                icon: Users,
                title: "Team Coordination",
                description: "Seamless communication between teams",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-muted/5 p-8 backdrop-blur-xl transition-all hover:border-primary/50 hover:bg-muted/10"
              >
                <div className="relative z-10 flex flex-col items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute -inset-px bg-gradient-to-r from-primary to-primary/50 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 transform">
        <div className="h-[500px] w-[500px] bg-gradient-to-b from-blue-500/30 to-transparent opacity-20 blur-3xl" />
      </div>
      <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 transform">
        <div className="h-[500px] w-[500px] bg-gradient-to-t from-purple-500/30 to-transparent opacity-20 blur-3xl" />
      </div>
    </section>
  )
}
