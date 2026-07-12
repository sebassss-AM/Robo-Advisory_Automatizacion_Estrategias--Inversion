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
            <span className="text-sm text-gray-500">{getUser()?.display_name || getUser()?.username}</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Asesor</span>
            <button onClick={handleLogout} className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Cerrar sesión
            </button>
            <a
              href="/cuestionario"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Nuevo perfilamiento
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Panel del Asesor</h1>
          <div className="flex rounded-lg border">
            <button
              onClick={() => setTab("pendientes")}
              className={`px-4 py-2 text-sm font-medium ${tab === "pendientes" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Pendientes ({pendientes.length})
            </button>
            <button
              onClick={() => setTab("en-revision")}
              className={`px-4 py-2 text-sm font-medium ${tab === "en-revision" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              En revisión ({enRevision.length})
            </button>
            <button
              onClick={() => setTab("historial")}
              className={`px-4 py-2 text-sm font-medium ${tab === "historial" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Historial
            </button>
          </div>
        </div>

        {tab === "pendientes" && (
          <>
            {pendientes.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
                <h3 className="text-lg font-semibold text-gray-900">No hay perfilamientos pendientes</h3>
                <p className="mt-1 text-gray-500">Los nuevos perfilamientos de clientes aparecerán acá.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendientes.map((p) => (
                  <div key={p.id} className="rounded-2xl border bg-surface p-6 transition hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Pendiente</span>
                          <span className="font-semibold text-gray-900 capitalize">{p.profile}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Cliente: <span className="font-medium text-gray-700">{p.user_name}</span>
                        </p>
                        <p className="text-sm text-gray-500">Puntaje: {p.score}/100</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                          {new Date(p.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <button
                          onClick={() => handleReclamar(p.id)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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

        {tab === "en-revision" && (
          <>
            {enRevision.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
                <h3 className="text-lg font-semibold text-gray-900">No tienes perfiles en revisión</h3>
                <p className="mt-1 text-gray-500">Los perfiles que tomes para revisar aparecerán acá.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enRevision.map((p) => (
                  <div key={p.id} className="rounded-2xl border bg-surface p-6 transition hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">En revisión</span>
                          <span className="font-semibold text-gray-900 capitalize">{p.profile}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Cliente: <span className="font-medium text-gray-700">{p.user_name}</span>
                        </p>
                        <p className="text-sm text-gray-500">Puntaje: {p.score}/100</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                          {new Date(p.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <button
                          onClick={() => handleContinuar(p.id, p.profile)}
                          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
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

        {tab === "historial" && (
          <>
            {history.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
                <h3 className="text-lg font-semibold text-gray-900">No hay decisiones registradas</h3>
                <p className="mt-1 text-gray-500">Cuando revises perfilamientos, aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="rounded-2xl border bg-surface p-6 transition hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.action === "aprobado" ? "bg-green-100 text-green-700" : 
                          item.action === "rechazado" ? "bg-red-100 text-red-700" : 
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {item.action === "aprobado" ? "Aprobado" : item.action === "rechazado" ? "Rechazado" : "Editado"}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">Propuesta #{item.proposal_id}</p>
                          <p className="mt-1 text-sm text-gray-500">
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
                      <div className="mt-4 rounded-xl bg-white p-4 text-sm text-gray-700">{item.comments}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
