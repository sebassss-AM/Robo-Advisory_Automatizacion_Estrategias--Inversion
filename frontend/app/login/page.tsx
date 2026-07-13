"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/services/auth"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(username, password)
      router.push(result.user.role === "asesor" ? "/asesor" : "/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="animate-scale-in w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100">
        <div className="mb-8 text-center">
          <a href="/" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold text-white shadow-lg shadow-blue-600/20">
            I
          </a>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Iniciar Sesión
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Ingresá con tu usuario y contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-premium w-full"
              placeholder="Tu usuario"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium w-full"
              placeholder="Tu contraseña"
            />
          </div>

          {error && (
            <div className="animate-fade-in rounded-xl bg-red-50 p-3.5 text-center text-sm font-medium text-red-700 ring-1 ring-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="btn-primary w-full py-3.5 text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Ingresando...
              </span>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          ¿No tenés cuenta?{" "}
          <a href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Registrate
          </a>
        </p>
      </div>
    </div>
  )
}
