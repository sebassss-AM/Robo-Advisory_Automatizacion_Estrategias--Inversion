"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type HistoryItem } from "@/services/api-client"
import { isAuthenticated, isAdvisor, logout, getUser } from "@/services/auth"

const actionBadge: Record<string, string> = {
  aprobado: "bg-green-100 text-green-700",
  rechazado: "bg-red-100 text-red-700",
  editado: "bg-yellow-100 text-yellow-700",
}

export default function AsesorPage() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
    if (!isAdvisor()) {
      router.replace("/")
      return
    }
    setChecking(false)

    api
      .getHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (checking) return null

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              I
            </div>
            <span className="font-bold text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {getUser()?.display_name || getUser()?.username}
            </span>
            <a
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Inicio
            </a>
            <button
              onClick={handleLogout}
              className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel del Asesor
          </h1>
          <p className="mt-2 text-gray-600">
            Historial de decisiones registradas en el sistema
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-2xl text-gray-400">i</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No hay decisiones registradas
            </h3>
            <p className="mt-1 text-gray-500">
              Cuando los asesores revisen propuestas, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border bg-surface p-6 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        actionBadge[item.action] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.action === "aprobado" ? "Aprobado" : item.action === "rechazado" ? "Rechazado" : "Editado"}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Propuesta #{item.proposal_id}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          Asesor: {item.advisor_id}
                        </span>
                        <span className="mx-2">·</span>
                        <span>Reglas v{item.rules_version}</span>
                        <span className="mx-2">·</span>
                        <span>Perfil: {item.profile}</span>
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
                  <div className="mt-4 rounded-xl bg-white p-4 text-sm text-gray-700">
                    {item.comments}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
