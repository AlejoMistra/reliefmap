export type Priority = "critical" | "high" | "medium" | "low"
export type Status = "unassigned" | "dispatched" | "in-progress" | "resolved"

export interface Emergency {
  id: string
  title: string
  location: string
  description: string
  priority: Priority
  affectedPeople: number
  reportedAt: Date
  status: Status
}

export const EMERGENCIES: Emergency[] = [
  {
    id: "RPT-0041",
    title: "Multiple Vehicle Collision",
    location: "Hwy 12 & Oak St, Zone A3",
    description:
      "AI analysis indicates a 4-car pileup blocking two lanes. Possible fuel leak reported. At least 3 individuals appear injured based on imagery.",
    priority: "critical",
    affectedPeople: 11,
    reportedAt: new Date(Date.now() - 1000 * 60 * 4),
    status: "unassigned",
  },
  {
    id: "RPT-0039",
    title: "Structural Fire — Residential",
    location: "48 Maple Ave, Zone B1",
    description:
      "AI model detects active fire on second floor of a two-story residential building. Smoke density suggests rapid spread. Evacuation of adjacent units recommended.",
    priority: "critical",
    affectedPeople: 6,
    reportedAt: new Date(Date.now() - 1000 * 60 * 7),
    status: "dispatched",
  },
  {
    id: "RPT-0038",
    title: "Flash Flood Warning",
    location: "Riverside District, Zone C2",
    description:
      "Water levels at the Kern Creek sensor have exceeded the 2.4m threshold. AI model projects downstream flooding of low-lying residential areas within 45 minutes.",
    priority: "critical",
    affectedPeople: 340,
    reportedAt: new Date(Date.now() - 1000 * 60 * 12),
    status: "in-progress",
  },
  {
    id: "RPT-0037",
    title: "Gas Leak — Commercial Block",
    location: "Commerce Blvd 200-220, Zone D4",
    description:
      "Sensor network detected methane concentration at 2.1× safe threshold. AI classification: high-risk, potential ignition hazard. Area within 100m advised to evacuate.",
    priority: "high",
    affectedPeople: 55,
    reportedAt: new Date(Date.now() - 1000 * 60 * 18),
    status: "unassigned",
  },
  {
    id: "RPT-0036",
    title: "Medical Emergency — Cardiac",
    location: "Central Park Pavilion, Zone B3",
    description:
      "Report of an unresponsive adult male, approximately 60 years old. Bystander CPR in progress. AED on scene. AI severity score: 9.1/10.",
    priority: "high",
    affectedPeople: 1,
    reportedAt: new Date(Date.now() - 1000 * 60 * 22),
    status: "dispatched",
  },
  {
    id: "RPT-0035",
    title: "Power Line Down",
    location: "Elm Street & 4th Ave, Zone A1",
    description:
      "Downed power line reported following storm. AI model confirms active current risk. Traffic disruption affecting two intersections. No casualties reported.",
    priority: "high",
    affectedPeople: 0,
    reportedAt: new Date(Date.now() - 1000 * 60 * 35),
    status: "in-progress",
  },
  {
    id: "RPT-0034",
    title: "Hazmat Spill — Minor",
    location: "Industrial Lot C, Zone E2",
    description:
      "Small chemical container breach detected by environmental sensors. AI classification: low volatility, non-airborne. Containment team response adequate.",
    priority: "medium",
    affectedPeople: 4,
    reportedAt: new Date(Date.now() - 1000 * 60 * 48),
    status: "in-progress",
  },
  {
    id: "RPT-0033",
    title: "Traffic Signal Outage",
    location: "Main & 5th Intersection, Zone A2",
    description:
      "Complete signal failure at a high-traffic intersection. Manual control or officer deployment recommended to prevent secondary incidents.",
    priority: "medium",
    affectedPeople: 0,
    reportedAt: new Date(Date.now() - 1000 * 60 * 55),
    status: "unassigned",
  },
  {
    id: "RPT-0032",
    title: "Missing Person — Child",
    location: "Westfield Mall, Zone B2",
    description:
      "Child, approximately 7 years old, reported missing by guardian. Last seen near the food court. CCTV review initiated.",
    priority: "medium",
    affectedPeople: 1,
    reportedAt: new Date(Date.now() - 1000 * 60 * 62),
    status: "dispatched",
  },
  {
    id: "RPT-0031",
    title: "Minor Vehicle Incident",
    location: "Parking Lot 9, Zone D1",
    description:
      "Fender-bender reported with no injuries. Both drivers present. Police report requested for insurance purposes.",
    priority: "low",
    affectedPeople: 2,
    reportedAt: new Date(Date.now() - 1000 * 60 * 90),
    status: "resolved",
  },
]

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const STATUS_LABELS: Record<Status, string> = {
  unassigned: "Unassigned",
  dispatched: "Dispatched",
  "in-progress": "In Progress",
  resolved: "Resolved",
}
