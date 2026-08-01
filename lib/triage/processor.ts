import { generateText, Output } from 'ai'
import { TriageOutputSchema, type Agent1Payload, type TriageOutput } from './schema'

const MODEL = 'anthropic/claude-sonnet-4-5'

const SYSTEM_PROMPT = `You are Agent 2 — the Triage Classification Specialist in a humanitarian emergency response system.

Your only responsibility is to read a structured emergency report collected by the intake bot (Agent 1) and assign the correct risk classification. You do NOT extract names, locations, or any other data — that has already been done.

TRIAGE RISK LEVELS (1–5 COLOR PATTERN)

- Level 1 – RED    (Vital / Critical Emergency): Imminent life risk. Unconscious victims, cardiac/respiratory arrest, major fires, structural collapse, multiple severe victims, or confirmed deaths.
- Level 2 – ORANGE (Very Urgent): Potential severe risk. Serious injuries, severe pain, situations that can rapidly escalate to Level 1.
- Level 3 – YELLOW (Urgent): Stable, no imminent life risk. Moderate injuries, closed fractures, controlled incidents with few people affected.
- Level 4 – GREEN  (Low Urgency): Minor injuries or incidents. People not directly endangered, requiring basic assistance only.
- Level 5 – BLUE   (Non-Urgent / Informational): No injuries, no active danger. Informational or precautionary report.

CLASSIFICATION RULES
1. Base your classification solely on the "description" and "people_affected" fields provided.
2. Apply a conservative bias: if there is any indication of life-threatening risk or confirmed deaths, assign Level 1 (RED) without exception.
3. Classification is context-driven, not keyword-matched — analyse the full description together with the number of people involved.
4. The title must be at most 7 words, direct and descriptive (e.g. "Bus collision with multiple injuries").
5. The reason must be a single sentence justifying the classification.`

/**
 * Classifies an emergency report submitted by Agent 1.
 * Accepts a fully structured payload — no free-text extraction is performed.
 */
export async function classifyEmergency(payload: Agent1Payload): Promise<{
  output: TriageOutput
  modelUsed: string
}> {
  const context = [
    `Description: ${payload.description}`,
    payload.people_affected != null ? `People affected: ${payload.people_affected}` : null,
    payload.location_text ? `Location: ${payload.location_text}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema: TriageOutputSchema }),
    system: SYSTEM_PROMPT,
    prompt: `Classify the following emergency report:\n\n${context}`,
  })

  if (!output) {
    throw new Error('Model returned no structured output')
  }

  return {
    output,
    modelUsed: MODEL,
  }
}
