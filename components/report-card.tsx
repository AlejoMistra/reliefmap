import type { EmergencyReport, RiskColor } from '@/lib/triage/schema'

const COLOR_STYLES: Record<RiskColor, { badge: string; border: string; bg: string }> = {
  RED:    { badge: 'bg-red-600 text-white',    border: 'border-red-500/50',    bg: 'bg-red-950/30' },
  ORANGE: { badge: 'bg-orange-500 text-white', border: 'border-orange-400/50', bg: 'bg-orange-950/20' },
  YELLOW: { badge: 'bg-yellow-400 text-black', border: 'border-yellow-400/50', bg: 'bg-yellow-950/20' },
  GREEN:  { badge: 'bg-green-600 text-white',  border: 'border-green-500/50',  bg: '' },
  BLUE:   { badge: 'bg-blue-500 text-white',   border: 'border-blue-400/50',   bg: '' },
}

interface Props {
  report: EmergencyReport
}

export function ReportCard({ report }: Props) {
  const styles = COLOR_STYLES[report.risk_color] ?? COLOR_STYLES.BLUE
  const isLifeRisk = report.risk_level === 1
  const isMerged = report.report_count > 1

  return (
    <article
      className={`rounded-lg border ${styles.border} ${styles.bg} bg-card text-card-foreground p-4 flex flex-col gap-3`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isLifeRisk && (
            <span className="rounded px-2 py-0.5 text-xs font-bold uppercase bg-red-600 text-white animate-pulse">
              LIFE RISK
            </span>
          )}
          <h3 className="font-semibold text-sm leading-snug">{report.title}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${styles.badge}`}>
          L{report.risk_level} {report.risk_color}
        </span>
      </div>

      {/* Situation summary — shown when available */}
      {report.situation_summary && (
        <p className="text-xs font-mono text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
          {report.situation_summary}
        </p>
      )}

      {/* Reason */}
      <p className="text-xs text-muted-foreground leading-relaxed">{report.reason}</p>

      {/* Key stats row */}
      <div className="flex items-center gap-4 flex-wrap text-xs">
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{report.people_affected}</span> affected
        </span>
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{report.report_count}</span>{' '}
          {report.report_count === 1 ? 'report' : 'reports'}
          {isMerged && (
            <span className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              MERGED
            </span>
          )}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
          report.is_active
            ? 'bg-green-500/10 text-green-400 border-green-500/30'
            : 'bg-muted text-muted-foreground border-border'
        }`}>
          {report.is_active ? 'ACTIVE' : 'RESOLVED'}
        </span>
      </div>

      {/* Detail grid */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs border-t border-border pt-3">
        <dt className="text-muted-foreground">DNI</dt>
        <dd className="font-mono">{report.dni}</dd>

        <dt className="text-muted-foreground">Location</dt>
        <dd className="truncate">{report.location_text}</dd>

        {report.zone_key && (
          <>
            <dt className="text-muted-foreground">Zone key</dt>
            <dd className="font-mono text-muted-foreground">{report.zone_key}</dd>
          </>
        )}

        {report.full_name && (
          <>
            <dt className="text-muted-foreground">Reporter</dt>
            <dd>{report.full_name}</dd>
          </>
        )}

        <dt className="text-muted-foreground">Processed</dt>
        <dd>{new Date(report.processed_at).toLocaleString()}</dd>
      </dl>
    </article>
  )
}
