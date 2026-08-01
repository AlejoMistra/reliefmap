import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ResourcesTable } from "@/components/recursos/ResourcesTable"

export const metadata = {
  title: "Recursos | ReliefMap",
  description: "Gestión de recursos y servicios de emergencia disponibles",
}

export default function RecursosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 px-5 py-5">
        {/* Page heading */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold uppercase tracking-widest text-foreground">
              Recursos de emergencia
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Unidades, equipos y servicios disponibles para despacho
            </p>
          </div>
        </div>

        <ResourcesTable />
      </main>
    </div>
  )
}
