"use client"

import { useEffect, useState } from "react"
import { api, type HistoryItem } from "@/services/api-client"
import { useRouter } from "next/navigation"

const actionColors: Record<string, string> = {
  aprobado: "bg-green-100 text-green-800",
  rechazado: "bg-red-100 text-red-800",
  editado: "bg-yellow-100 text-yellow-800",
}

export default function AsesorPage() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Panel del Asesor
            </h1>
            <p className="text-gray-600">
              Historial de decisiones registradas
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Volver al inicio
          </button>
        </div>

        <div className="mt-6">
          <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span>Aprobado</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span>Rechazado</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>Editado</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-lg text-gray-500">No hay decisiones registradas aún</p>
              <p className="mt-1 text-sm text-gray-400">
                Las decisiones aparecerán aquí cuando los asesores revisen propuestas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 rounded-full px-3 py-1 text-xs font-medium ${
                          actionColors[item.action] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.action}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          Propuesta #{item.proposal_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Asesor: {item.advisor_id} | Perfil: {item.profile} | Reglas v{item.rules_version}
                        </p>
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-sm text-gray-400">
                      {new Date(item.decided_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {item.comments && (
                    <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                      {item.comments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
