"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { api, type ProposalResult, type Allocation } from "@/services/api-client"
import { isAuthenticated, logout } from "@/services/auth"
import PortfolioChart from "@/components/PortfolioChart"
import ApprovalPanel from "@/components/ApprovalPanel"

const COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-violet-500", "bg-rose-500", "bg-cyan-500", "bg-orange-500",
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

  const [proposal, setProposal] = useState<ProposalResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [decisionMade, setDecisionMade] = useState(false)
  const [editedAllocs, setEditedAllocs] = useState<Allocation[] | null>(null)

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
    const storedInvest = parseFloat(localStorage.getItem("inversia_monthly_investment") || "0")

    api
      .createProposal(profileId, profile, storedInvest > 0 ? storedInvest : undefined)
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-lg text-gray-600">Generando tu propuesta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl text-red-600">!</span>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Algo salió mal</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button onClick={() => router.push("/")} className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">Volver al inicio</button>
        </div>
      </div>
    )
  }

  if (decisionMade) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <span className="text-4xl text-green-600">✓</span>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Decisión registrada</h2>
          <p className="mt-2 text-gray-600">
            {fromAsesor ? "La propuesta ha sido procesada exitosamente." : "Tu perfilamiento fue completado. Un asesor lo revisara pronto."}
          </p>
          <button onClick={() => router.push(fromAsesor ? "/asesor" : "/mis-perfilamientos")} className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700">
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
    { label: "1 ano", months: 12 },
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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">I</div>
            <span className="text-lg font-bold text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-4">
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
              Perfil {p.profile}
            </span>
            {fromAsesor && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">Revisión</span>}
            <button onClick={handleLogout} className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Cerrar sesion</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Propuesta de Portafolio</h1>
          <p className="mt-1 text-gray-500">
            {fromAsesor
              ? "Revisa la propuesta generada. Podes aprobarla, editarla o rechazarla."
              : "Esta propuesta esta alineada con tu perfil de riesgo. Un asesor autorizado debe revisarla y aprobarla."}
          </p>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Inversión Mensual</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">${formatCurrency(monthlyInvest)}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Inversión Anual</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">${formatCurrency(totalAnnualInvest)}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Rentabilidad Estimada</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{returnPct > 0 ? `${returnPct}% anual` : "—"}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Proyección a 1 Año</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {projections[0] ? `$${formatCurrency(projections[0].futureValue)}` : "—"}
            </p>
            {projections[0] && projections[0].gain > 0 && (
              <p className="text-xs text-emerald-600">+${formatCurrency(projections[0].gain)} de ganancia</p>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: allocation breakdown */}
          <div className="space-y-6 lg:col-span-3">
            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-bold text-gray-900">Distribución por Activo</h2>

              <PortfolioChart allocations={displayAllocs} />

              {displayAllocs.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium uppercase tracking-wide text-gray-400">
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
                          <div className="col-span-4 flex items-center gap-2">
                            <span className={`inline-block h-2.5 w-2.5 rounded-full ${COLORS[i % COLORS.length]}`} />
                            <span className="truncate font-medium text-gray-800">{a.instrument_name}</span>
                          </div>
                          <span className="col-span-2 text-right font-semibold text-gray-900">{a.percentage}%</span>
                          <span className="col-span-3 text-right font-semibold text-blue-600">
                            {monthlyInvest > 0 ? `$${formatCurrency(amount)}` : "—"}
                          </span>
                          <span className="col-span-3 text-right text-emerald-600">
                            {a.expected_return ? a.expected_return : "—"}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                          <div className={`h-1.5 rounded-full ${COLORS[i % COLORS.length]}`} style={{ width: `${a.percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}

                  {/* Total row */}
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

            {/* Projection timeline */}
            {returnPct > 0 && monthlyInvest > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-5 text-lg font-bold text-gray-900">Proyección de Crecimiento</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                        <th className="pb-3 font-medium">Período</th>
                        <th className="pb-3 text-right font-medium">Total Aportado</th>
                        <th className="pb-3 text-right font-medium">Valor Proyectado</th>
                        <th className="pb-3 text-right font-medium">Ganancia</th>
                        <th className="pb-3 text-right font-medium">Rendimiento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {projections.map((proj) => {
                        const rend = ((proj.futureValue / proj.totalContrib) - 1) * 100
                        return (
                          <tr key={proj.label} className="hover:bg-gray-50">
                            <td className="py-3 font-semibold text-gray-800">{proj.label}</td>
                            <td className="py-3 text-right text-gray-600">${formatCurrency(proj.totalContrib)}</td>
                            <td className="py-3 text-right font-bold text-gray-900">${formatCurrency(proj.futureValue)}</td>
                            <td className="py-3 text-right font-semibold text-emerald-600">+${formatCurrency(proj.gain)}</td>
                            <td className="py-3 text-right font-semibold text-emerald-600">+{rend.toFixed(1)}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  Proyección basada en rentabilidad estimada del {returnPct}% anual con aportes mensuales de ${formatCurrency(monthlyInvest)}.
                  No garantiza resultados futuros.
                </p>
              </div>
            )}

            {/* Explanation */}
            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Detalle de la Propuesta</h2>
              {p.explanation ? (
                <div
                  className="explanation text-sm leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(p.explanation) }}
                />
              ) : (
                <p className="text-gray-500">No hay explicacion disponible.</p>
              )}
            </div>
          </div>

          {/* Right: risk metrics + approval */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-bold text-gray-900">Métricas de Riesgo</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-500">Volatilidad Esperada</span>
                  <span className="font-semibold text-gray-900">{p.risk_metrics.expected_volatility}</span>
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Diversificación</span>
                    <span className="font-bold text-gray-900">{p.risk_metrics.diversification_score}/100</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${p.risk_metrics.diversification_score}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-500">Drawdown Máximo</span>
                  <span className="font-semibold text-gray-900">{p.risk_metrics.max_drawdown_estimate}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-500">Rentabilidad Estimada</span>
                  <span className="font-semibold text-emerald-600">{p.risk_metrics.expected_return_range}</span>
                </div>
              </div>
            </div>

            {/* Per-asset returns */}
            {monthlyInvest > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Retorno por Activo</h2>
                <div className="space-y-3">
                  {displayAllocs.map((a, i) => {
                    const monthlyAmt = (a.percentage / 100) * monthlyInvest
                    const annualGain = a.return_pct > 0 ? monthlyAmt * 12 * (a.return_pct / 100) : 0
                    return (
                      <div key={a.instrument_id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${COLORS[i % COLORS.length]}`} />
                          <span className="text-sm text-gray-700">{a.instrument_name.split("(")[0].trim()}</span>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-semibold text-gray-900">{a.expected_return || "—"}</p>
                          {annualGain > 0 && <p className="text-emerald-600">~+${formatCurrency(annualGain)}/año</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {fromAsesor && (
              <ApprovalPanel
                proposalId={p.proposal_id}
                profileName={p.profile}
                allocations={p.allocations}
                rulesVersion="1.0.0"
                onDecisionComplete={() => setDecisionMade(true)}
                onAllocationsChange={(allocs) => setEditedAllocs(allocs)}
              />
            )}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          Esta es una propuesta informativa generada por IA. No constituye una recomendacion de inversion ni garantiza rentabilidad futura.
        </p>
      </main>
    </div>
  )
}

export default function PropuestaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <PropuestaContent />
    </Suspense>
  )
}
