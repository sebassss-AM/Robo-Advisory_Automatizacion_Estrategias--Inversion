"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { api, type ProposalResult } from "@/services/api-client"
import PortfolioChart from "@/components/PortfolioChart"
import ApprovalPanel from "@/components/ApprovalPanel"

export default function PropuestaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const profileId = searchParams.get("profile_id")

  const [proposal, setProposal] = useState<ProposalResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [decisionMade, setDecisionMade] = useState(false)

  useEffect(() => {
    if (!profileId) {
      router.push("/cuestionario")
      return
    }

    api
      .createProposal(Number(profileId))
      .then(setProposal)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [profileId, router])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Generando tu propuesta personalizada...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => router.push("/cuestionario")}
            className="mt-4 text-blue-600 underline"
          >
            Volver al cuestionario
          </button>
        </div>
      </main>
    )
  }

  if (decisionMade) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Decisión registrada
          </h2>
          <p className="mt-2 text-gray-600">
            La propuesta ha sido procesada según tu decisión.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">
          Tu Propuesta de Portafolio
        </h1>
        <p className="mt-1 text-gray-500">
          Perfil: <span className="font-medium capitalize">{proposal?.profile}</span>
        </p>

        <div className="mt-6">
          <PortfolioChart allocations={proposal?.allocations || []} />
        </div>

        <div className="mt-6 rounded-lg border bg-blue-50 p-4">
          <h2 className="font-semibold text-gray-900">Métricas de Riesgo</h2>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            <li>
              <span className="font-medium">Volatilidad esperada:</span>{" "}
              {proposal?.risk_metrics.expected_volatility}
            </li>
            <li>
              <span className="font-medium">Diversificación:</span>{" "}
              {proposal?.risk_metrics.diversification_score}/100
            </li>
            <li>
              <span className="font-medium">Drawdown máximo estimado:</span>{" "}
              {proposal?.risk_metrics.max_drawdown_estimate}
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-lg border bg-gray-50 p-4">
          <h2 className="font-semibold text-gray-900">Explicación</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
            {proposal?.explanation}
          </p>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Esta es una propuesta informativa. No constituye una recomendación de inversión.
          Un asesor autorizado debe revisar y aprobar antes de ejecutar.
        </p>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Revisión del Asesor
          </h2>
          <ApprovalPanel
            proposalId={Number(proposal?.proposal_id)}
            profileName={proposal?.profile || ""}
            allocations={proposal?.allocations || []}
            rulesVersion="1.0.0"
            onDecisionComplete={() => setDecisionMade(true)}
          />
        </div>
      </div>
    </main>
  )
}
