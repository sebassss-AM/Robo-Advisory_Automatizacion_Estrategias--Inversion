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
      { value: "baja", label: "Baja — Prefiero seguridad aunque gane menos" },
      { value: "media", label: "Media — Acepto fluctuaciones moderadas" },
      { value: "alta", label: "Alta — Busco máxima rentabilidad posible" },
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
    description: "Esto nos ayuda a evaluar tu capacidad financiera.",
    type: "number",
    placeholder: "Monto en USD",
  },
  {
    key: "monthly_investment",
    label: "¿Cuánto podrías destinar a invertir por mes?",
    description: "No es necesario que sea todo tu ingreso. Solo lo que puedas comprometer.",
    type: "number",
    placeholder: "Ej: 200",
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
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [answers, setAnswers] = useState<FormAnswers>({
    age: "",
    investment_horizon: "",
    risk_tolerance: "",
    goal: "",
    monthly_income: "",
    monthly_investment: "",
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
    setDirection("next")
    if (step < questions.length - 1) {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setDirection("prev")
      setStep((s) => s - 1)
    }
  }

  const [requiresReview, setRequiresReview] = useState(true)

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      const monthlyInvest = parseFloat(answers.monthly_investment) || 0
      const payload = {
        age: parseInt(answers.age) || 0,
        investment_horizon: answers.investment_horizon,
        risk_tolerance: answers.risk_tolerance,
        goal: answers.goal,
        monthly_income: parseFloat(answers.monthly_income) || 0,
        monthly_investment: monthlyInvest,
        investment_experience: parseInt(answers.investment_experience) || 1,
        requires_review: requiresReview,
      }
      localStorage.setItem("inversia_monthly_investment", String(monthlyInvest))
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
        <div className="animate-fade-in mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </div>
      )}

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-500">
            Paso {step + 1} de {questions.length}
          </span>
          <span className="font-semibold text-blue-600">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div
        key={step}
        className="animate-fade-in-up min-h-[240px]"
      >
        <div className="mb-2">
          <label className="text-2xl font-bold text-gray-900">{q.label}</label>
        </div>
        {q.description && (
          <p className="text-gray-500">{q.description}</p>
        )}

        <div className="mt-8">
          {q.type === "number" && (
            <input
              type="number"
              value={answers[q.key]}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="input-premium w-full text-lg"
              placeholder={q.placeholder}
              autoFocus
            />
          )}

          {q.type === "select" && q.options && (
            <div className="space-y-3">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChange(q.key, opt.value)}
                  className={`w-full rounded-xl border p-4 text-left text-base transition-all ${
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
            <div className="py-2">
              <input
                type="range"
                min={q.min}
                max={q.max}
                value={answers[q.key] || q.min}
                onChange={(e) => handleChange(q.key, e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 accent-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-400">{q.min}</span>
                <div className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 px-5 py-2.5 ring-1 ring-blue-100">
                  <span className="text-2xl font-bold text-blue-700">
                    {answers[q.key] || q.min}
                  </span>
                  <span className="text-sm text-blue-400">/ {q.max}</span>
                </div>
                <span className="text-sm text-gray-400">{q.max}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {step === questions.length - 1 && (
        <div className="mt-8 rounded-xl bg-blue-50/70 p-5 ring-1 ring-blue-100">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={requiresReview}
              onChange={(e) => setRequiresReview(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-gray-300 text-blue-600 accent-blue-600"
            />
            <div>
              <span className="font-semibold text-gray-900">Quiero que un asesor revise mi perfilamiento</span>
              <p className="mt-1 text-sm text-gray-500">
                Si activás esta opción, un asesor autorizado revisará y aprobará tu propuesta.
                Si la desactivás, recibirás tu propuesta directamente.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
        {step > 0 ? (
          <button onClick={handleBack} className="btn-secondary">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
        ) : (
          <div />
        )}

        {step < questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-primary"
          >
            Siguiente
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3.5 font-semibold text-white transition hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-600/25 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analizando...
              </span>
            ) : (
              "Obtener mi perfil"
            )}
          </button>
        )}
      </div>
    </div>
  )
}
