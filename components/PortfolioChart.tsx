"use client"

interface Allocation {
  instrument_name: string
  category: string
  percentage: number
}

interface PortfolioChartProps {
  allocations: Allocation[]
}

const categoryConfig: Record<string, { color: string; bg: string; label: string }> = {
  renta_fija: {
    color: "bg-blue-500",
    bg: "bg-blue-50",
    label: "Renta Fija",
  },
  renta_variable: {
    color: "bg-green-500",
    bg: "bg-green-50",
    label: "Renta Variable",
  },
  liquidez: {
    color: "bg-yellow-500",
    bg: "bg-yellow-50",
    label: "Liquidez",
  },
  alternativos: {
    color: "bg-purple-500",
    bg: "bg-purple-50",
    label: "Alternativos",
  },
}

export default function PortfolioChart({ allocations }: PortfolioChartProps) {
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">
        {allocations.map((alloc, i) => {
          const config = categoryConfig[alloc.category]
          return (
            <div
              key={i}
              style={{ width: `${alloc.percentage}%` }}
              className={`${config?.color || "bg-gray-400"} first:rounded-l-full last:rounded-r-full transition-all`}
            />
          )
        })}
      </div>

      <div className="mt-6 space-y-3">
        {allocations.map((alloc, i) => {
          const config = categoryConfig[alloc.category]
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <span className={`h-4 w-4 rounded-full ${config?.color || "bg-gray-400"}`} />
                <div>
                  <p className="font-semibold text-gray-900">{alloc.instrument_name}</p>
                  <p className="text-sm text-gray-500">{config?.label || alloc.category}</p>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-blue-600">
                {alloc.percentage}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
