import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { MapPanel } from "@/components/dashboard/MapPanel"
import { EmergencyFeed } from "@/components/dashboard/EmergencyFeed"

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans">
      <DashboardHeader />
      <main className="flex flex-1 overflow-hidden">
        {/* Map — 60% */}
        <section className="flex-[3] border-r border-border overflow-hidden">
          <MapPanel />
        </section>
        {/* Feed — 40% */}
        <section className="flex-[2] overflow-hidden">
          <EmergencyFeed />
        </section>
      </main>
    </div>
  )
}
