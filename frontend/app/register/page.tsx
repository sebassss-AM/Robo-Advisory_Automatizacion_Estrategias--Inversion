"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { register } from "@/services/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState<"cliente" | "asesor">("cliente")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      const result = await register(username, password, displayName || undefined, role)
      router.push(result.user.role === "asesor" ? "/asesor" : "/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            I
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Crear Cuenta
          </h1>
           <p className="mt-1 text-sm text-gray-500">
              Completá tus datos para empezar
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de cuenta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("cliente")}
                className={`rounded-xl border p-3 text-sm font-medium transition ${
                  role === "cliente"
                    ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => setRole("asesor")}
                className={`rounded-xl border p-3 text-sm font-medium transition ${
                  role === "asesor"
                    ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                Asesor
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Min. 3 caracteres"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre visible (opcional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Min. 4 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Repetí la contraseña"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tenés cuenta?{" "}
          <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  )
}
