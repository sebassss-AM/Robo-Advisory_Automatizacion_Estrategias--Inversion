export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100">
          <span className="text-4xl">📊</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Robo-Advisory <span className="text-blue-600">IA</span>
        </h1>
        <p className="mt-4 max-w-md text-lg text-gray-600">
          Asesoría financiera automatizada con agentes de inteligencia artificial.
          Perfilamiento de riesgo, propuestas de portafolio y revisión por asesor autorizado.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="/cuestionario"
            className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
          >
            Iniciar Perfilamiento
          </a>
          <a
            href="/asesor"
            className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Panel del Asesor
          </a>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 text-left">
            <h3 className="font-semibold text-gray-900">Paso 1</h3>
            <p className="mt-1 text-sm text-gray-600">
              Completa el cuestionario de perfilamiento de riesgo
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 text-left">
            <h3 className="font-semibold text-gray-900">Paso 2</h3>
            <p className="mt-1 text-sm text-gray-600">
              Recibe una propuesta de portafolio explicada
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 text-left">
            <h3 className="font-semibold text-gray-900">Paso 3</h3>
            <p className="mt-1 text-sm text-gray-600">
              Un asesor autorizado revisa y aprueba
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
