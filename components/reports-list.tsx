'use client'

import useSWR, { mutate } from 'swr'
import type { EmergencyReport, RiskColor } from '@/lib/triage/schema'
import { ReportCard } from './report-card'
import { useState } from 'react'

export const REPORTS_KEY = '/api/reports'

const COLORS: Array<{ label: string; value: RiskColor | '' }> = [
  { label: 'All',    value: '' },
  { label: 'RED',    value: 'RED' },
  { label: 'ORANGE', value: 'ORANGE' },
  { label: 'YELLOW', value: 'YELLOW' },
  { label: 'GREEN',  value: 'GREEN' },
  { label: 'BLUE',   value: 'BLUE' },
]

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to fetch reports')
    return r.json()
  })

export function revalidateReports() {
  mutate(REPORTS_KEY)
}

export function ReportsList() {
  const [filter, setFilter] = useState<RiskColor | ''>('')

  const swrKey = filter ? `${REPORTS_KEY}?risk_color=${filter}&limit=20` : `${REPORTS_KEY}?limit=20`

  const { data, error, isLoading, isValidating } = useSWR<{ reports: EmergencyReport[] }>(
    swrKey,
    fetcher,
    { refreshInterval: 30_000 },
  )

  const reports = data?.reports ?? []

  return (
    <section className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Incoming Reports
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live feed from Kapso · auto-refreshes every 30s
          </p>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value)}
              className={`rounded px-2.5 py-1 text-xs font-medium border transition-colors ${
                filter === c.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {c.label || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Validating indicator */}
      {isValidating && !isLoading && (
        <p className="text-xs text-muted-foreground animate-pulse">Refreshing…</p>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {String(error)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <p className="text-sm text-muted-foreground">No reports yet.</p>
          <p className="text-xs text-muted-foreground">
            Submit a report via the form or wait for Kapso to send one.
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card h-32 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Report cards */}
      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </section>
  )
}
