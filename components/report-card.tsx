import type { EmergencyReport } from '@/lib/triage/schema'
import type { RiskColor } from '@/lib/triage/schema'

const COLOR_STYLES: Record<RiskColor, { badge: string; border: string }> = {
  RED:    { badge: 'bg-red-600 text-white',       border: 'border-red-500/40' },
  ORANGE: { badge: 'bg-orange-500 text-white',    border: 'border-orange-400/40' },
  YELLOW: { badge: 'bg-yellow-400 text-black',    border: 'border-yellow-400/40' },
  GREEN:  { badge: 'bg-green-600 text-white',     border: 'border-green-500/40' },
  BLUE:   { badge: 'bg-blue-500 text-white',      border: 'border-blue-400/40' },
}

interface Props {
  report: EmergencyReport
}

export function ReportCard({ report }: Props) {
  const styles = COLOR_STYLES[report.risk_color] ?? COLOR_STYLES.BLUE

  return (
    <article
      className={`rounded-lg border ${styles.border} bg-card text-card-foreground p-5 flex flex-col gap-4`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-base leading-snug">{report.title}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${styles.badge}`}>
          Level {report.risk_level} &ndash; {report.risk_color}
        </span>
      </div>

      {/* Reason */}
      <p className="text-sm text-muted-foreground leading-relaxed">{report.reason}</p>

      {/* Details grid */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {report.full_name && (
          <>
            <dt className="text-muted-foreground">Reporter</dt>
            <dd>
              {report.full_name}
              {report.dni ? <span className="text-muted-foreground ml-1">({report.dni})</span> : null}
            </dd>
          </>
        )}

        {report.location_text && (
          <>
            <dt className="text-muted-foreground">Location</dt>
            <dd>{report.location_text}</dd>
          </>
        )}

        {(report.latitude != null && report.longitude != null) && (
          <>
            <dt className="text-muted-foreground">Coordinates</dt>
            <dd className="font-mono text-xs">
              {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
            </dd>
          </>
        )}

        {report.people_affected != null && (
          <>
            <dt className="text-muted-foreground">People affected</dt>
            <dd>{report.people_affected}</dd>
          </>
        )}

        <dt className="text-muted-foreground">Report ID</dt>
        <dd className="font-mono text-xs truncate">{report.id}</dd>

        <dt className="text-muted-foreground">Processed at</dt>
        <dd>{new Date(report.processed_at).toLocaleString()}</dd>

        {report.model_used && (
          <>
            <dt className="text-muted-foreground">Model</dt>
            <dd className="text-xs">{report.model_used}</dd>
          </>
        )}
      </dl>
    </article>
  )
}
