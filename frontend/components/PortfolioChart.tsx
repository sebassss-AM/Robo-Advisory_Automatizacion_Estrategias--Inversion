"use client"

interface Allocation {
  instrument_name: string
  category: string
  percentage: number
}

interface PortfolioChartProps {
  allocations: Allocation[]
}

const COLORS = [
  { bar: "bg-blue-500", hex: "#3b82f6", light: "#dbeafe" },
  { bar: "bg-emerald-500", hex: "#10b981", light: "#d1fae5" },
  { bar: "bg-amber-500", hex: "#f59e0b", light: "#fef3c7" },
  { bar: "bg-violet-500", hex: "#8b5cf6", light: "#ede9fe" },
  { bar: "bg-rose-500", hex: "#f43f5e", light: "#ffe4e6" },
  { bar: "bg-cyan-500", hex: "#06b6d4", light: "#cffafe" },
  { bar: "bg-orange-500", hex: "#f97316", light: "#ffedd5" },
]

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
}

export default function PortfolioChart({ allocations }: PortfolioChartProps) {
  const total = allocations.reduce((s, a) => s + a.percentage, 0)
  let currentAngle = 0
  const arcs = allocations.map((a, i) => {
    const angle = (a.percentage / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    return { ...a, startAngle, endAngle, color: COLORS[i % COLORS.length] }
  })

  const cx = 120
  const cy = 120
  const r = 100
  const viewSize = 280

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row">
      {/* Donut chart */}
      <div className="shrink-0">
        <svg width={viewSize} height={viewSize} viewBox={`0 0 ${viewSize} ${viewSize}`}>
          {arcs.map((arc, i) => (
            <path
              key={i}
              d={describeArc(cx, cy, r, arc.startAngle, arc.endAngle)}
              fill={arc.color.hex}
              opacity={0.85}
              className="transition-opacity hover:opacity-100"
            />
          ))}
          <circle cx={cx} cy={cy} r={r * 0.55} fill="white" className="drop-shadow-sm" />
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            className="fill-gray-900 text-2xl font-bold"
          >
            {total}%
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            className="fill-gray-400 text-xs"
          >
            distribuido
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3 self-center">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: arc.color.hex }}
              />
              <span className="text-sm text-gray-700">{arc.instrument_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="min-w-[3rem] text-right text-sm font-bold text-gray-900">
                {arc.percentage}%
              </span>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100 sm:w-28">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${arc.percentage}%`, backgroundColor: arc.color.hex }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
