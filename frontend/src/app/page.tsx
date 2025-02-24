import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Emergency Response
                  <span className="text-primary"> Management System</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Streamline your emergency response operations with real-time coordination,
                  resource management, and intelligent dispatch.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/dashboard">
                  <Button className="button-hover">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="button-hover">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full border-t bg-gray-50/40 py-12 dark:bg-gray-800/40 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                    Real-time Coordination
                  </div>
                  <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                    Instant Response
                  </h3>
                  <p className="max-w-[600px] text-gray-500 dark:text-gray-400">
                    Coordinate emergency responses in real-time with our advanced
                    dispatch system and team management tools.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                    Resource Management
                  </div>
                  <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                    Optimal Allocation
                  </h3>
                  <p className="max-w-[600px] text-gray-500 dark:text-gray-400">
                    Efficiently manage and track resources, equipment, and personnel
                    across multiple stations and teams.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                    Analytics & Insights
                  </div>
                  <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                    Data-Driven Decisions
                  </h3>
                  <p className="max-w-[600px] text-gray-500 dark:text-gray-400">
                    Make informed decisions with comprehensive analytics and
                    real-time performance metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
