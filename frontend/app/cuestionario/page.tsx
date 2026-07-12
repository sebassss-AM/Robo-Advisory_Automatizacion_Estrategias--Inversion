"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import RiskQuestionnaire from "@/components/RiskQuestionnaire"
import type { ProfileResult } from "@/services/api-client"
import { isAuthenticated, isAdvisor, logout } from "@/services/auth"

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
    } else {
      router.push("/mis-perfilamientos")
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              I
            </div>
            <span className="font-bold text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Perfilamiento de Riesgo</span>
            <button onClick={handleLogout} className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Conoce tu perfil de inversionista
          </h1>
          <p className="mt-2 text-gray-600">
            Responde estas preguntas para que podamos recomendarte una asignación de activos
            adecuada a tus necesidades.
          </p>
        </div>

        <div className="rounded-2xl border bg-surface p-8">
          <RiskQuestionnaire onComplete={handleComplete} />
        </div>
      </main>
    </div>
  )
}
