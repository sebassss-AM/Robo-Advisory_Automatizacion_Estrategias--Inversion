"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type MisPerfilamientoItem } from "@/services/api-client"
import { getUser, logout } from "@/services/auth"
import type { AuthUser } from "@/services/auth"
import NotificationBell from "@/components/NotificationBell"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profiles, setProfiles] = useState<MisPerfilamientoItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = getUser()
    if (!u) {
      router.replace("/login")
      return
    }
    setUser(u)
    if (u.role === "asesor") {
      router.replace("/asesor")
      return
    }
    api.getMisPerfilamientos().then((data) => {
      setProfiles(data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [router])

  const activeProfiles = profiles.filter((p) => p.status !== "completado")
  const completedProfiles = profiles.filter((p) => p.status === "completado" && p.action === "aprobado")

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-md">
              I
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-1 sm:gap-3 min-h-[36px]">
            <a href="/dashboard" className="btn-ghost text-sm font-semibold text-blue-600">Dashboard</a>
            <a href="/mis-perfilamientos" className="btn-ghost text-sm">Mis Perfilamientos</a>
            <NotificationBell />
            <button onClick={handleLogout} className="btn-ghost text-sm text-red-600 hover:bg-red-50 hover:text-red-700 ml-1">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="animate-fade-in-up mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Hola, {user?.display_name || user?.username}
          </h1>
          <p className="mt-2 text-gray-500">Resumen de tu actividad financiera</p>
        </div>

        {/* Stats */}
        <div className="animate-fade-in-up grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card-premium p-5">
            <p className="text-sm text-gray-500">Perfilamientos</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-900">{profiles.length}</p>
          </div>
          <div className="card-premium p-5">
            <p className="text-sm text-gray-500">En proceso</p>
            <p className="mt-1 text-3xl font-extrabold text-amber-600">{activeProfiles.length}</p>
          </div>
          <div className="card-premium p-5">
            <p className="text-sm text-gray-500">Aprobados</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-600">{completedProfiles.length}</p>
          </div>
          <div className="card-premium p-5">
            <p className="text-sm text-gray-500">Perfil actual</p>
            <p className="mt-1 text-3xl font-extrabold capitalize text-blue-600">
              {profiles.length > 0 ? profiles[0].profile : "—"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="animate-fade-in-up mt-10 flex flex-wrap gap-4">
          <a
            href="/cuestionario"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo perfilamiento
          </a>
          <a
            href="/mis-perfilamientos"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver historial
          </a>
        </div>

        {/* Recent profiles */}
        <section className="animate-fade-in-up mt-14">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Actividad reciente</h2>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="card-premium flex flex-col items-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">Aún no tienes perfilamientos</h3>
              <p className="mt-2 text-sm text-gray-500">Completa el cuestionario para recibir tu primera propuesta de inversión.</p>
              <a href="/cuestionario" className="btn-primary mt-6 px-6 py-2.5 text-sm">
                Iniciar perfilamiento
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.slice(0, 5).map((p) => (
                <div key={p.id} className="card-premium flex items-center justify-between p-4 transition hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white text-sm ${
                      p.profile === "conservador" ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                      p.profile === "moderado" ? "bg-gradient-to-br from-amber-500 to-amber-600" :
                      "bg-gradient-to-br from-red-500 to-rose-600"
                    }`}>
                      {p.profile === "conservador" ? "C" : p.profile === "moderado" ? "M" : "A"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">{p.profile}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(p.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${
                      p.status === "completado" ? "badge-green" :
                      p.status === "en_revision" ? "badge-blue" :
                      "badge-amber"
                    }`}>
                      {p.status === "completado" ? (p.action === "aprobado" ? "Aprobado" : p.action === "rechazado" ? "Rechazado" : "Completado") :
                       p.status === "en_revision" ? "En revisión" :
                       p.status === "pendiente" && !p.requires_review ? "Sin revisión" :
                       "Pendiente"}
                    </span>
                    <a
                      href={`/propuesta?profile_id=${p.id}`}
                      className="btn-ghost text-sm"
                    >
                      Ver propuesta
                    </a>
                  </div>
                </div>
              ))}
              {profiles.length > 5 && (
                <a href="/mis-perfilamientos" className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 pt-2">
                  Ver todos ({profiles.length})
                </a>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
