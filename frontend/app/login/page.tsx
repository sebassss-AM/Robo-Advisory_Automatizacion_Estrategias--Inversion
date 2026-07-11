"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/services/auth"

export default function LoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (login(pin)) {
      router.push("/asesor")
    } else {
      setError("PIN incorrecto")
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
            Acceso Asesores
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ingresá tu PIN para acceder al panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              PIN de asesor
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 p-4 text-center text-2xl tracking-widest outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="****"
              maxLength={4}
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length !== 4}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            Ingresar
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Demo — PIN: 1234
        </p>
      </div>
    </div>
  )
}
