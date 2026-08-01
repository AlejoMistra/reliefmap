'use client'

import { useEffect, useState, useCallback } from 'react'
import type { EmergencyReport, RiskColor } from '@/lib/triage/schema'
import { ReportCard } from './report-card'

const COLORS: Array<{ label: string; value: RiskColor | '' }> = [
  { label: 'All', value: '' },
  { label: 'RED',    value: 'RED' },
  { label: 'ORANGE', value: 'ORANGE' },
  { label: 'YELLOW', value: 'YELLOW' },
  { label: 'GREEN',  value: 'GREEN' },
  { label: 'BLUE',   value: 'BLUE' },
]

export function ReportsList() {
  const [reports, setReports] = useState<EmergencyReport[]>([])
  const [filter, setFilter] = useState<RiskColor | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '20' })
      if (filter) params.set('risk_color', filter)
      const res = await fetch(`/api/reports?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Fetch failed')
      setReports(json.reports ?? [])
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold">Stored Reports</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Most recent 20 reports from Supabase.</p>
        </div>

        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium border transition-colors ${
                filter === c.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}

          <button
            onClick={fetchReports}
            disabled={loading}
            className="ml-2 rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && reports.length === 0 && !error && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No reports found. Submit a transcript above to generate the first one.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </section>
  )
}
