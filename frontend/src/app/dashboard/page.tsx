"use client"

import { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InterventionsTable } from "@/components/dashboard/interventions-table"
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Building2,
  Clock,
  Users,
  Plus,
} from "lucide-react"
import { useState, useEffect } from "react"

// Temporary mock data - replace with API calls
const mockInterventions = [
  {
    id: "1",
    type: "Incendie",
    location: "123 Rue de Paris, 75001",
    status: "en_cours",
    priority: "high",
    team: "Équipe Alpha",
    startTime: new Date().toISOString(),
    description: "Incendie dans un immeuble résidentiel",
  },
  {
    id: "2",
    type: "Secours",
    location: "45 Avenue Victor Hugo, 75016",
    status: "en_attente",
    priority: "medium",
    team: "Équipe Beta",
    startTime: new Date().toISOString(),
    description: "Accident de la route",
  },
  // Add more mock data as needed
]

export const metadata: Metadata = {
  title: "Dashboard - Crisis CAP",
  description: "Emergency Response Management System Dashboard",
}

export default function DashboardPage() {
  const [activeInterventions, setActiveInterventions] = useState(12)
  const [availableTeams, setAvailableTeams] = useState(8)
  const [totalPersonnel, setTotalPersonnel] = useState(45)
  const [equipmentStatus, setEquipmentStatus] = useState(92)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveInterventions(prev => prev + Math.floor(Math.random() * 3) - 1)
      setAvailableTeams(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="teams">Équipes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Interventions Actives
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeInterventions}</div>
                <p className="text-xs text-muted-foreground">
                  +2 depuis la dernière heure
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Équipes Disponibles
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableTeams}</div>
                <p className="text-xs text-muted-foreground">
                  Sur {totalPersonnel} personnels
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  État des Équipements
                </CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{equipmentStatus}%</div>
                <p className="text-xs text-muted-foreground">
                  Opérationnels
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Stations Actives
                </CardTitle>
                <Building2 className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">
                  Sur 18 stations
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Interventions Récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <InterventionsTable interventions={mockInterventions} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Équipes en Service</CardTitle>
                <CardDescription>
                  Vue d&apos;ensemble des équipes actuellement en intervention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Add team status components here */}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Interventions</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nouvelle Intervention
            </Button>
          </div>
          <InterventionsTable interventions={mockInterventions} />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Équipes</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nouvelle Équipe
            </Button>
          </div>
          {/* Add team management components here */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
