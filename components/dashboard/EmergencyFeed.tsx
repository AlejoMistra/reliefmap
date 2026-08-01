import { ListFilter } from "lucide-react"
import { EMERGENCIES, PRIORITY_ORDER } from "@/lib/emergencies"
import { EmergencyCard } from "./EmergencyCard"

const sorted = [...EMERGENCIES].sort(
  (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
)

export function EmergencyFeed() {
  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Reportes Activos
          </span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {sorted.length}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Por prioridad
        </span>
      </div>

      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2.5">
          {sorted.map((emergency) => (
            <EmergencyCard key={emergency.id} emergency={emergency} />
          ))}
        </div>
      </div>
    </div>
  )
}
