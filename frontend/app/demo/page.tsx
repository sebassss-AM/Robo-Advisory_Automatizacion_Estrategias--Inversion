"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RiskQuestionnaire from "@/components/RiskQuestionnaire"
import type { ProfileResult } from "@/services/api-client"

export default function DemoPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const onScroll = () => setMenuOpen(false)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [menuOpen])

  const handleComplete = (result: ProfileResult) => {
    router.push(`/propuesta?profile_id=${result.profile_id}&profile=${result.profile}&from=demo`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="relative mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white shadow-md">
              I
            </div>
            <span className="font-bold text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-sm text-gray-500">Demo — Modo exploratorio</span>
              <a href="/register" className="btn-primary text-sm whitespace-nowrap">
                Crear cuenta gratis
              </a>
            </div>
            <div className="sm:hidden flex items-center gap-1">
              <a href="/register" className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">
                Crear cuenta
              </a>
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Menú">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </nav>
        </div>
        {menuOpen && (
          <div className="sm:hidden absolute left-0 right-0 top-full border-b border-gray-100 bg-white shadow-lg animate-fade-in">
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="rounded-lg px-3 py-2.5 text-sm text-gray-500">
                Demo — Modo exploratorio
              </span>
              <a href="/register" onClick={() => setMenuOpen(false)} className="btn-primary justify-center text-sm">
                Crear cuenta gratis
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="animate-fade-in-up mb-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-center text-sm font-medium text-white shadow-lg">
          Estás en modo demo — nada se guarda. Regístrate gratis para guardar tu perfilamiento y recibir asesoría personalizada.
        </div>

        <div className="animate-fade-in-up mb-10">
          <div className="badge badge-blue mb-4 inline-flex">Demo</div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Probá el perfilamiento
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Responde el cuestionario y recibe una propuesta de portafolio generada por nuestro agente financiero de IA.
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
