export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-gray-900">
        Robo-Advisory IA
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Asesoría financiera automatizada con agentes de inteligencia artificial
      </p>
      <div className="mt-8 flex gap-4">
        <a
          href="/cuestionario"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Iniciar Perfilamiento
        </a>
        <a
          href="/asesor"
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          Panel del Asesor
        </a>
      </div>
    </main>
  )
}
