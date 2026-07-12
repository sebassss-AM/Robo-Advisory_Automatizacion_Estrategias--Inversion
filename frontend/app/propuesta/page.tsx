"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { api, type ProposalResult } from "@/services/api-client"
import { isAuthenticated, logout, isAdvisor } from "@/services/auth"
import PortfolioChart from "@/components/PortfolioChart"
import ApprovalPanel from "@/components/ApprovalPanel"

const COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-violet-500", "bg-rose-500", "bg-cyan-500", "bg-orange-500",
]

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  "baja": { label: "Baja", color: "text-emerald-600" },
  "media": { label: "Media", color: "text-amber-600" },
  "alta": { label: "Alta", color: "text-red-600" },
}

function formatRiskLevel(text: string): { label: string; color: string } {
  const lower = text.toLowerCase()
  for (const [key, val] of Object.entries(RISK_LABELS)) {
    if (lower.includes(key)) return val
  }
  if (lower.includes("%")) return { label: text, color: "text-gray-900" }
  return { label: text, color: "text-gray-900" }
}

function volColor(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes("baja")) return "bg-emerald-500"
  if (lower.includes("alta")) return "bg-red-500"
  return "bg-amber-500"
}

function simpleMarkdown(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ""
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split(/\n(?=[-*] )/).map((item) => {
          const content = item.replace(/^[-*]\s/, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          return `<li class="ml-4 list-disc text-gray-700 leading-relaxed">${content}</li>`
        })
        return `<ul class="space-y-1">${items.join("")}</ul>`
      }
      const withBold = trimmed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      return `<p class="text-gray-700 leading-relaxed">${withBold}</p>`
    })
    .join("")
}

function PropuestaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const profileId = searchParams.get("profile_id")
  const fromAsesor = searchParams.get("from") === "asesor"

  const [proposal, setProposal] = useState<ProposalResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [decisionMade, setDecisionMade] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
    if (!profileId) {
      router.push("/cuestionario")
      return
    }

    const profile = searchParams.get("profile") || undefined

    api
      .createProposal(profileId, profile)
      .then(setProposal)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [profileId, searchParams, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-lg text-gray-600">Generando tu propuesta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl text-red-600">!</span>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Algo salió mal</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (decisionMade) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <span className="text-4xl text-green-600">✓</span>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Decisión registrada
          </h2>
          <p className="mt-2 text-gray-600">
            {fromAsesor
              ? "La propuesta ha sido procesada exitosamente."
              : "Tu perfilamiento fue completado. Un asesor lo revisará pronto."}
          </p>
          <button
            onClick={() => router.push(fromAsesor ? "/asesor" : "/mis-perfilamientos")}
            className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {fromAsesor ? "Volver al panel" : "Mis perfilamientos"}
          </button>
        </div>
      </div>
    )
  }

  const monthlyInvest = proposal?.monthly_investment ?? 0
  const riskVol = formatRiskLevel(proposal?.risk_metrics.expected_volatility ?? "")
  const returnPct = proposal?.risk_metrics?.expected_return_pct ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">I</div>
            <span className="font-bold text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-4">
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Perfil: {proposal?.profile}
            </span>
            {fromAsesor && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Revisión</span>}
            <button onClick={handleLogout} className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Propuesta de Portafolio</h1>
          <p className="mt-1 text-gray-500">
            {fromAsesor
              ? "Revisá la propuesta generada por la IA. Podés aprobarla, editarla o rechazarla."
              : "Esta propuesta está alineada con tu perfil de riesgo. Un asesor autorizado debe revisarla y aprobarla."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Columna izquierda: distribución + explicación */}
          <div className="space-y-6 lg:col-span-3">

            {/* Tarjeta: Distribución + montos */}
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-bold text-gray-900">Distribución sugerida</h2>

              {/* Gráfico de torta */}
              <PortfolioChart allocations={proposal?.allocations || []} />

              {/* Desglose visual con barras + monto USD */}
              {proposal && (
                <div className="mt-6 space-y-3">
                  {proposal.allocations.map((a, i) => {
                    const amount = monthlyInvest > 0 ? (a.percentage / 100) * monthlyInvest : 0
                    return (
                      <div key={a.instrument_id}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block h-3 w-3 rounded-full ${COLORS[i % COLORS.length]}`} />
                            <span className="font-medium text-gray-800">{a.instrument_name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-semibold text-gray-900">{a.percentage}%</span>
                            {monthlyInvest > 0 && (
                              <>
                                <span className="text-gray-300">|</span>
                                <span className="font-semibold text-blue-600">${amount.toFixed(2)}/mes</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div
                            className={`h-2 rounded-full transition-all ${COLORS[i % COLORS.length]}`}
                            style={{ width: `${a.percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Tarjeta: Explicación de la IA */}
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Explicación de la propuesta</h2>
              {proposal?.explanation ? (
                <div
                  className="prose prose-gray max-w-none space-y-3"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(proposal.explanation) }}
                />
              ) : (
                <p className="text-gray-500">No hay explicación disponible.</p>
              )}
            </div>

          </div>

          {/* Columna derecha: métricas + aprobación */}
          <div className="space-y-6 lg:col-span-2">

            {/* Métricas de riesgo */}
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">Métricas de Riesgo</h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-500">Volatilidad esperada</span>
                  <span className={`font-semibold ${riskVol.color}`}>{riskVol.label}</span>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Diversificación</span>
                    <span className="text-lg font-bold text-gray-900">{proposal?.risk_metrics.diversification_score}/100</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${proposal?.risk_metrics.diversification_score}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-500">Drawdown máximo estimado</span>
                  <span className="font-semibold text-gray-900">{proposal?.risk_metrics.max_drawdown_estimate}</span>
                </div>
              </div>
            </div>

            {/* Proyección de rentabilidad */}
            {proposal && returnPct > 0 && (
              <div className="rounded-2xl border bg-white p-6">
                <h2 className="text-lg font-bold text-gray-900">Proyección Estimada</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Rentabilidad: <span className="font-semibold text-gray-700">{proposal.risk_metrics.expected_return_range}</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Basado en el rendimiento histórico promedio de cada activo.
                </p>

                {monthlyInvest > 0 && (
                  <div className="mt-4 space-y-2">
                    {(() => {
                      const r = returnPct / 100
                      const monthly = monthlyInvest
                      const periods = [
                        { label: "1 año", months: 12 },
                        { label: "5 años", months: 60 },
                        { label: "10 años", months: 120 },
                      ]
                      return periods.map((p) => {
                        const totalContrib = monthly * p.months
                        const futureValue = monthly * ((Math.pow(1 + r / 12, p.months) - 1) / (r / 12)) * (1 + r / 12)
                        const gain = futureValue - totalContrib
                        return (
                          <div key={p.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                            <div>
                              <span className="text-sm text-gray-500">{p.label}</span>
                              <p className="text-xs text-gray-400">${monthly}/mes</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${futureValue.toFixed(0)}</p>
                              <p className={`text-xs ${gain >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {gain >= 0 ? "+" : ""}${gain.toFixed(0)}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    })()}
                    <p className="mt-2 text-xs text-gray-400">
                      Proyección informativa basada en rendimiento promedio histórico. No garantiza resultados futuros.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Panel de aprobación (solo asesor) */}
            {fromAsesor && (
              <ApprovalPanel
                proposalId={proposal?.proposal_id || ""}
                profileName={proposal?.profile || ""}
                allocations={proposal?.allocations || []}
                rulesVersion="1.0.0"
                onDecisionComplete={() => setDecisionMade(true)}
              />
            )}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          Esta es una propuesta informativa generada por IA. No constituye una recomendación de inversión ni garantiza rentabilidad futura.
        </p>
      </main>
    </div>
  )
}

export default function PropuestaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <PropuestaContent />
    </Suspense>
  )
}
