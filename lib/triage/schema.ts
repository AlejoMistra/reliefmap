import { z } from 'zod'

export const RiskColor = z.enum(['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE'])
export type RiskColor = z.infer<typeof RiskColor>

export const TriageOutputSchema = z.object({
  full_name: z
    .string()
    .nullable()
    .describe('Full name of the person reporting the emergency, or null if not provided'),
  dni: z
    .string()
    .nullable()
    .describe('National ID (DNI) of the reporter, or null if not provided'),
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
  location_text: z
    .string()
    .nullable()
    .describe('Normalized address or location reference, or null if not determinable'),
  latitude: z
    .number()
    .nullable()
    .describe('Latitude in decimal degrees if determinable from input, otherwise null'),
  longitude: z
    .number()
    .nullable()
    .describe('Longitude in decimal degrees if determinable from input, otherwise null'),
  people_affected: z
    .number()
    .int()
    .nullable()
    .describe('Estimated or exact number of people affected/injured/deceased, or null if unknown'),
})

export type TriageOutput = z.infer<typeof TriageOutputSchema>

/** Database row shape returned from Supabase */
export interface EmergencyReport extends TriageOutput {
  id: string
  created_at: string
  processed_at: string
  raw_transcript: string
  model_used: string | null
}
