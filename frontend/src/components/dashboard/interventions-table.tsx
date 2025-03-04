"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MapPin } from "lucide-react"

type InterventionStatus = "en_cours" | "en_attente" | "terminee" | "annulee"

interface Intervention {
  id: string
  type: string
  location: string
  status: InterventionStatus
  priority: "high" | "medium" | "low"
  team: string
  startTime: string
  description: string
}

const statusMap: Record<InterventionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  en_cours: { label: "En cours", variant: "default" },
  en_attente: { label: "En attente", variant: "secondary" },
  terminee: { label: "Terminée", variant: "outline" },
  annulee: { label: "Annulée", variant: "destructive" },
}

const priorityMap = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
}

export function InterventionsTable({ interventions }: { interventions: Intervention[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Équipe</TableHead>
              <TableHead>Heure de début</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interventions.map((intervention) => (
              <TableRow key={intervention.id}>
                <TableCell className="font-medium">{intervention.type}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {intervention.location}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusMap[intervention.status].variant}>
                    {statusMap[intervention.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityMap[intervention.priority]}`}>
                    {intervention.priority === "high" ? "Haute" : intervention.priority === "medium" ? "Moyenne" : "Basse"}
                  </span>
                </TableCell>
                <TableCell>{intervention.team}</TableCell>
                <TableCell>{new Date(intervention.startTime).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
