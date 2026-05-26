// ─── INDIA STATES & UNION TERRITORIES ─────────────────────────────────────────

export const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
] as const;

export type IndiaState = typeof INDIA_STATES[number];

// ─── AGE GROUPS DEFINITIONS ──────────────────────────────────────────────────

export const AGE_GROUPS = [
  { label: "Tiny Tots", min: 3, max: 5 },
  { label: "Sub-Junior (Group A)", min: 6, max: 8 },
  { label: "Junior (Group B)", min: 9, max: 12 },
  { label: "Senior (Group C)", min: 13, max: 17 },
  { label: "Adult (Group D)", min: 18, max: 99 },
] as const;

// ─── SCORING CRITERIA RUBRICS ────────────────────────────────────────────────

export const SCORING_CRITERIA = {
  STATE: [
    { key: "criteria1", label: "Artistic Technique & Skill", max: 40, description: "Posture, breath control (recitation/vocals), stroke accuracy, or overall execution." },
    { key: "criteria2", label: "Expression & Presentation", max: 30, description: "Emotional expression, facial bhaav, dynamic volume transitions, and stage presence." },
    { key: "criteria3", label: "Rhythm & Composition", max: 30, description: "Tempo coherence (tala), consistency, synchronization, and complexity of chosen work." },
  ],
  NATIONAL: [
    { key: "criteria1", label: "Artistic Technique & Skill", max: 40, description: "Posture, breath control, stroke accuracy, or overall execution." },
    { key: "criteria2", label: "Expression & Presentation", max: 25, description: "Emotional expression, facial bhaav, dynamic transitions, and stage presence." },
    { key: "criteria3", label: "Rhythm & Composition", max: 25, description: "Tempo coherence, consistency, synchronization, and composition complexity." },
    { key: "criteria4", label: "Originality & Innovation", max: 10, description: "Creative presentation style, uniqueness of selection, and artistic innovation." },
  ],
} as const;

// ─── JUDGE EVALUATION RATE MATRIX (INR per entry) ────────────────────────────

export const JUDGE_RATES = {
  LOCAL: { STATE: 50, NATIONAL: 75 },
  REGIONAL: { STATE: 75, NATIONAL: 100 },
  NATIONAL: { STATE: 100, NATIONAL: 150 },
  EXPERT: { STATE: 150, NATIONAL: 200 },
} as const;

export function getJudgeRate(tier: "LOCAL" | "REGIONAL" | "NATIONAL" | "EXPERT", scope: "STATE" | "NATIONAL"): number {
  return JUDGE_RATES[tier]?.[scope] ?? 50;
}
