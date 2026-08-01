'use client'

import { useState } from 'react'
import type { EmergencyReport } from '@/lib/triage/schema'
import { ReportCard } from './report-card'

const SAMPLE_TRANSCRIPT = `Reporter: María López, DNI 28345671
Location: Calle Rivadavia 1450, Buenos Aires, near the intersection with Callao
Situation: There is a serious car accident. A bus hit a car and there are approximately 4 injured people on the ground. One person appears unconscious and is not responding. There is fuel leaking from the bus.
Time of call: 14:32`

export function TriageForm() {
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EmergencyReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!transcript.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Unknown error')
        return
      }

      setResult(json.report as EmergencyReport)
      setTranscript('')
    } catch (err) {
      setError('Network error — could not reach the API.')
      console.error('[TriageForm] submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold">Submit Transcript</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Paste a raw WhatsApp conversation or structured intake payload below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={8}
          placeholder="Paste the raw transcript here…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono leading-relaxed"
          disabled={loading}
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !transcript.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? 'Processing…' : 'Process & Store Report'}
          </button>

          <button
            type="button"
            onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Load sample
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Generated report:</p>
          <ReportCard report={result} />
        </div>
      )}
    </section>
  )
}
