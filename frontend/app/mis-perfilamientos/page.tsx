"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type MisPerfilamientoItem } from "@/services/api-client"
import { isAuthenticated, logout, isAdvisor } from "@/services/auth"

const statusConfig: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  en_revision: { label: "En revisión", color: "bg-blue-100 text-blue-700" },
  completado: { label: "Completado", color: "bg-green-100 text-green-700" },
}

export default function MisPerfilamientosPage() {
  const router = useRouter()
  const [items, setItems] = useState<MisPerfilamientoItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
    if (isAdvisor()) {
      router.replace("/asesor")
      return
    }
    api.getMisPerfilamientos().then(setItems).catch(console.error).finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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
            <button onClick={handleLogout} className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Mis Perfilamientos</h1>
          <p className="mt-2 text-gray-600">
            Acá podés ver el estado de tus perfilamientos y sus resultados.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <h3 className="text-lg font-semibold text-gray-900">No tenés perfilamientos</h3>
            <p className="mt-1 text-gray-500">Completá el cuestionario para recibir tu primera propuesta.</p>
            <a
              href="/cuestionario"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Iniciar Perfilamiento
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const cfg = statusConfig[item.status] || { label: item.status, color: "bg-gray-100 text-gray-700" }
              return (
                <div key={item.id} className="rounded-2xl border bg-surface p-6 transition hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Perfil: <span className="capitalize">{item.profile}</span>
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Puntaje: {item.score}/100
                        </p>
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-sm text-gray-400">
                      {new Date(item.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {item.status === "completado" && item.action && (
                    <div className="mt-4 rounded-xl bg-white p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${item.action === "aprobado" ? "text-green-600" : "text-red-600"}`}>
                          {item.action === "aprobado" ? "Aprobado" : "Rechazado"}
                        </span>
                        <span className="text-sm text-gray-400">por el asesor</span>
                      </div>
                      {item.comments && (
                        <p className="mt-2 text-sm text-gray-600">{item.comments}</p>
                      )}
                      {item.allocations && (
                        <a
                          href={`/propuesta?profile_id=${item.id}&profile=${item.profile}`}
                          className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Ver propuesta
                        </a>
                      )}
                    </div>
                  )}

                  {item.status === "pendiente" && (
                    <div className="mt-4 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
                      Estamos esperando que un asesor revise tu perfilamiento. Te notificaremos cuando haya un resultado.
                    </div>
                  )}

                  {item.status === "en_revision" && (
                    <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                      Un asesor está revisando tu perfilamiento en este momento.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
