"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { api, type ProposalResult } from "@/services/api-client"
import { isAuthenticated, logout, isAdvisor } from "@/services/auth"
import PortfolioChart from "@/components/PortfolioChart"
import ApprovalPanel from "@/components/ApprovalPanel"

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

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
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

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Propuesta de Portafolio</h1>
          <p className="mt-2 text-gray-600">
            {fromAsesor
              ? "Revisá la propuesta generada por la IA. Podés aprobarla, editarla o rechazarla."
              : "Esta propuesta está alineada con tu perfil de riesgo. Un asesor autorizado debe revisarla y aprobarla."}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border bg-surface p-6">
              <h2 className="mb-6 text-lg font-bold text-gray-900">Distribución sugerida</h2>
              <PortfolioChart allocations={proposal?.allocations || []} />
            </div>

            <div className="mt-6 rounded-2xl border bg-surface p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Explicación</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{proposal?.explanation}</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-blue-50 p-6">
              <h2 className="text-lg font-bold text-gray-900">Métricas de Riesgo</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-sm text-gray-500">Volatilidad esperada</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{proposal?.risk_metrics.expected_volatility}</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-sm text-gray-500">Puntaje de diversificación</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${proposal?.risk_metrics.diversification_score}%` }} />
                    </div>
                    <span className="text-lg font-bold text-gray-900">{proposal?.risk_metrics.diversification_score}/100</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-sm text-gray-500">Drawdown máximo estimado</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{proposal?.risk_metrics.max_drawdown_estimate}</p>
                </div>
              </div>
            </div>

            {fromAsesor && (
              <div className="mt-6">
                <ApprovalPanel
                  proposalId={proposal?.proposal_id || ""}
                  profileName={proposal?.profile || ""}
                  allocations={proposal?.allocations || []}
                  rulesVersion="1.0.0"
                  onDecisionComplete={() => setDecisionMade(true)}
                />
              </div>
            )}
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-400">
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
