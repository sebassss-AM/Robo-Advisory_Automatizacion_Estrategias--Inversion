"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthUser } from "@/services/auth"
import NotificationBell from "@/components/NotificationBell"

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs sm:text-sm font-bold text-white shadow-md">
              I
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">InversIA</span>
          </a>
          <nav className="flex items-center gap-1 sm:gap-3 min-h-[36px]">
            {advisor ? (
              <>
                <a href="/asesor" className="btn-ghost text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Panel</a>
                <button onClick={handleLogout} className="btn-ghost text-xs sm:text-sm text-red-600 hover:bg-red-50 hover:text-red-700 px-2 sm:px-3 whitespace-nowrap">
                  Salir
                </button>
              </>
            ) : loggedIn ? (
              <>
                <a href="/dashboard" className="btn-ghost text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">Dashboard</a>
                <NotificationBell />
                <button onClick={handleLogout} className="btn-ghost text-xs sm:text-sm text-red-600 hover:bg-red-50 hover:text-red-700 px-2 sm:px-3 whitespace-nowrap">
                  Salir
                </button>
              </>
            ) : (
              <>
                <a href="#el-problema" className="hidden sm:inline-flex btn-ghost text-xs sm:text-sm whitespace-nowrap">El problema</a>
                <a href="#funcionalidades" className="hidden sm:inline-flex btn-ghost text-xs sm:text-sm whitespace-nowrap">Funcionalidades</a>
                <a href="#como-funciona" className="hidden sm:inline-flex btn-ghost text-xs sm:text-sm whitespace-nowrap">Cómo funciona</a>
                <a href="/demo" className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap">Demo</a>
              </>
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

          <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-20 sm:pt-24 lg:pt-32">
            <div className="max-w-3xl">
              <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-200">
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-400 animate-pulse-soft" />
                {advisor ? "Panel de Asesor Financiero" : "Asesoría Financiera con IA · 100% Gratis"}
              </div>
              <h1 className="animate-fade-in-up stagger-1 text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white lg:text-6xl">
                {advisor ? (
                  <>Gestiona perfiles de clientes con{" "}
                    <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-violet-200 bg-clip-text text-transparent">
                      asistencia de IA
                    </span>
                  </>
                ) : (
                  <>Inversiones inteligentes al alcance de{" "}
                    <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-violet-200 bg-clip-text text-transparent">
                      todos
                    </span>
                  </>
                )}
              </h1>
              <p className="animate-fade-in-up stagger-2 mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-blue-200/80">
                {advisor ? (
                  <>Revisa perfilamientos, analiza propuestas y aprueba o rechaza asignaciones de forma ágil con datos de mercado reales. <strong className="text-blue-200">100% gratis, sin comisiones.</strong></>
                ) : (
                  <>InversIA combina un agente financiero de IA con supervisión humana. Crea tu perfil de riesgo, recibe una propuesta personalizada y, si quieres, un asesor autorizado la revisa. <strong className="text-blue-200">100% gratis, sin comisiones ocultas.</strong></>
                )}
              </p>
              {!advisor && !loggedIn && (
                <p className="animate-fade-in-up stagger-2 mt-3 text-sm text-blue-300/70">
                  ¿Eres asesor financiero? También puedes registrarte y usar InversIA para gestionar perfiles de clientes.
                </p>
              )}
              <div className="animate-fade-in-up stagger-3 mt-10 flex flex-wrap gap-3">
                {advisor ? (
                  <>
                    <a href="/cuestionario" className="w-full sm:w-auto text-center rounded-xl bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-slate-900 shadow-xl shadow-black/10 transition hover:bg-blue-50 hover:shadow-2xl">
                      Nuevo Perfilamiento
                    </a>
                    <a href="/asesor" className="w-full sm:w-auto text-center rounded-xl border border-white/20 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10">
                      Ir al Panel de Asesor
                    </a>
                  </>
                ) : loggedIn ? (
                  <a href="/cuestionario" className="w-full sm:w-auto text-center rounded-xl bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-slate-900 shadow-xl shadow-black/10 transition hover:bg-blue-50 hover:shadow-2xl">
                    Iniciar Perfilamiento
                  </a>
                ) : (
                  <>
                    <a href="/demo" className="w-full sm:w-auto text-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-xl shadow-black/10 transition hover:from-amber-600 hover:to-orange-600 hover:shadow-2xl">
                      Probar demo gratis
                    </a>
                    <a href="/register" className="w-full sm:w-auto text-center rounded-xl bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-slate-900 shadow-xl shadow-black/10 transition hover:bg-blue-50 hover:shadow-2xl">
                      Crear Cuenta Gratis
                    </a>
                    <a href="/login" className="w-full sm:w-auto text-center rounded-xl border border-white/20 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10">
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

        {/* Problem */}
        <section id="el-problema" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="badge badge-red mb-4">El problema</span>
              {advisor ? (
                <>
                  <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Los clientes esperan más de lo que puedes darles solo
                  </h2>
                  <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                    Gestionar múltiples clientes, analizar sus perfiles y generar propuestas personalizadas
                    consume tiempo que podrías dedicar a lo que importa. <strong className="text-gray-700">InversIA te da las herramientas para escalar tu trabajo sin perder calidad.</strong>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Invertir no debería ser solo para expertos
                  </h2>
                  <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                    La industria financiera tiene dos problemas: los inversores no encuentran herramientas accesibles
                    y los asesores no tienen plataformas modernas para escalar su trabajo. <strong className="text-gray-700">InversIA une ambos mundos: un agente financiero de IA para los inversores y un panel de gestión para asesores. Todo gratis.</strong>
                  </p>
                </>
              )}
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {(advisor ? [
                {
                  title: "Clientes sin atender",
                  desc: "Muchos inversores minoristas quedan fuera porque los asesores no tienen capacidad para atenderlos a todos con el nivel de detalle que merecen.",
                  icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                },
                {
                  title: "Proceso manual y lento",
                  desc: "Crear perfiles de riesgo, armar distribuciones y buscar datos de mercado para cada cliente es tedioso y propenso a errores.",
                  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                },
                {
                  title: "Falta de herramientas",
                  desc: "Sin una plataforma unificada, es difícil hacer seguimiento, mantener un historial de decisiones y dar transparencia real a los clientes.",
                  icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                },
              ] : [
                {
                  title: "Falta de acceso",
                  desc: "Los asesores financieros privados tienen costos elevados que los hacen inaccesibles para la mayoría de las personas.",
                  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                },
                {
                  title: "Falta de transparencia",
                  desc: "Muchas plataformas no explican claramente en qué se invierte, cuáles son los riesgos ni cómo se toman las decisiones.",
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                },
                {
                  title: "Complejidad innecesaria",
                  desc: "Entre ETFs, bonos, acciones, comisiones y plazos, es fácil sentirse abrumado sin una guía clara y honesta.",
                  icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                },
              ]).map((item, i) => (
                <div
                  key={i}
                  className="animate-fade-in-up card-premium p-8"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
                    <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="funcionalidades" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="badge badge-green mb-4">Funcionalidades</span>
              {advisor ? (
                <>
                  <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Todo lo que necesitas como asesor
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Gestiona clientes, revisa propuestas y toma decisiones informadas con datos de mercado reales.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Todo lo que necesitas para invertir con confianza
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Una plataforma completamente gratuita que combina inteligencia artificial con supervisión humana.
                  </p>
                </>
              )}
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(advisor ? [
                {
                  title: "Panel de revisión unificado",
                  desc: "Todos los perfilamientos pendientes, en revisión e historial en un solo lugar. Segmentado y ordenado para que no pierdas tiempo.",
                  gradient: "from-blue-500 to-blue-600",
                  icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                },
                {
                  title: "Perfilamiento automático con IA",
                  desc: "Cada cliente completa un cuestionario y la IA genera su perfil de riesgo al instante. No necesitas hacer entrevistas manuales.",
                  gradient: "from-emerald-500 to-emerald-600",
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                },
                {
                  title: "Propuestas con datos reales",
                  desc: "Cada propuesta incluye datos actualizados de Yahoo Finance: precio, P/E, dividendos y rendimiento de 7 ETFs.",
                  gradient: "from-amber-500 to-amber-600",
                  icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
                },
                {
                  title: "Edición y aprobación flexible",
                  desc: "Puedes ajustar los porcentajes de cada activo, agregar comentarios y aprobar o rechazar con un clic. Todo queda auditado.",
                  gradient: "from-violet-500 to-violet-600",
                  icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                },
                {
                  title: "Historial de decisiones",
                  desc: "Cada aprobación, edición o rechazo queda registrado con tu ID y timestamp. Auditoría completa para cumplimiento regulatorio.",
                  gradient: "from-rose-500 to-rose-600",
                  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
                },
                {
                  title: "Sin costos ni planes",
                  desc: "La plataforma es completamente gratuita. No hay suscripciones, comisiones ni cargos ocultos para asesores ni clientes.",
                  gradient: "from-cyan-500 to-cyan-600",
                  icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                },
              ] : [
                {
                  title: "Agente financiero de IA",
                  desc: "Un agente de IA especializado analiza tus respuestas —tolerancia al riesgo, horizonte, ingresos y objetivos— y construye un perfil de inversionista completo y personalizado.",
                  gradient: "from-blue-500 to-blue-600",
                  icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                },
                {
                  title: "Datos de mercado reales",
                  desc: "Cada propuesta usa información actualizada de Yahoo Finance: precios, rendimientos, P/E y dividendos de 7 activos financieros.",
                  gradient: "from-emerald-500 to-emerald-600",
                  icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
                },
                {
                  title: "Proyecciones claras",
                  desc: "Ves cuánto podrías tener en 1, 5 y 10 años con aportes mensuales. Sin fórmulas ocultas, todo explicado.",
                  gradient: "from-amber-500 to-amber-600",
                  icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
                },
                {
                  title: "Distribución personalizada",
                  desc: "Cada activo tiene un porcentaje ajustado a tu perfil, con su retorno estimado y el monto que vas a invertir en cada uno.",
                  gradient: "from-violet-500 to-violet-600",
                  icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z",
                },
                {
                  title: "Para inversores y asesores",
                  desc: "Los inversores obtienen propuestas con IA. Los asesores tienen un panel profesional para revisar, editar y aprobar perfiles de sus clientes con auditoría completa.",
                  gradient: "from-rose-500 to-rose-600",
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                },
                {
                  title: "Sin comisiones ocultas",
                  desc: "Sin letra chica, sin costos escondidos. Todo el proceso es transparente y cada decisión queda registrada con auditoría completa.",
                  gradient: "from-cyan-500 to-cyan-600",
                  icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                },
              ]).map((feature, i) => (
                <div
                  key={i}
                  className="animate-fade-in-up card-premium p-6 transition-all hover:shadow-md"
                  style={{ animationDelay: `${0.3 + i * 0.08}s` }}
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-md`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="badge badge-blue mb-4">Cómo funciona</span>
              {advisor ? (
                <>
                  <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Tu rol como asesor
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Revisa perfiles, analiza propuestas y aprueba o rechaza asignaciones.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Tres pasos simples
                  </h2>
                  <p className="mt-4 text-lg text-gray-500">
                    Completa el cuestionario, recibe tu propuesta, un asesor la revisa.
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
                      desc: "Ves los perfilamientos pendientes de los clientes y eliges cuáles tomar para revisión.",
                      gradient: "from-blue-500 to-blue-600",
                      badge: "Pendientes",
                    },
                    {
                      num: "02",
                      title: "Analizar propuesta",
                      desc: "Accedes a la distribución de activos, métricas de riesgo y puedes editar porcentajes si hace falta.",
                      gradient: "from-emerald-500 to-emerald-600",
                      badge: "Propuesta",
                    },
                    {
                      num: "03",
                      title: "Decidir",
                      desc: "Apruebas, rechazas o editas la asignación. Cada decisión queda registrada con tu ID.",
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
                      desc: "Completas un cuestionario sobre tu horizonte, tolerancia al riesgo y objetivos financieros.",
                      gradient: "from-blue-500 to-blue-600",
                      badge: "Cuestionario",
                    },
                    {
                      num: "02",
                      title: "Propuesta",
                      desc: "El agente financiero de IA genera una distribución de activos ajustada a tu perfil con métricas de riesgo claras y datos de mercado reales.",
                      gradient: "from-emerald-500 to-emerald-600",
                      badge: "Análisis IA",
                    },
                    {
                      num: "03",
                      title: "Revisión",
                      desc: "Tú decides: recibe tu propuesta directo o deja que un asesor autorizado la revise y apruebe.",
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
