"use client"

interface PieChartProps {
  data: Record<string, number>
  colors?: string[]
}

export function PieChart({ data, colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"] }: PieChartProps) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0)
  const entries = Object.entries(data)

  let cumulativePercentage = 0

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {entries.map(([key, value], index) => {
            const percentage = (value / total) * 100
            const strokeDasharray = `${percentage} ${100 - percentage}`
            const strokeDashoffset = -cumulativePercentage
            cumulativePercentage += percentage

            return (
              <circle
                key={key}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
      </div>
      <div className="space-y-2">
        {entries.map(([key, value], index) => (
          <div key={key} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {key}: {value} ({Math.round((value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface BarChartProps {
  data: { label: string; value: number }[]
  color?: string
}

export function BarChart({ data, color = "#3B82F6" }: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-24 text-sm text-gray-600 dark:text-gray-300 truncate">{item.label}</div>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
            <div
              className="h-4 rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: color,
              }}
            />
            <span className="absolute right-2 top-0 text-xs text-gray-600 dark:text-gray-300 leading-4">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

interface LineChartProps {
  data: { label: string; value: number }[]
  color?: string
}

export function LineChart({ data, color = "#3B82F6" }: LineChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value))
  const minValue = Math.min(...data.map((item) => item.value))
  const range = maxValue - minValue

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 300
      const y = 100 - ((item.value - minValue) / range) * 80
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="w-full">
      <svg className="w-full h-32" viewBox="0 0 300 100">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} className="transition-all duration-300" />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 300
          const y = 100 - ((item.value - minValue) / range) * 80
          return <circle key={index} cx={x} cy={y} r="3" fill={color} className="transition-all duration-300" />
        })}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}
