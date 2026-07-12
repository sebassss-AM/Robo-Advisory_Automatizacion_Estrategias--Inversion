"use client"

import { useEffect, useState } from "react"
import { api, type Allocation } from "@/services/api-client"
import { getUser } from "@/services/auth"

interface ApprovalPanelProps {
  proposalId: string
  profileName: string
  allocations: Allocation[]
  rulesVersion: string
  onDecisionComplete: () => void
  onAllocationsChange?: (allocs: Allocation[]) => void
}

export default function ApprovalPanel({
  proposalId,
  profileName,
  allocations: initialAllocations,
  rulesVersion,
  onDecisionComplete,
  onAllocationsChange,
}: ApprovalPanelProps) {
  const [advisorId, setAdvisorId] = useState("")
  const [comments, setComments] = useState("")
  const [editableAllocs, setEditableAllocs] = useState<Allocation[]>(initialAllocations)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<"aprobado" | "rechazado" | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (user?.display_name) setAdvisorId(user.display_name)
    else if (user?.username) setAdvisorId(user.username)
  }, [])

  const total = editableAllocs.reduce((s, a) => s + a.percentage, 0)
  const isModified = JSON.stringify(editableAllocs) !== JSON.stringify(initialAllocations)

  useEffect(() => {
    if (editMode && onAllocationsChange) {
      onAllocationsChange(editableAllocs)
    }
  }, [editableAllocs, editMode, onAllocationsChange])

  const updatePercentage = (index: number, value: number) => {
    const copy = editableAllocs.map((a, i) =>
      i === index ? { ...a, percentage: Math.max(0, Math.min(100, value)) } : a
    )
    setEditableAllocs(copy)
  }

  const handleAction = async (action: "aprobado" | "rechazado") => {
    if (!advisorId.trim()) {
      setError("Ingresa tu ID de asesor")
      return
    }
    if (action === "aprobado" && total !== 100) {
      setError(`Los porcentajes deben sumar 100% (actual: ${total}%)`)
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
        edited_allocations: isModified && pendingAction === "aprobado" ? editableAllocs : undefined,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="animate-scale-in mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl shadow-black/10 ring-1 ring-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Confirmar decisión</h3>
          <p className="mt-2 text-gray-500">
            ¿Estás seguro de {pendingAction === "aprobado" ? "aprobar" : "rechazar"} esta propuesta?
          </p>
          {isModified && pendingAction === "aprobado" && (
            <div className="mt-4 rounded-xl bg-blue-50 p-3.5 text-sm text-blue-700 ring-1 ring-blue-100">
              Se guardarán los cambios en la distribución
            </div>
          )}
          {comments && (
            <div className="mt-4 rounded-xl bg-gray-50 p-3.5 text-sm text-gray-700 ring-1 ring-gray-100">
              {comments}
            </div>
          )}
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="btn-secondary flex-1 justify-center py-3"
            >
              Cancelar
            </button>
            <button
              onClick={confirmAction}
              disabled={loading}
              className={`flex-1 rounded-xl px-4 py-3 font-semibold text-white transition disabled:opacity-50 ${
                pendingAction === "aprobado"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-600/25"
                  : "bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-lg hover:shadow-red-600/25"
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
    <div className="card-premium p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-sm font-bold text-white shadow-md">
          AS
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Revisión del Asesor</h2>
          <p className="text-sm text-gray-500">
            Perfil: <span className="font-medium capitalize text-gray-700">{profileName}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="animate-fade-in mt-4 rounded-xl bg-red-50 p-3.5 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
        {editableAllocs.map((a, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="flex-1 text-sm text-gray-600">{a.instrument_name}</span>
            {editMode ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={a.percentage}
                  onChange={(e) => updatePercentage(i, parseFloat(e.target.value) || 0)}
                  className="w-20 rounded-lg border border-gray-200 px-3 py-1.5 text-right text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  min={0}
                  max={100}
                  step={0.5}
                />
                <span className="text-sm text-gray-400">%</span>
              </div>
            ) : (
              <span className="min-w-[4rem] text-right text-sm font-semibold text-gray-900">
                {a.percentage}%
              </span>
            )}
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-sm">
          <span className="font-medium text-gray-500">Total</span>
          <span className={`font-bold ${total === 100 ? "text-emerald-600" : "text-red-600"}`}>
            {total}%
          </span>
        </div>
      </div>

      {!editMode ? (
        <button
          onClick={() => setEditMode(true)}
          className="btn-secondary mt-4 w-full justify-center text-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar distribución
        </button>
      ) : (
        <button
          onClick={() => {
            setEditableAllocs(initialAllocations)
            setEditMode(false)
          }}
          className="btn-secondary mt-4 w-full justify-center text-sm"
        >
          Restablecer original
        </button>
      )}

      <div className="mt-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Asesor
        </label>
        <input
          type="text"
          value={advisorId}
          onChange={(e) => setAdvisorId(e.target.value)}
          className="input-premium w-full"
          placeholder="Tu nombre o ID"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Comentarios <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="input-premium w-full resize-none"
          rows={3}
          placeholder="Razón de la decisión..."
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAction("rechazado")}
          className="rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-300"
        >
          Rechazar
        </button>
        <button
          onClick={() => handleAction("aprobado")}
          className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 font-semibold text-white transition hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-600/25"
        >
          Aprobar
        </button>
      </div>
    </div>
  )
}
