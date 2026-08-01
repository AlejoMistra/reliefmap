import { z } from 'zod'

export const RiskColor = z.enum(['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE'])
export type RiskColor = z.infer<typeof RiskColor>

// ── Risk level helpers ──────────────────────────────────────────────────────

/** Map a risk_level integer (1=most critical) to its color code */
export const RISK_LEVEL_TO_COLOR: Record<number, RiskColor> = {
  1: 'RED',
  2: 'ORANGE',
  3: 'YELLOW',
  4: 'GREEN',
  5: 'BLUE',
}

/** Escalation thresholds: report_count >= threshold → escalate by N levels */
export const ESCALATION_RULES: Array<{ minCount: number; levels: number }> = [
  { minCount: 5, levels: 2 },
  { minCount: 3, levels: 1 },
]

/**
 * Compute the escalated risk_level given a current level and report count.
 * Life risk (RED = 1) cannot be escalated further.
 */
export function escalateRiskLevel(currentLevel: number, reportCount: number): number {
  let escalation = 0
  for (const rule of ESCALATION_RULES) {
    if (reportCount >= rule.minCount) {
      escalation = rule.levels
      break
    }
  }
  // Lower number = higher urgency; never go below 1 (RED)
  return Math.max(1, currentLevel - escalation)
}

// ── Agent 1 payload ─────────────────────────────────────────────────────────

/**
 * Structured payload delivered by Agent 1 (the WhatsApp / Kapso intake bot).
 */
export const Agent1Payload = z.object({
  // Required
  dni:             z.string().min(1, 'DNI is required'),
  description:     z.string().min(1, 'description is required'),
  people_affected: z.number().int().min(0, 'people_affected must be 0 or more'),
  location_text:   z.string().min(1, 'location_text is required'),
  // Optional supplementary
  full_name:       z.string().min(1).optional(),
  latitude:        z.number().optional(),
  longitude:       z.number().optional(),
  raw_transcript:  z.string().optional(),
})

export type Agent1Payload = z.infer<typeof Agent1Payload>

// ── AI classification output ────────────────────────────────────────────────

/**
 * Structured output produced exclusively by the triage AI (Agent 2).
 * Used with generateText + Output.object().
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
    .describe('Risk level 1 (most critical / RED) to 5 (informational / BLUE)'),
  risk_color: RiskColor.describe(
    'Color matching the level: RED=1, ORANGE=2, YELLOW=3, GREEN=4, BLUE=5',
  ),
  reason: z
    .string()
    .describe('One-sentence justification for the assigned risk classification'),
})

export type TriageOutput = z.infer<typeof TriageOutputSchema>

// ── Full event record (DB row) ───────────────────────────────────────────────

/**
 * Full database row from emergency_reports.
 * A single row represents a unified event that may aggregate multiple
 * incoming Agent 1 reports from the same zone.
 */
export interface EmergencyReport {
  id:                string
  created_at:        string
  processed_at:      string
  // Agent 1 — required
  dni:               string
  people_affected:   number
  location_text:     string
  // Agent 1 — optional supplementary
  full_name:         string | null
  raw_transcript:    string | null
  latitude:          number | null
  longitude:         number | null
  // AI-generated classification
  title:             string
  risk_level:        number
  risk_color:        RiskColor
  reason:            string
  model_used:        string | null
  // Event aggregation
  zone_key:          string | null
  report_count:      number
  is_active:         boolean
  situation_summary: string | null
}
