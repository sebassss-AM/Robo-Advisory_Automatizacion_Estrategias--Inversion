"use client"

import { useState } from "react"
import { api, type Allocation } from "@/services/api-client"

interface ApprovalPanelProps {
  proposalId: number
  profileName: string
  allocations: Allocation[]
  rulesVersion: string
  onDecisionComplete: () => void
}

export default function ApprovalPanel({
  proposalId,
  profileName,
  allocations,
  rulesVersion,
  onDecisionComplete,
}: ApprovalPanelProps) {
  const [advisorId, setAdvisorId] = useState("")
  const [comments, setComments] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<"aprobado" | "rechazado" | null>(null)

  const handleAction = async (action: "aprobado" | "rechazado") => {
    if (!advisorId) {
      setError("Ingresa tu ID de asesor")
      return
    }
    setPendingAction(action)
    setShowConfirm(true)
  }

  const confirmAction = async () => {
    setLoading(true)
    setError("")
    try {
      await api.reviewProposal({
        proposal_id: proposalId,
        advisor_id: advisorId,
        action: pendingAction!,
        comments: comments || undefined,
        rules_version: rulesVersion,
      })
      onDecisionComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar decisión")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Confirmar decisión</h3>
          <p className="mt-2 text-gray-600">
            ¿Estás seguro de {pendingAction === "aprobado" ? "aprobar" : "rechazar"} esta propuesta?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={confirmAction}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-white ${
                pendingAction === "aprobado"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50`}
            >
              {loading ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg rounded-lg border bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900">Revisión de Propuesta</h2>
      <p className="mt-1 text-sm text-gray-500">
        Perfil: <span className="font-medium">{profileName}</span>
      </p>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-1">
        {allocations.map((a, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-600">{a.instrument_name}</span>
            <span className="font-medium">{a.percentage}%</span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          ID del asesor
        </label>
        <input
          type="text"
          value={advisorId}
          onChange={(e) => setAdvisorId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
          placeholder="ej. asesor-001"
        />
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700">
          Comentarios (opcional)
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
          rows={3}
          placeholder="Razón de la decisión..."
        />
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => handleAction("aprobado")}
          className="flex-1 rounded-lg bg-green-600 py-2 text-white hover:bg-green-700"
        >
          Aprobar
        </button>
        <button
          onClick={() => handleAction("rechazado")}
          className="flex-1 rounded-lg bg-red-600 py-2 text-white hover:bg-red-700"
        >
          Rechazar
        </button>
      </div>
    </div>
  )
}
