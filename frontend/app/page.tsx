export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              I
            </div>
            <span className="text-lg font-bold text-gray-900">InversIA</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Acceso Asesores
            </a>
            <a
              href="/cuestionario"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Comenzar
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
              Asesoría Financiera con IA
            </p>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900">
              Tu portafolio de inversión,{" "}
              <span className="text-blue-600">explicado y transparente</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Respondes un cuestionario, la IA analiza tu perfil de riesgo y genera una propuesta
              de portafolio. Un asesor humano revisa y aprueba antes de cualquier acción.
              Sin letra chica, sin promesas falsas.
            </p>
            <div className="mt-10 flex gap-4">
              <a
                href="/cuestionario"
                className="rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
              >
                Iniciar Perfilamiento
              </a>
              <a
                href="#como-funciona"
                className="rounded-xl border bg-white px-8 py-4 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cómo funciona
              </a>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="border-t bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Así funciona
            </h2>
            <p className="mt-3 text-center text-gray-600">
              Tres pasos simples para recibir una propuesta de inversión personalizada
            </p>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border bg-surface p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-600">
                  1
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">Perfilamiento</h3>
                <p className="mt-3 leading-relaxed text-gray-600">
                  Completas un cuestionario sobre tu horizonte, tolerancia al riesgo y objetivos
                  financieros. Todo es transparente y explicado.
                </p>
              </div>
              <div className="rounded-2xl border bg-surface p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-lg font-bold text-green-600">
                  2
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">Propuesta</h3>
                <p className="mt-3 leading-relaxed text-gray-600">
                  La IA genera una distribución de activos ajustada a tu perfil. Cada
                  asignación incluye una explicación clara y métricas de riesgo.
                </p>
              </div>
              <div className="rounded-2xl border bg-surface p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-lg font-bold text-purple-600">
                  3
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">Revisión</h3>
                <p className="mt-3 leading-relaxed text-gray-600">
                  Un asesor de inversiones autorizado revisa, ajusta si es necesario, y
                  aprueba la propuesta. Cada decisión queda registrada.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-surface py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              ¿Listo para comenzar?
            </h2>
            <p className="mt-3 text-gray-600">
              Sin compromiso. Solo un cuestionario y recibirás tu propuesta.
            </p>
            <a
              href="/cuestionario"
              className="mt-8 inline-block rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
            >
              Iniciar Perfilamiento
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500">
          InversIA — Proyecto académico Hackathon Guide Financial Agents IA 2026
        </div>
      </footer>
    </div>
  )
}
