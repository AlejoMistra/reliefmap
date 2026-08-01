export type TriageLevel = 1 | 2 | 3 | 4 | 5
export type TriageColor = "RED" | "ORANGE" | "YELLOW" | "GREEN" | "BLUE"

export interface TriageReport {
  fullName: string
  descriptionTitle: string
  riskLevel: TriageLevel
  riskColor: TriageColor
  reason: string
  location: string
  affectedCount: string
}

/**
 * Parses the plain-text payload emitted by the AI triage agent.
 *
 * Expected format:
 * "Full Name: [Name/DNI]
 *  Description Title: [Title]
 *  Risk Classification: Level [1-5] - [COLOR]
 *  Reason: [Justification]
 *  Problem Location: [Coordinates/Address]
 *  Number of People Affected: [Count]"
 */
export function parseTriageReport(raw: string): TriageReport {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean)

  function extract(prefix: string): string {
    const line = lines.find((l) =>
      l.toLowerCase().startsWith(prefix.toLowerCase())
    )
    if (!line) return ""
    return line.slice(prefix.length).trim()
  }

  const riskRaw = extract("Risk Classification:")
  // e.g. "Level 3 - YELLOW"
  const riskMatch = riskRaw.match(/Level\s+(\d)/i)
  const colorMatch = riskRaw.match(/-\s*(RED|ORANGE|YELLOW|GREEN|BLUE)/i)

  return {
    fullName: extract("Full Name:"),
    descriptionTitle: extract("Description Title:"),
    riskLevel: riskMatch ? (parseInt(riskMatch[1]) as TriageLevel) : 3,
    riskColor: colorMatch ? (colorMatch[1].toUpperCase() as TriageColor) : "YELLOW",
    reason: extract("Reason:"),
    location: extract("Problem Location:"),
    affectedCount: extract("Number of People Affected:"),
  }
}
