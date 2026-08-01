import { z } from 'zod'

export const RiskColor = z.enum(['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE'])
export type RiskColor = z.infer<typeof RiskColor>

/**
 * Structured payload delivered by Agent 1 (the WhatsApp intake bot).
 * All fields that the chatbot collected during the conversation are present here —
 * the triage processor never has to re-extract them from free text.
 */
export const Agent1Payload = z.object({
  // ── Required fields ─────────────────────────────────────────────────────────
  /** National ID (DNI) of the reporter — mandatory for all reports */
  dni: z.string().min(1, 'DNI is required'),
  /** Free-text description of the emergency situation — mandatory */
  description: z.string().min(1, 'description is required'),
  /** Number of people affected — mandatory */
  people_affected: z.number().int().min(0, 'people_affected must be 0 or more'),

  // ── Optional supplementary fields ───────────────────────────────────────────
  /** Full name as stated by the reporter */
  full_name: z.string().min(1).optional(),
  /** Human-readable address or landmark provided by the reporter */
  location_text: z.string().optional(),
  /** GPS latitude if the WhatsApp bot captured the reporter's location pin */
  latitude: z.number().optional(),
  /** GPS longitude if the WhatsApp bot captured the reporter's location pin */
  longitude: z.number().optional(),
  /**
   * Optional: the full verbatim conversation transcript, stored for audit purposes.
   * If provided it is stored as-is but not re-analysed by the triage AI.
   */
  raw_transcript: z.string().optional(),
})

export type Agent1Payload = z.infer<typeof Agent1Payload>

/**
 * Structured output produced exclusively by the triage AI (Agent 2).
 * Only the fields the model must decide are included — reporter info and
 * location come directly from Agent 1 and are never inferred by the model.
 */
export const TriageOutputSchema = z.object({
  title: z
    .string()
    .describe('Short descriptive title of the emergency, maximum 7 words'),
  risk_level: z
    .number()
    .int()
    .min(1)
    .max(5)
    .describe('Risk level from 1 (most critical) to 5 (informational)'),
  risk_color: RiskColor.describe(
    'Color code matching the risk level: RED=1, ORANGE=2, YELLOW=3, GREEN=4, BLUE=5',
  ),
  reason: z
    .string()
    .describe('One-sentence justification for the assigned risk classification'),
})

export type TriageOutput = z.infer<typeof TriageOutputSchema>

/** Full database row returned from Supabase after insertion */
export interface EmergencyReport {
  id: string
  created_at: string
  processed_at: string
  // Agent 1 fields — required
  dni: string
  people_affected: number
  // Agent 1 fields — optional supplementary
  full_name: string | null
  raw_transcript: string | null
  location_text: string | null
  latitude: number | null
  longitude: number | null
  // AI-generated fields
  title: string
  risk_level: number
  risk_color: RiskColor
  reason: string
  model_used: string | null
}
