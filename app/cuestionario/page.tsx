"use client"

import { useRouter } from "next/navigation"
import RiskQuestionnaire from "@/components/RiskQuestionnaire"

export default function CuestionarioPage() {
  const router = useRouter()

  const handleComplete = (profileId: string) => {
    router.push(`/propuesta?profile_id=${profileId}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Perfilamiento de Riesgo
      </h1>
      <RiskQuestionnaire onComplete={handleComplete} />
    </main>
  )
}
