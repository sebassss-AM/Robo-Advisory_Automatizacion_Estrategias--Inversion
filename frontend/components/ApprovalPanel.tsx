"use client"

import { useState } from "react"
import { api, type Allocation } from "@/services/api-client"

interface ApprovalPanelProps {
  proposalId: string
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
    if (!advisorId.trim()) {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-gray-900">Confirmar decisión</h3>
          <p className="mt-2 text-gray-600">
            ¿Estás seguro de {pendingAction === "aprobado" ? "aprobar" : "rechazar"} esta propuesta?
          </p>
          {comments && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              {comments}
            </div>
          )}
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmAction}
              disabled={loading}
              className={`flex-1 rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-50 ${
                pendingAction === "aprobado"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Revisión del Asesor</h2>
      <p className="mt-1 text-sm text-gray-500">
        Perfil: <span className="font-medium capitalize text-gray-700">{profileName}</span>
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-2 border-t pt-4">
        {allocations.map((a, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-600">{a.instrument_name}</span>
            <span className="font-semibold text-gray-900">{a.percentage}%</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">
          ID del asesor
        </label>
        <input
          type="text"
          value={advisorId}
          onChange={(e) => setAdvisorId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          placeholder="ej. asesor-001"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Comentarios (opcional)
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          rows={3}
          placeholder="Razón de la decisión..."
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => handleAction("rechazado")}
          className="flex-1 rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition hover:bg-red-50"
        >
          Rechazar
        </button>
        <button
          onClick={() => handleAction("aprobado")}
          className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Aprobar
        </button>
      </div>
    </div>
  )
}
