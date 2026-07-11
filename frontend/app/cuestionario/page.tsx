"use client"

import { useState } from "react"

export default function CuestionarioPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    age: "",
    investment_horizon: "",
    risk_tolerance: "",
    goal: "",
    monthly_income: "",
    investment_experience: "",
  })

  const questions = [
    { key: "age", label: "¿Cuál es tu edad?", type: "number" },
    {
      key: "investment_horizon",
      label: "¿Cuál es tu horizonte de inversión?",
      type: "select",
      options: [
        { value: "corto_plazo", label: "Menos de 3 años" },
        { value: "mediano_plazo", label: "3 a 7 años" },
        { value: "largo_plazo", label: "Más de 7 años" },
      ],
    },
    {
      key: "risk_tolerance",
      label: "¿Cómo describirías tu tolerancia al riesgo?",
      type: "select",
      options: [
        { value: "baja", label: "Baja — prefiero seguridad" },
        { value: "media", label: "Media — acepto fluctuaciones moderadas" },
        { value: "alta", label: "Alta — busco máxima rentabilidad" },
      ],
    },
    {
      key: "goal",
      label: "¿Cuál es tu objetivo principal?",
      type: "select",
      options: [
        { value: "preservacion_capital", label: "Preservar mi capital" },
        { value: "ingresos", label: "Generar ingresos estables" },
        { value: "crecimiento", label: "Hacer crecer mi dinero" },
        { value: "crecimiento_agresivo", label: "Crecimiento agresivo" },
      ],
    },
    { key: "monthly_income", label: "¿Cuál es tu ingreso mensual (USD)?", type: "number" },
    {
      key: "investment_experience",
      label: "Nivel de experiencia en inversiones (1-5)",
      type: "range",
      min: 1,
      max: 5,
    },
  ]

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      })
      const data = await res.json()
      if (data.profile_id) {
        window.location.href = `/propuesta?profile_id=${data.profile_id}`
      }
    } catch {
      alert("Error al enviar el cuestionario")
    }
  }

  const q = questions[step]

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900">Perfilamiento de Riesgo</h1>
        <p className="mt-2 text-gray-600">
          Paso {step + 1} de {questions.length}
        </p>

        <div className="mt-8">
          <label className="block text-lg font-medium text-gray-800">{q.label}</label>
          {q.type === "number" || q.type === "text" ? (
            <input
              type={q.type}
              value={answers[q.key as keyof typeof answers]}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="mt-2 w-full rounded-lg border p-3 text-gray-900"
            />
          ) : q.type === "select" ? (
            <select
              value={answers[q.key as keyof typeof answers]}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="mt-2 w-full rounded-lg border p-3 text-gray-900"
            >
              <option value="">Selecciona una opción</option>
              {q.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : q.type === "range" ? (
            <div className="mt-2">
              <input
                type="range"
                min={q.min}
                max={q.max}
                value={answers[q.key as keyof typeof answers]}
                onChange={(e) => handleChange(q.key, e.target.value)}
                className="w-full"
              />
              <p className="text-center text-sm text-gray-500">
                {answers[q.key as keyof typeof answers] || q.min} / {q.max}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex justify-between">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-100"
            >
              Anterior
            </button>
          )}
          {step < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="ml-auto rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="ml-auto rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
            >
              Ver mi perfil
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
