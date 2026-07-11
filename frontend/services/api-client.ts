const API_BASE = "/api"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = body?.detail
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((e: unknown) => (typeof e === "object" && e !== null ? String((e as Record<string, unknown>).msg || JSON.stringify(e)) : String(e))).join("; ")
          : `Error del servidor (HTTP ${res.status})`
    throw new Error(message)
  }
  return res.json()
}

export interface QuestionnaireAnswers {
  age: number
  investment_horizon: string
  risk_tolerance: string
  goal: string
  monthly_income: number
  investment_experience: number
}

export interface FormAnswers {
  age: string
  investment_horizon: string
  risk_tolerance: string
  goal: string
  monthly_income: string
  investment_experience: string
}

export interface ProfileResult {
  profile_id: string
  profile: string
  score: number
  explanations: string[]
  llm_explanation: string
  available_instruments: { name: string; category: string; risk: string }[]
}

export interface Allocation {
  instrument_id: string
  instrument_name: string
  category: string
  percentage: number
}

export interface ProposalResult {
  proposal_id: string
  profile_id: string
  profile: string
  allocations: Allocation[]
  risk_metrics: {
    expected_volatility: string
    diversification_score: number
    max_drawdown_estimate: string
  }
  explanation: string
}

export interface AdvisorDecision {
  proposal_id: string
  advisor_id: string
  action: "aprobado" | "editado" | "rechazado"
  comments?: string
  edited_allocations?: Allocation[]
  rules_version: string
}

export interface HistoryItem {
  id: number
  proposal_id: number
  advisor_id: string
  action: string
  comments: string | null
  rules_version: string
  decided_at: string
  profile: string
}

export const api = {
  submitQuestionnaire: (answers: QuestionnaireAnswers) =>
    request<ProfileResult>("/perfil", {
      method: "POST",
      body: JSON.stringify(answers),
    }),

  getProfile: (id: string) => request<ProfileResult>(`/perfil/${id}`),

  createProposal: (profile_id: string, profile?: string) =>
    request<ProposalResult>("/propuesta", {
      method: "POST",
      body: JSON.stringify({ profile_id, ...(profile ? { profile } : {}) }),
    }),

  getProposal: (id: number) => request<ProposalResult>(`/propuesta/${id}`),

  reviewProposal: (decision: AdvisorDecision) =>
    request<{ decision_id: string; message: string }>("/revisar", {
      method: "POST",
      body: JSON.stringify(decision),
    }),

  getHistory: () => request<HistoryItem[]>("/revisar/historial"),
}
