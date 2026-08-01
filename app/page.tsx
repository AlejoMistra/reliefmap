import { TriageForm } from '@/components/triage-form'
import { ReportsList } from '@/components/reports-list'

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">ReliefMap — Triage Processor</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Submit a raw WhatsApp transcript to generate and store a structured emergency report.
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 flex flex-col gap-10">
        <TriageForm />
        <ReportsList />
      </main>
    </div>
  )
}
