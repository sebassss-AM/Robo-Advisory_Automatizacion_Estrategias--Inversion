"use client"

import { useState } from "react"
import { api, type QuestionnaireAnswers } from "@/services/api-client"

interface Question {
  key: keyof QuestionnaireAnswers
  label: string
  type: "number" | "select" | "range"
  options?: { value: string; label: string }[]
  min?: number
  max?: number
}

const questions: Question[] = [
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

interface RiskQuestionnaireProps {
  onComplete: (profileId: string) => void
}

export default function RiskQuestionnaire({ onComplete }: RiskQuestionnaireProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    age: "",
    investment_horizon: "",
    risk_tolerance: "",
    goal: "",
    monthly_income: "",
    investment_experience: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const q = questions[step]

  const handleChange = (key: keyof QuestionnaireAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    const value = answers[q.key]
    return value !== "" && value !== undefined
  }

  const handleNext = () => {
    if (!canProceed()) return
    if (step < questions.length - 1) {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await api.submitQuestionnaire(answers)
      onComplete(result.profile_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el cuestionario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Paso {step + 1} de {questions.length}</span>
          <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="min-h-[200px]">
        <label className="text-lg font-medium text-gray-900">{q.label}</label>

        {q.type === "number" && (
          <input
            type="number"
            value={answers[q.key]}
            onChange={(e) => handleChange(q.key, e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
            placeholder="Ingresa tu respuesta"
          />
        )}

        {q.type === "select" && q.options && (
          <div className="mt-3 space-y-2">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange(q.key, opt.value)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  answers[q.key] === opt.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {q.type === "range" && (
          <div className="mt-3">
            <input
              type="range"
              min={q.min}
              max={q.max}
              value={answers[q.key] || q.min}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              <span>{q.min}</span>
              <span className="font-medium text-blue-600">{answers[q.key] || q.min}</span>
              <span>{q.max}</span>
            </div>
          </div>
        )}
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
        <div className="ml-auto">
          {step < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Ver mi perfil"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
