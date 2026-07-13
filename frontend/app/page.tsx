"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthUser } from "@/services/auth"

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    import("@/services/auth").then((m) => {
      setUser(m.getUser())
    })
  }, [])

  const loggedIn = !!user
  const advisor = user?.role === "asesor"

  const handleLogout = () => {
    import("@/services/auth").then((m) => {
      m.logout()
      setUser(null)
      router.push("/")
    })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navbar */}
      <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-md">
              I
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-3">
            {advisor ? (
              <>
                <a href="/asesor" className="btn-ghost text-sm">Panel Asesor</a>
                <button onClick={handleLogout} className="btn-ghost text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
                  Cerrar sesión
                </button>
              </>
            ) : loggedIn ? (
              <>
                <a href="/mis-perfilamientos" className="btn-ghost text-sm">Mis Perfilamientos</a>
                <button onClick={handleLogout} className="btn-ghost text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div />
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
          <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBtLTIgMGEyIDIgMCAxIDAgNCAwIDIgMiAwIDAgMC00IDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
          <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-24 lg:pt-32">
            <div className="max-w-3xl">
              <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-1.5 text-sm font-medium text-blue-200">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse-soft" />
                Asesoría Financiera con IA
              </div>
              <h1 className="animate-fade-in-up stagger-1 text-5xl font-extrabold leading-tight tracking-tight text-white lg:text-6xl">
                Tu portafolio de inversión,{" "}
                <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-violet-200 bg-clip-text text-transparent">
                  explicado y transparente
                </span>
              </h1>
              <p className="animate-fade-in-up stagger-2 mt-6 max-w-xl text-lg leading-relaxed text-blue-200/80">
                Respondés un cuestionario, la IA analiza tu perfil de riesgo y genera una propuesta
                de portafolio. Si querés, un asesor humano la revisa y aprueba. Sin letra chica,
                sin promesas falsas.
              </p>
              <div className="animate-fade-in-up stagger-3 mt-10 flex flex-wrap gap-4">
                {advisor ? (
                  <>
                    <a href="/cuestionario" className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl shadow-black/10 transition hover:bg-blue-50 hover:shadow-2xl">
                      Nuevo Perfilamiento
                    </a>
                    <a href="/asesor" className="rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                      Ir al Panel de Asesor
                    </a>
                  </>
                ) : loggedIn ? (
                  <a href="/cuestionario" className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl shadow-black/10 transition hover:bg-blue-50 hover:shadow-2xl">
                    Iniciar Perfilamiento
                  </a>
                ) : (
                  <>
                    <a href="/register" className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-xl shadow-black/10 transition hover:bg-blue-50 hover:shadow-2xl">
                      Crear Cuenta Gratis
                    </a>
                    <a href="/login" className="rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                      Ya tengo cuenta
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Curved separator */}
          <div className="relative h-16 bg-[#f8fafc]">
            <div className="absolute -top-px left-0 right-0 h-16 bg-[#f8fafc]" style={{ borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }} />
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-gray-100 px-6 py-8">
            {[
              { value: "IA", label: "Análisis inteligente" },
              { value: "7", label: "Activos financieros" },
              { value: "100%", label: "Transparencia" },
            ].map((stat, i) => (
              <div key={i} className="animate-fade-in-up px-8 text-center" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                <p className="gradient-text text-2xl font-extrabold">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="badge badge-blue mb-4">Cómo funciona</span>
              {advisor ? (
                <>
                  <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Tu rol como asesor
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Revisá perfiles, analizá propuestas y aprobá o rechazá asignaciones.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Tres pasos simples
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Completá el cuestionario, recibí tu propuesta, un asesor la revisa.
                  </p>
                </>
              )}
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {advisor ? (
                <>
                  {[
                    {
                      num: "01",
                      title: "Revisar perfiles",
                      desc: "Ves los perfilamientos pendientes de los clientes y elegís cuáles tomar para revisión.",
                      gradient: "from-blue-500 to-blue-600",
                      badge: "Pendientes",
                    },
                    {
                      num: "02",
                      title: "Analizar propuesta",
                      desc: "Accedés a la distribución de activos, métricas de riesgo y podés editar porcentajes si hace falta.",
                      gradient: "from-emerald-500 to-emerald-600",
                      badge: "Propuesta",
                    },
                    {
                      num: "03",
                      title: "Decidir",
                      desc: "Aprobás, rechazás o editás la asignación. Cada decisión queda registrada con tu ID.",
                      gradient: "from-violet-500 to-violet-600",
                      badge: "Aprobar / Rechazar",
                    },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="animate-fade-in-up card-premium group relative overflow-hidden p-8"
                      style={{ animationDelay: `${0.4 + i * 0.15}s` }}
                    >
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-5" />
                      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} text-lg font-bold text-white shadow-lg`}>
                        {step.num}
                      </span>
                      <span className="badge badge-blue ml-3 align-middle">{step.badge}</span>
                      <h3 className="mt-5 text-xl font-bold text-gray-900">{step.title}</h3>
                      <p className="mt-3 leading-relaxed text-gray-500">{step.desc}</p>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    {
                      num: "01",
                      title: "Perfilamiento",
                      desc: "Completás un cuestionario sobre tu horizonte, tolerancia al riesgo y objetivos financieros.",
                      gradient: "from-blue-500 to-blue-600",
                      badge: "Cuestionario",
                    },
                    {
                      num: "02",
                      title: "Propuesta",
                      desc: "La IA genera una distribución de activos ajustada a tu perfil con métricas de riesgo claras.",
                      gradient: "from-emerald-500 to-emerald-600",
                      badge: "Análisis IA",
                    },
                    {
                      num: "03",
                      title: "Revisión",
                      desc: "Vos decidís: recibí tu propuesta directo o deja que un asesor autorizado la revise y apruebe.",
                      gradient: "from-violet-500 to-violet-600",
                      badge: "Opcional",
                    },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="animate-fade-in-up card-premium group relative overflow-hidden p-8"
                      style={{ animationDelay: `${0.4 + i * 0.15}s` }}
                    >
                      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-5" />
                      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} text-lg font-bold text-white shadow-lg`}>
                        {step.num}
                      </span>
                      <span className="badge badge-blue ml-3 align-middle">{step.badge}</span>
                      <h3 className="mt-5 text-xl font-bold text-gray-900">{step.title}</h3>
                      <p className="mt-3 leading-relaxed text-gray-500">{step.desc}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-400">
          <p>InversIA — creado por el grupo Vision Coders</p>
        </div>
      </footer>
    </div>
  )
}
