"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import RiskQuestionnaire from "@/components/RiskQuestionnaire"
import type { ProfileResult } from "@/services/api-client"
import { isAuthenticated, isAdvisor, logout } from "@/services/auth"
import NotificationBell from "@/components/NotificationBell"

export default function CuestionarioPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
    }
  }, [router])

  const handleComplete = (result: ProfileResult) => {
    if (isAdvisor()) {
      router.push(`/propuesta?profile_id=${result.profile_id}&profile=${result.profile}&from=asesor`)
    } else if (result.status === "completado") {
      router.push(`/propuesta?profile_id=${result.profile_id}&profile=${result.profile}`)
    } else {
      router.push("/mis-perfilamientos")
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white shadow-md">
              I
            </div>
            <span className="font-bold text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-2">
            <span className="hidden text-sm text-gray-500 sm:block">Perfilamiento de Riesgo</span>
            <NotificationBell />
            <button onClick={handleLogout} className="btn-ghost text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="animate-fade-in-up mb-10">
          <div className="badge badge-blue mb-4 inline-flex">Cuestionario</div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Conoce tu perfil de inversionista
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Respondé estas preguntas para que podamos recomendarte una asignación de activos
            adecuada a tus necesidades.
          </p>
        </div>

        <div className="animate-fade-in-up stagger-1 card-premium p-8 lg:p-10">
          <RiskQuestionnaire onComplete={handleComplete} />
        </div>
      </main>
    </div>
  )
}
