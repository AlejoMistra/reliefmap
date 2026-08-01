import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { EmergencyFeed } from '@/components/dashboard/EmergencyFeed'
import { MapPanel } from '@/components/dashboard/MapPanel'

export default function Home() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <DashboardHeader />

      {/* Main two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — emergency feed */}
        <section className="w-[420px] shrink-0 border-r border-border overflow-hidden flex flex-col">
          <EmergencyFeed />
        </section>

        {/* Right — map panel */}
        <section className="flex-1 overflow-hidden flex flex-col">
          <MapPanel />
        </section>
      </div>
    </div>
  )
}
