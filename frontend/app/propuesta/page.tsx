"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

interface Allocation {
  instrument_name: string
  category: string
  percentage: number
}

interface Proposal {
  allocations: Allocation[]
  risk_metrics: { expected_volatility: string; diversification_score: number; max_drawdown_estimate: string }
  explanation: string
}

export default function PropuestaPage() {
  const searchParams = useSearchParams()
  const profileId = searchParams.get("profile_id")
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profileId) {
      fetch("/api/propuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: Number(profileId) }),
      })
        .then((res) => res.json())
        .then((data) => setProposal(data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [profileId])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-lg text-gray-600">Generando tu propuesta...</p>
      </main>
    )
  }

  if (!proposal) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-lg text-red-600">Error al carlar la propuesta</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Tu Propuesta de Portafolio</h1>

        <div className="mt-6 space-y-4">
          {proposal.allocations.map((alloc, i) => (
            <div key={i} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{alloc.instrument_name}</p>
                  <p className="text-sm text-gray-500">{alloc.category}</p>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {alloc.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border bg-blue-50 p-4">
          <h2 className="font-semibold text-gray-900">Métricas de Riesgo</h2>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            <li>Volatilidad esperada: {proposal.risk_metrics.expected_volatility}</li>
            <li>Diversificación: {proposal.risk_metrics.diversification_score}/100</li>
            <li>Drawdown máximo estimado: {proposal.risk_metrics.max_drawdown_estimate}</li>
          </ul>
        </div>

        <div className="mt-6 rounded-lg border bg-gray-50 p-4">
          <h2 className="font-semibold text-gray-900">Explicación</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
            {proposal.explanation}
          </p>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Esta es una propuesta informativa. No constituye una recomendación de inversión.
          Un asesor autorizado debe revisar y aprobar antes de ejecutar.
        </p>
      </div>
    </main>
  )
}
