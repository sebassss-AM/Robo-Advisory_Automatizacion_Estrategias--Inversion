"use client"

import { useRouter } from "next/navigation"
import RiskQuestionnaire from "@/components/RiskQuestionnaire"
import type { ProfileResult } from "@/services/api-client"

export default function DemoPage() {
  const router = useRouter()

  const handleComplete = (result: ProfileResult) => {
    router.push(`/propuesta?profile_id=${result.profile_id}&profile=${result.profile}&from=demo`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white shadow-md">
              I
            </div>
            <span className="font-bold text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:block">Demo — Modo exploratorio</span>
            <a href="/register" className="btn-primary text-sm">
              Crear cuenta gratis
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="animate-fade-in-up mb-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-center text-sm font-medium text-white shadow-lg">
          Estás en modo demo — nada se guarda. Registrate gratis para guardar tu perfilamiento y recibir asesoría personalizada.
        </div>

        <div className="animate-fade-in-up mb-10">
          <div className="badge badge-blue mb-4 inline-flex">Demo</div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Probá el perfilamiento
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Respondé el cuestionario y recibí una propuesta de portafolio generada por nuestro agente financiero de IA.
            Sin registro, sin compromiso.
          </p>
        </div>

        <div className="animate-fade-in-up stagger-1 card-premium p-8 lg:p-10">
          <RiskQuestionnaire onComplete={handleComplete} demo />
        </div>
      </main>
    </div>
  )
}
