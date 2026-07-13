"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type MisPerfilamientoItem } from "@/services/api-client"
import { isAuthenticated, logout, isAdvisor } from "@/services/auth"
import NotificationBell from "@/components/NotificationBell"

const statusConfig: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "badge-yellow" },
  en_revision: { label: "En revisión", color: "badge-blue" },
  completado: { label: "Completado", color: "badge-green" },
}

export default function MisPerfilamientosPage() {
  const router = useRouter()
  const [items, setItems] = useState<MisPerfilamientoItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadItems = () => {
    api.getMisPerfilamientos().then(setItems).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
    if (isAdvisor()) {
      router.replace("/asesor")
      return
    }
    loadItems()
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este perfilamiento?")) return
    try {
      await api.deleteProfile(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white shadow-md">
              I
            </div>
            <span className="font-bold text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-1 sm:gap-3 min-h-[36px]">
            <a href="/dashboard" className="btn-ghost text-sm">Dashboard</a>
            <NotificationBell />
            <a href="/cuestionario" className="btn-primary text-sm ml-1">Nuevo perfilamiento</a>
            <button onClick={handleLogout} className="btn-ghost text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="animate-fade-in-up mb-10">
          <div className="badge badge-blue mb-4 inline-flex">Historial</div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Mis Perfilamientos</h1>
          <p className="mt-2 text-lg text-gray-500">
            Acá puedes ver el estado de tus perfilamientos y sus resultados.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="animate-fade-in-up card-premium py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
              <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-gray-900">No tienes perfilamientos</h3>
            <p className="mt-1 text-gray-500">Completa el cuestionario para recibir tu primera propuesta.</p>
            <a href="/cuestionario" className="btn-primary mt-6 inline-flex">
              Iniciar Perfilamiento
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item, i) => {
              const cfg = statusConfig[item.status] || { label: item.status, color: "badge badge-gray" }
              return (
                <div
                  key={item.id}
                  className="animate-fade-in-up card-premium p-6 transition-all hover:shadow-md"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className={`badge ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">
                          Perfil: <span className="capitalize text-blue-600">{item.profile}</span>
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500">
                          Puntaje: {item.score}/100
                        </p>
                        {!item.requires_review && item.status === "completado" && (
                          <p className="mt-0.5 text-xs text-gray-400">Sin revisión de asesor</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap text-sm text-gray-400">
                        {new Date(item.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-ghost text-sm text-red-400 hover:bg-red-50 hover:text-red-700"
                        title="Eliminar"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {item.status === "completado" && item.action && (
                    <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-gray-100">
                      <div className="flex items-center gap-2">
                        {item.action === "aprobado" ? (
                          <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={`text-sm font-bold ${item.action === "aprobado" ? "text-emerald-600" : "text-red-600"}`}>
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
                          className="btn-primary mt-4 inline-flex text-sm"
                        >
                          Ver propuesta
                        </a>
                      )}
                    </div>
                  )}

                  {item.status === "completado" && !item.requires_review && item.allocations && (
                    <div className="mt-4">
                      <a
                        href={`/propuesta?profile_id=${item.id}&profile=${item.profile}`}
                        className="btn-primary inline-flex text-sm"
                      >
                        Ver propuesta
                      </a>
                    </div>
                  )}

                  {item.status === "pendiente" && (
                    <div className="mt-4 rounded-xl bg-yellow-50/70 p-4 text-sm text-yellow-700 ring-1 ring-yellow-100">
                      Estamos esperando que un asesor revise tu perfilamiento. Te notificaremos cuando haya un resultado.
                    </div>
                  )}

                  {item.status === "en_revision" && (
                    <div className="mt-4 rounded-xl bg-blue-50/70 p-4 text-sm text-blue-700 ring-1 ring-blue-100">
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
