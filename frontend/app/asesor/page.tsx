"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type PerfilPendiente, type HistoryItem } from "@/services/api-client"
import { isAuthenticated, isAdvisor, logout, getUser } from "@/services/auth"

export default function AsesorPage() {
  const router = useRouter()
  const [pendientes, setPendientes] = useState<PerfilPendiente[]>([])
  const [enRevision, setEnRevision] = useState<PerfilPendiente[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"pendientes" | "en-revision" | "historial">("pendientes")

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      api.getPendientes().catch(() => []),
      api.getEnRevision().catch(() => []),
      api.getHistory().catch(() => []),
    ])
      .then(([p, r, h]) => {
        setPendientes(p)
        setEnRevision(r)
        setHistory(h)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
    if (!isAdvisor()) {
      router.replace("/")
      return
    }
    fetchData()
  }, [router])

  const handleReclamar = async (profileId: string) => {
    try {
      await api.reclamarPerfil(profileId)
      const profile = pendientes.find((p) => p.id === profileId)
      setPendientes((prev) => prev.filter((p) => p.id !== profileId))
      router.push(`/propuesta?profile_id=${profileId}&profile=${profile?.profile}&from=asesor`)
    } catch {
      alert("Este perfil ya no está disponible")
    }
  }

  const handleContinuar = (profileId: string, profile: string | undefined) => {
    router.push(`/propuesta?profile_id=${profileId}&profile=${profile}&from=asesor`)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
      </div>
    )
  }

  const tabs = [
    { id: "pendientes", label: "Pendientes", count: pendientes.length } as const,
    { id: "en-revision", label: "En revisión", count: enRevision.length } as const,
    { id: "historial", label: "Historial", count: undefined } as const,
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white shadow-md">
              I
            </div>
            <span className="font-bold text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-500 sm:block">
              {getUser()?.display_name || getUser()?.username}
            </span>
            <span className="badge badge-blue text-xs">Asesor</span>
            <button onClick={handleLogout} className="btn-ghost text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Title + tabs */}
        <div className="animate-fade-in-up mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Panel del Asesor</h1>
          <div className="mt-6 flex gap-1 rounded-xl bg-gray-100/80 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-white text-blue-700 shadow-sm shadow-black/5"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                    tab === t.id ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pendientes */}
        {tab === "pendientes" && (
          <>
            {pendientes.length === 0 ? (
              <div className="animate-fade-in-up card-premium py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 ring-1 ring-green-100">
                  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">No hay perfilamientos pendientes</h3>
                <p className="mt-1 text-gray-500">Los nuevos perfilamientos de clientes aparecerán acá.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendientes.map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-fade-in-up card-premium p-6 transition-all hover:shadow-md"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className="badge badge-yellow">Pendiente</span>
                        <div>
                          <p className="font-bold text-gray-900 capitalize">{p.profile}</p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            Cliente: <span className="font-medium text-gray-700">{p.user_name}</span>
                          </p>
                          <p className="text-sm text-gray-400">Puntaje: {p.score}/100</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-gray-400 sm:block">
                          {new Date(p.created_at).toLocaleDateString("es-ES", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <button
                          onClick={() => handleReclamar(p.id)}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          Revisar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* En revisión */}
        {tab === "en-revision" && (
          <>
            {enRevision.length === 0 ? (
              <div className="animate-fade-in-up card-premium py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
                  <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">No tenés perfiles en revisión</h3>
                <p className="mt-1 text-gray-500">Los perfiles que tomes para revisar aparecerán acá.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enRevision.map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-fade-in-up card-premium p-6 transition-all hover:shadow-md"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className="badge badge-blue">En revisión</span>
                        <div>
                          <p className="font-bold text-gray-900 capitalize">{p.profile}</p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            Cliente: <span className="font-medium text-gray-700">{p.user_name}</span>
                          </p>
                          <p className="text-sm text-gray-400">Puntaje: {p.score}/100</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-gray-400 sm:block">
                          {new Date(p.created_at).toLocaleDateString("es-ES", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <button
                          onClick={() => handleContinuar(p.id, p.profile)}
                          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/25"
                        >
                          Continuar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Historial */}
        {tab === "historial" && (
          <>
            {history.length === 0 ? (
              <div className="animate-fade-in-up card-premium py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">No hay decisiones registradas</h3>
                <p className="mt-1 text-gray-500">Cuando revises perfilamientos, aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, i) => {
                  const actionColor =
                    item.action === "aprobado" ? "badge-green" :
                    item.action === "rechazado" ? "badge-red" : "badge-yellow"
                  const actionLabel =
                    item.action === "aprobado" ? "Aprobado" :
                    item.action === "rechazado" ? "Rechazado" : "Editado"

                  return (
                    <div
                      key={item.id}
                      className="animate-fade-in-up card-premium p-6 transition-all hover:shadow-md"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <span className={`badge ${actionColor}`}>
                            {actionLabel}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900">Propuesta #{item.proposal_id}</p>
                            <p className="mt-0.5 text-sm text-gray-500">
                              Perfil: {item.profile} · Reglas v{item.rules_version}
                            </p>
                          </div>
                        </div>
                        <span className="whitespace-nowrap text-sm text-gray-400">
                          {new Date(item.decided_at).toLocaleDateString("es-ES", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {item.comments && (
                        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 ring-1 ring-gray-100">
                          {item.comments}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
