import { Metadata } from "next"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"

export const metadata: Metadata = {
  title: "Authentication - Crisis CAP",
  description: "Authentication pages for Crisis CAP",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <ModeToggle />
        </div>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-primary" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              src="/logo.svg"
              alt="Crisis CAP Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            Crisis CAP
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This platform has revolutionized how we manage emergency responses,
                making our operations more efficient and effective.&rdquo;
              </p>
              <footer className="text-sm">Sofia Chen, Emergency Response Director</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
