import { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Building2,
  Clock,
  Users,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard - Crisis CAP",
  description: "Emergency Response Management System Dashboard",
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Interventions
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last hour
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Teams
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/15</div>
            <p className="text-xs text-muted-foreground">
              7 teams deployed
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Station Status
            </CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5/5</div>
            <p className="text-xs text-muted-foreground">
              All stations operational
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Response Time
            </CardTitle>
            <Activity className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2m</div>
            <p className="text-xs text-muted-foreground">
              -1.1m from average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:border-primary/50">
          <CardHeader>
            <CardTitle>Recent Interventions</CardTitle>
            <CardDescription>
              Overview of the last 24 hours of emergency responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add chart component here */}
            <div className="h-[200px] flex items-center justify-center border rounded">
              Chart placeholder
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 hover:border-primary/50">
          <CardHeader>
            <CardTitle>Active Teams</CardTitle>
            <CardDescription>
              Currently deployed emergency response teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add team list here */}
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Team Alpha {i + 1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Responding to emergency in Sector {i + 1}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
