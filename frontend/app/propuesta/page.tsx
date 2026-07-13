"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { api, type ProposalResult, type Allocation } from "@/services/api-client"
import { isAuthenticated, logout } from "@/services/auth"
import PortfolioChart from "@/components/PortfolioChart"
import ApprovalPanel from "@/components/ApprovalPanel"
import ChatBot from "@/components/ChatBot"

const COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-violet-500", "bg-rose-500", "bg-cyan-500", "bg-orange-500",
]

const COLOR_HEX = [
  "#3b82f6", "#10b981", "#f59e0b",
  "#8b5cf6", "#f43f5e", "#06b6d4", "#f97316",
]

function simpleMarkdown(text: string): string {
  const lines = text.split("\n")
  const out: string[] = []
  let inList = false
  let listType = ""

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      if (inList) { out.push("</ul>"); inList = false }
      continue
    }

    const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

    const isBullet = line.startsWith("- ") || line.startsWith("* ")
    const isNumbered = /^\d+[.)] /.test(line)

    if (isBullet || isNumbered) {
      const type = isBullet ? "disc" : "decimal"
      if (!inList || listType !== type) {
        if (inList) out.push("</ul>")
        out.push(`<ul class="list-${type} list-inside space-y-0.5">`)
        inList = true
        listType = type
      }
      out.push(`<li class="text-gray-700 leading-relaxed">${formatted.replace(/^[-*\d]+[.)\s]\s*/, "")}</li>`)
      continue
    }

    if (inList) { out.push("</ul>"); inList = false }
    out.push(`<p class="text-gray-700 leading-relaxed">${formatted}</p>`)
  }

  if (inList) out.push("</ul>")
  return out.join("")
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function PropuestaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const profileId = searchParams.get("profile_id")
  const fromAsesor = searchParams.get("from") === "asesor"
  const fromDemo = searchParams.get("from") === "demo"
  const profileParam = searchParams.get("profile") || undefined

  const [proposal, setProposal] = useState<ProposalResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [decisionMade, setDecisionMade] = useState(false)
  const [editedAllocs, setEditedAllocs] = useState<Allocation[] | null>(null)

  useEffect(() => {
    if (fromDemo) {
      try {
        const raw = sessionStorage.getItem("inversia_demo_result")
        if (!raw) {
          router.push("/demo")
          return
        }
        const data = JSON.parse(raw)
        const p = data.proposal
        setProposal({
          proposal_id: p.proposal_id,
          profile_id: p.profile_id,
          profile: p.profile,
          allocations: p.allocations,
          risk_metrics: p.risk_metrics,
          explanation: p.explanation,
          monthly_investment: p.monthly_investment,
        })
      } catch {
        router.push("/demo")
      } finally {
        setLoading(false)
      }
      return
    }

    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
    if (!profileId) {
      router.push("/cuestionario")
      return
    }

    const storedInvest = parseFloat(localStorage.getItem("inversia_monthly_investment") || "0")

    api
      .createProposal(profileId, profileParam, storedInvest > 0 ? storedInvest : undefined)
      .then(setProposal)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [profileId, profileParam, router, fromDemo])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
          <p className="mt-6 text-lg text-gray-500">Generando tu propuesta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-scale-in text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 ring-1 ring-red-200">
            <span className="text-3xl font-bold text-red-600">!</span>
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">Algo salió mal</h2>
          <p className="mt-2 text-gray-500">{error}</p>
          <button onClick={() => router.push("/")} className="btn-primary mt-8">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (decisionMade) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-scale-in text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 ring-1 ring-green-200">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Decisión registrada</h2>
          <p className="mt-2 text-gray-500">
            {fromAsesor ? "La propuesta ha sido procesada exitosamente." : "Tu perfilamiento fue completado. Un asesor lo revisará pronto."}
          </p>
          <button onClick={() => router.push(fromAsesor ? "/asesor" : "/mis-perfilamientos")} className="btn-primary mt-8">
            {fromAsesor ? "Volver al panel" : "Mis perfilamientos"}
          </button>
        </div>
      </div>
    )
  }

  const p = proposal!
  const monthlyInvest = p.monthly_investment ?? 0
  const returnPct = p.risk_metrics?.expected_return_pct ?? 0
  const totalAnnualInvest = monthlyInvest * 12

  const periods = [
    { label: "1 año", months: 12 },
    { label: "5 años", months: 60 },
    { label: "10 años", months: 120 },
  ]

  const displayAllocs = editedAllocs || p.allocations

  const projections = periods.map((per) => {
    const r = returnPct / 100
    const totalContrib = monthlyInvest * per.months
    const fv = monthlyInvest * ((Math.pow(1 + r / 12, per.months) - 1) / (r / 12)) * (1 + r / 12)
    const gain = fv - totalContrib
    return { ...per, totalContrib, futureValue: fv, gain }
  })

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white shadow-md">
              I
            </div>
            <span className="text-lg font-bold text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-3">
            <span className="badge badge-blue text-xs">
              Perfil {p.profile}
            </span>
            {fromAsesor && <span className="badge text-xs bg-amber-50 text-amber-700">Revisión</span>}
            {fromDemo ? (
              <a href="/register" className="btn-primary text-sm">
                Crear cuenta gratis
              </a>
            ) : (
              <button onClick={handleLogout} className="btn-ghost text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Demo banner */}
        {fromDemo && (
          <div className="animate-fade-in-up mb-8 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-center shadow-lg">
            <p className="text-lg font-bold text-white">Modo demo — nada de esto se guarda</p>
            <p className="mt-1 text-sm text-amber-100">
              <a href="/register" className="font-semibold underline hover:text-white">Creá tu cuenta gratis</a> para guardar tu perfilamiento y acceder a asesoría personalizada.
            </p>
          </div>
        )}

        {/* Title */}
        <div className="animate-fade-in-up mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Propuesta de Portafolio</h1>
          <p className="mt-2 text-gray-500">
            {fromAsesor
              ? "Revisá la propuesta generada. Podés aprobarla, editarla o rechazarla."
              : "Esta propuesta está alineada con tu perfil de riesgo. Un asesor autorizado debe revisarla y aprobarla."}
          </p>
        </div>

        {/* Summary cards */}
        <div className="animate-fade-in-up stagger-1 mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Inversión Mensual", value: `$${formatCurrency(monthlyInvest)}`, color: "text-gray-900" },
            { label: "Inversión Anual", value: `$${formatCurrency(totalAnnualInvest)}`, color: "text-gray-900" },
            { label: "Rentabilidad Estimada", value: returnPct > 0 ? `${returnPct}% anual` : "—", color: "text-emerald-600" },
            {
              label: "Proyección a 1 Año",
              value: projections[0] ? `$${formatCurrency(projections[0].futureValue)}` : "—",
              color: "text-gray-900",
              sub: projections[0] && projections[0].gain > 0
                ? `+$${formatCurrency(projections[0].gain)} de ganancia`
                : undefined,
              subColor: "text-emerald-600",
            },
          ].map((card, i) => (
            <div key={i} className="card-premium p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{card.label}</p>
              <p className={`mt-1.5 text-2xl font-bold ${card.color}`}>{card.value}</p>
              {"sub" in card && card.sub && (
                <p className={`mt-0.5 text-xs font-medium ${card.subColor}`}>{card.sub}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: main content */}
          <div className="space-y-8 lg:col-span-3">
            {/* Allocation */}
            <div className="animate-fade-in-up stagger-2 card-premium p-6 lg:p-8">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Distribución por Activo</h2>

              <PortfolioChart allocations={displayAllocs} />

              {displayAllocs.length > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                    <span className="col-span-4">Activo</span>
                    <span className="col-span-2 text-right">Porcentaje</span>
                    <span className="col-span-3 text-right">Aporte Mensual</span>
                    <span className="col-span-3 text-right">Retorno Anual Est.</span>
                  </div>

                  {displayAllocs.map((a, i) => {
                    const amount = monthlyInvest > 0 ? (a.percentage / 100) * monthlyInvest : 0
                    return (
                      <div key={i}>
                        <div className="grid grid-cols-12 items-center gap-2 px-1 py-2 text-sm">
                          <div className="col-span-4 flex items-center gap-2.5">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: COLOR_HEX[i % COLOR_HEX.length] }}
                            />
                            <span className="truncate font-medium text-gray-800">{a.instrument_name}</span>
                          </div>
                          <span className="col-span-2 text-right font-bold text-gray-900">{a.percentage}%</span>
                          <span className="col-span-3 text-right font-semibold text-blue-600">
                            {monthlyInvest > 0 ? `$${formatCurrency(amount)}` : "—"}
                          </span>
                          <span className="col-span-3 text-right font-semibold text-emerald-600">
                            {a.expected_return ? a.expected_return : "—"}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${a.percentage}%`, backgroundColor: COLOR_HEX[i % COLOR_HEX.length] }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  <div className="border-t pt-3">
                    <div className="grid grid-cols-12 items-center gap-2 px-1 text-sm font-bold">
                      <span className="col-span-4 text-gray-900">Total</span>
                      <span className="col-span-2 text-right text-gray-900">100%</span>
                      <span className="col-span-3 text-right text-blue-600">
                        {monthlyInvest > 0 ? `$${formatCurrency(monthlyInvest)}` : "—"}
                      </span>
                      <span className="col-span-3 text-right text-emerald-600">
                        {returnPct > 0 ? `${returnPct}% anual` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Projection */}
            {returnPct > 0 && monthlyInvest > 0 && (
              <div className="animate-fade-in-up stagger-3 card-premium p-6 lg:p-8">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Proyección de Crecimiento</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        <th className="pb-3 font-medium">Período</th>
                        <th className="pb-3 text-right font-medium">Total Aportado</th>
                        <th className="pb-3 text-right font-medium">Valor Proyectado</th>
                        <th className="pb-3 text-right font-medium">Ganancia</th>
                        <th className="pb-3 text-right font-medium">Rendimiento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {projections.map((proj) => {
                        const rend = ((proj.futureValue / proj.totalContrib) - 1) * 100
                        return (
                          <tr key={proj.label} className="transition-colors hover:bg-blue-50/30">
                            <td className="py-3.5 font-bold text-gray-800">{proj.label}</td>
                            <td className="py-3.5 text-right text-gray-500">${formatCurrency(proj.totalContrib)}</td>
                            <td className="py-3.5 text-right font-bold text-gray-900">${formatCurrency(proj.futureValue)}</td>
                            <td className="py-3.5 text-right font-bold text-emerald-600">+${formatCurrency(proj.gain)}</td>
                            <td className="py-3.5 text-right font-bold text-emerald-600">+{rend.toFixed(1)}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs text-gray-400">
                  Proyección basada en rentabilidad estimada del {returnPct}% anual con aportes mensuales de ${formatCurrency(monthlyInvest)}.
                  No garantiza resultados futuros.
                </p>
              </div>
            )}

            {/* Explanation */}
            <div className="animate-fade-in-up stagger-4 card-premium p-6 lg:p-8">
              <h2 className="mb-5 text-xl font-bold text-gray-900">Detalle de la Propuesta</h2>
              {p.explanation ? (
                <div
                  className="explanation leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(p.explanation) }}
                />
              ) : (
                <p className="text-gray-400">No hay explicación disponible.</p>
              )}
            </div>
          </div>

          {/* Right: risk + approval */}
          <div className="space-y-6 lg:col-span-2">
            {/* Risk metrics */}
            <div className="animate-fade-in-up stagger-3 card-premium p-6">
              <h2 className="mb-5 text-lg font-bold text-gray-900">Métricas de Riesgo</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-blue-50/50 px-4 py-3.5 ring-1 ring-blue-100/50">
                  <span className="text-sm text-gray-500">Volatilidad Esperada</span>
                  <span className="font-semibold text-gray-900">{p.risk_metrics.expected_volatility}</span>
                </div>
                <div className="rounded-xl bg-blue-50/50 px-4 py-3.5 ring-1 ring-blue-100/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Diversificación</span>
                    <span className="font-bold text-gray-900">{p.risk_metrics.diversification_score}/100</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-blue-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${p.risk_metrics.diversification_score}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-blue-50/50 px-4 py-3.5 ring-1 ring-blue-100/50">
                  <span className="text-sm text-gray-500">Drawdown Máximo</span>
                  <span className="font-semibold text-gray-900">{p.risk_metrics.max_drawdown_estimate}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-emerald-50/50 px-4 py-3.5 ring-1 ring-emerald-100/50">
                  <span className="text-sm text-gray-500">Rentabilidad Estimada</span>
                  <span className="font-bold text-emerald-600">{p.risk_metrics.expected_return_range}</span>
                </div>
              </div>
            </div>

            {/* Per-asset returns */}
            {monthlyInvest > 0 && (
              <div className="animate-fade-in-up stagger-4 card-premium p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Retorno por Activo</h2>
                <div className="space-y-3">
                  {displayAllocs.map((a, i) => {
                    const monthlyAmt = (a.percentage / 100) * monthlyInvest
                    const annualGain = a.return_pct > 0 ? monthlyAmt * 12 * (a.return_pct / 100) : 0
                    return (
                      <div key={a.instrument_id} className="flex items-center justify-between rounded-xl bg-gray-50/70 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: COLOR_HEX[i % COLOR_HEX.length] }}
                          />
                          <span className="text-sm text-gray-700">{a.instrument_name.split("(")[0].trim()}</span>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-semibold text-gray-900">{a.expected_return || "—"}</p>
                          {annualGain > 0 && <p className="font-medium text-emerald-600">~+${formatCurrency(annualGain)}/año</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Approval */}
            {fromAsesor && (
              <div className="animate-fade-in-up stagger-5">
                <ApprovalPanel
                  proposalId={p.proposal_id}
                  profileName={p.profile}
                  allocations={p.allocations}
                  rulesVersion="1.0.0"
                  onDecisionComplete={() => setDecisionMade(true)}
                  onAllocationsChange={(allocs) => setEditedAllocs(allocs)}
                />
              </div>
            )}
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-gray-400">
          Esta es una propuesta informativa generada por IA. No constituye una recomendación de inversión ni garantiza rentabilidad futura.
        </p>
      </main>

      {!fromDemo && (
        <ChatBot
          profile={p.profile}
          score={0}
          monthlyInvestment={monthlyInvest}
          allocations={p.allocations}
          riskMetrics={p.risk_metrics}
          explanation={p.explanation}
        />
      )}
    </div>
  )
}

export default function PropuestaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
      </div>
    }>
      <PropuestaContent />
    </Suspense>
  )
}
