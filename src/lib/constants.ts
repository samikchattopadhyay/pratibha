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
  STATE: {
    MUSIC_VOCAL: [
      { key: "criteria1", label: "Voice Quality & Pitch (Sur)", max: 40, description: "Pitch accuracy, voice stability, clarity of notes, and breath control." },
      { key: "criteria2", label: "Rhythm & Tempo (Taal)", max: 30, description: "Coherence with the rhythm cycle (laya), pace consistency, and synchronization." },
      { key: "criteria3", label: "Diction & Emotion (Bhaav)", max: 30, description: "Pronunciation clarity, expression of lyric sentiment, and vocal voice modulation." },
    ],
    MUSIC_INSTRUMENTAL: [
      { key: "criteria1", label: "Instrument Control & Strokes", max: 40, description: "Fingering/strokes accuracy, tone production, tuning, and manual dexterity." },
      { key: "criteria2", label: "Rhythm & Tempo (Taal)", max: 30, description: "Coherence with tempo (tala), speed transitions, and synchronization." },
      { key: "criteria3", label: "Tonal Quality & Complexity", max: 30, description: "Aesthetics of sound, depth of composition choice, and structural balance." },
    ],
    PERFORMING_ARTS: [
      { key: "criteria1", label: "Body Movement & Posture (Angika)", max: 40, description: "Physical execution, alignment, grace, and flexibility of posture." },
      { key: "criteria2", label: "Rhythm, Footwork & Sync (Taal)", max: 30, description: "Timing correctness (laya), footwork clarity, and synchronization." },
      { key: "criteria3", label: "Abhinaya & Expression (Bhaav)", max: 30, description: "Facial expressions (mukhaja), emotive depth, and overall stage presence." },
    ],
    VISUAL_ARTS: [
      { key: "criteria1", label: "Technique & Medium Handling", max: 40, description: "Stroke accuracy, neatness, control of medium (watercolor, sketching, etc.), and texture." },
      { key: "criteria2", label: "Color Harmony & Composition", max: 30, description: "Layout balance, perspective, utilization of canvas space, and color selection." },
      { key: "criteria3", label: "Visual Impact & Theme Rendering", max: 30, description: "Aesthetics, clarity of thematic narrative, and overall visual balance." },
    ],
    LITERARY_ARTS: [
      { key: "criteria1", label: "Vocabulary & Expression", max: 40, description: "Linguistic richness, stylistic choices, and depth of vocabulary used." },
      { key: "criteria2", label: "Structure & Narrative Flow", max: 30, description: "Paragraph coherence, plot/idea development, logic, and reader engagement." },
      { key: "criteria3", label: "Grammar & Technical Accuracy", max: 30, description: "Syntax correctness, punctuation, spelling, and adherence to language rules." },
    ],
    SPOKEN_WORD: [
      { key: "criteria1", label: "Pronunciation & Diction", max: 40, description: "Phonetic accuracy, clarity of syllables, voice projection, and pace." },
      { key: "criteria2", label: "Modulation & Voice Control", max: 30, description: "Dynamic pitch changes, emotional delivery, pause control, and breathing." },
      { key: "criteria3", label: "Stage Presence & Delivery Style", max: 30, description: "Memory retrieval, confidence, eye contact, and emotional connection." },
    ],
  },
  NATIONAL: {
    MUSIC_VOCAL: [
      { key: "criteria1", label: "Voice Quality & Pitch (Sur)", max: 35, description: "Pitch accuracy, voice stability, note clarity, and breath control." },
      { key: "criteria2", label: "Rhythm & Tempo (Taal)", max: 25, description: "Rhythm coherence, pace changes, and tempo stability." },
      { key: "criteria3", label: "Diction & Emotion (Bhaav)", max: 25, description: "Pronunciation, lyrics interpretation, and emotional expression." },
      { key: "criteria4", label: "Improvisation & Alaap Range", max: 15, description: "Complexity of alaap/taans, range capability, and creative composition." },
    ],
    MUSIC_INSTRUMENTAL: [
      { key: "criteria1", label: "Instrument Control & Strokes", max: 35, description: "Fingering accuracy, note articulation, tuning control, and dexterity." },
      { key: "criteria2", label: "Rhythm & Tempo (Taal)", max: 25, description: "Tempo stability, synchronization, and transition speed." },
      { key: "criteria3", label: "Tonal Quality & Complexity", max: 25, description: "Aesthetics of tone, composition depth, and structured improvisation." },
      { key: "criteria4", label: "Creative Improvisation & Alaap", max: 15, description: "Originality of elaboration (alaap/gat), range, and technical innovation." },
    ],
    PERFORMING_ARTS: [
      { key: "criteria1", label: "Body Movement & Posture (Angika)", max: 35, description: "Physical grace, alignment, pose accuracy, and flexibility." },
      { key: "criteria2", label: "Rhythm, Footwork & Sync (Taal)", max: 25, description: "Timing accuracy, complexity of footwork, and synchronization." },
      { key: "criteria3", label: "Abhinaya & Expression (Bhaav)", max: 25, description: "Facial expressions, hand gestures (mudras), and presentation depth." },
      { key: "criteria4", label: "Choreography & Spatial Control", max: 15, description: "Creative pattern design, stage utilization, and performance flow." },
    ],
    VISUAL_ARTS: [
      { key: "criteria1", label: "Technique & Medium Handling", max: 35, description: "Brushwork/stroke accuracy, neatness, and medium mastery." },
      { key: "criteria2", label: "Color Harmony & Composition", max: 25, description: "Balance, perspective, structural layout, and color integration." },
      { key: "criteria3", label: "Visual Impact & Thematic Render", max: 25, description: "Artistic impact, narrative clarity, and thematic rendering." },
      { key: "criteria4", label: "Originality & Interpretation", max: 15, description: "Creative uniqueness, independent style, and artistic innovation." },
    ],
    LITERARY_ARTS: [
      { key: "criteria1", label: "Vocabulary & Expression", max: 35, description: "Style complexity, vocabulary depth, and linguistic expression." },
      { key: "criteria2", label: "Structure & Narrative Flow", max: 25, description: "Logical progression, formatting structure, and plot/argument flow." },
      { key: "criteria3", label: "Grammar & Spelling Accuracy", max: 25, description: "Grammatical accuracy, spelling, syntax, and phrasing." },
      { key: "criteria4", label: "Plot Depth & Thought Originality", max: 15, description: "Creativity of ideas, depth of arguments/perspective, and originality." },
    ],
    SPOKEN_WORD: [
      { key: "criteria1", label: "Pronunciation & Diction", max: 35, description: "Syllable clarity, pronunciation correctness, and speed." },
      { key: "criteria2", label: "Modulation & Voice Control", max: 25, description: "Dynamic pitch changes, pause control, and breath modulation." },
      { key: "criteria3", label: "Stage Presence & Delivery", max: 25, description: "Memory recall, confidence, expressions, and posture." },
      { key: "criteria4", label: "Interpretation & Theme Depth", max: 15, description: "Thematic understanding, emotional impact, and projection power." },
    ],
  },
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
