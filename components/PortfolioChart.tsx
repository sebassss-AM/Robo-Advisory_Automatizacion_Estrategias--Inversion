"use client"

interface Allocation {
  instrument_name: string
  category: string
  percentage: number
}

interface PortfolioChartProps {
  allocations: Allocation[]
}

const categoryColors: Record<string, string> = {
  renta_fija: "bg-blue-500",
  renta_variable: "bg-green-500",
  liquidez: "bg-yellow-500",
  alternativos: "bg-purple-500",
}

const categoryLabels: Record<string, string> = {
  renta_fija: "Renta Fija",
  renta_variable: "Renta Variable",
  liquidez: "Liquidez",
  alternativos: "Alternativos",
}

export default function PortfolioChart({ allocations }: PortfolioChartProps) {
  const total = allocations.reduce((sum, a) => sum + a.percentage, 0)

  return (
    <div className="w-full">
      <div className="flex h-8 w-full overflow-hidden rounded-lg">
        {allocations.map((alloc, i) => (
          <div
            key={i}
            style={{ width: `${(alloc.percentage / total) * 100}%` }}
            className={`${categoryColors[alloc.category] || "bg-gray-400"} first:rounded-l-lg last:rounded-r-lg`}
            title={`${alloc.instrument_name}: ${alloc.percentage}%`}
          />
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {allocations.map((alloc, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border bg-white p-3">
            <div className="flex items-center gap-3">
              <span
                className={`h-4 w-4 rounded ${categoryColors[alloc.category] || "bg-gray-400"}`}
              />
              <div>
                <p className="font-medium text-gray-900">{alloc.instrument_name}</p>
                <p className="text-sm text-gray-500">
                  {categoryLabels[alloc.category] || alloc.category}
                </p>
              </div>
            </div>
            <span className="text-xl font-bold text-blue-600">{alloc.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
