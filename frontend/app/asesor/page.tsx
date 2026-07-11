"use client"

import { useEffect, useState } from "react"

interface HistoryItem {
  id: number
  proposal_id: number
  advisor_id: string
  action: string
  comments: string | null
  rules_version: string
  decided_at: string
  profile: string
}

export default function AsesorPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    fetch("/api/revisar/historial")
      .then((res) => res.json())
      .then(setHistory)
      .catch(console.error)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900">Panel del Asesor</h1>
        <p className="mt-2 text-gray-600">
          Historial de decisiones registradas
        </p>

        {history.length === 0 ? (
          <p className="mt-8 text-gray-500">No hay decisiones registradas aún.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {history.map((item) => (
              <div key={item.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Propuesta #{item.proposal_id} —{" "}
                      <span
                        className={
                          item.action === "aprobado"
                            ? "text-green-600"
                            : item.action === "rechazado"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }
                      >
                        {item.action}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Asesor: {item.advisor_id} | Reglas v{item.rules_version}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(item.decided_at).toLocaleString("es-ES")}
                  </span>
                </div>
                {item.comments && (
                  <p className="mt-2 text-sm text-gray-700">{item.comments}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
