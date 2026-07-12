"use client"

import { useState } from "react"
import { api, type FormAnswers, type ProfileResult } from "@/services/api-client"

interface Question {
  key: keyof FormAnswers
  label: string
  description?: string
  type: "number" | "select" | "range"
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  placeholder?: string
}

const questions: Question[] = [
  {
    key: "age",
    label: "¿Cuál es tu edad?",
    type: "number",
    placeholder: "Ingresa tu edad",
  },
  {
    key: "investment_horizon",
    label: "¿Cuál es tu horizonte de inversión?",
    description: "¿Por cuánto tiempo planeas mantener tu inversión?",
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
    description: "¿Cómo reaccionarías si tu inversión fluctuara?",
    type: "select",
    options: [
      { value: "baja", label: "Baja - Prefiero seguridad aunque gane menos" },
      { value: "media", label: "Media - Acepto fluctuaciones moderadas" },
      { value: "alta", label: "Alta - Busco máxima rentabilidad posible" },
    ],
  },
  {
    key: "goal",
    label: "¿Cuál es tu objetivo principal?",
    description: "¿Qué buscas lograr con esta inversión?",
    type: "select",
    options: [
      { value: "preservacion_capital", label: "Preservar mi capital" },
      { value: "ingresos", label: "Generar ingresos estables" },
      { value: "crecimiento", label: "Hacer crecer mi dinero" },
      { value: "crecimiento_agresivo", label: "Crecimiento agresivo" },
    ],
  },
  {
    key: "monthly_income",
    label: "¿Cuál es tu ingreso mensual?",
    type: "number",
    placeholder: "Monto en USD",
  },
  {
    key: "investment_experience",
    label: "Nivel de experiencia en inversiones",
    description: "Del 1 al 5, ¿cuánta experiencia tienes?",
    type: "range",
    min: 1,
    max: 5,
  },
]

interface RiskQuestionnaireProps {
  onComplete: (result: ProfileResult) => void
}

export default function RiskQuestionnaire({ onComplete }: RiskQuestionnaireProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<FormAnswers>({
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

  const handleChange = (key: keyof FormAnswers, value: string) => {
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
      const payload = {
        age: parseInt(answers.age) || 0,
        investment_horizon: answers.investment_horizon,
        risk_tolerance: answers.risk_tolerance,
        goal: answers.goal,
        monthly_income: parseFloat(answers.monthly_income) || 0,
        investment_experience: parseInt(answers.investment_experience) || 1,
      }
      const result = await api.submitQuestionnaire(payload)
      onComplete(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el cuestionario")
    } finally {
      setLoading(false)
    }
  }

  const progress = ((step + 1) / questions.length) * 100

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            Pregunta {step + 1} de {questions.length}
          </span>
          <span className="text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-[220px]">
        <label className="text-xl font-bold text-gray-900">{q.label}</label>
        {q.description && (
          <p className="mt-1 text-gray-600">{q.description}</p>
        )}

        <div className="mt-6">
          {q.type === "number" && (
            <input
              type="number"
              value={answers[q.key]}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4 text-lg text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder={q.placeholder}
            />
          )}

          {q.type === "select" && q.options && (
            <div className="space-y-3">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChange(q.key, opt.value)}
                  className={`w-full rounded-xl border p-4 text-left text-base transition ${
                    answers[q.key] === opt.value
                      ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {q.type === "range" && (
            <div className="py-4">
              <input
                type="range"
                min={q.min}
                max={q.max}
                value={answers[q.key] || q.min}
                onChange={(e) => handleChange(q.key, e.target.value)}
                className="w-full accent-blue-600"
              />
              <div className="mt-2 flex items-center justify-between">
                {q.min && <span className="text-sm text-gray-400">{q.min}</span>}
                <span className="rounded-lg bg-blue-100 px-4 py-1 text-lg font-bold text-blue-700">
                  {answers[q.key] || q.min} / {q.max}
                </span>
                {q.max && <span className="text-sm text-gray-400">{q.max}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        {step > 0 ? (
          <button
            onClick={handleBack}
            className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Anterior
          </button>
        ) : (
          <div />
        )}

        {step < questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Analizando..." : "Obtener mi perfil"}
          </button>
        )}
      </div>
    </div>
  )
}
