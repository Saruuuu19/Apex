type GaugeProps = {
  percentage: number;
  label: string;
};

const GAUGE_PATH = `
  M22 110
  C22 86.6609 31.2714 64.2778 47.7746 47.7746
  C64.2778 31.2714 86.6609 22 110 22
  C133.339 22 155.722 31.2714 172.225 47.7746
  C188.729 64.2778 198 86.6609 198 110
`;

function getLevelColor(value: number): string {
  if (value < 35) return "var(--recovery-red)";
  if (value < 60) return "var(--recovery-yellow)";
  return "var(--recovery-green)";
}

export function Gauge({ percentage, label }: GaugeProps) {
  const value = Math.min(100, Math.max(0, percentage));
  const color = getLevelColor(value);

  return (
    <div className="relative w-full max-w-150">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 220 132"
        className="h-auto w-full"
      >
        {/* Background */}
        <path
          d={GAUGE_PATH}
          fill="none"
          stroke="var(--bg-input)"
          strokeWidth="20"
          strokeLinecap="square"
        />

        {/* Progress: el path se rellena siguiendo el recorrido según el porcentaje */}
        <path
          d={GAUGE_PATH}
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="square"
          pathLength="100"
          strokeDasharray={`${value} 100`}
          className="transition-[stroke-dasharray,stroke] duration-700 ease-out"
        />
      </svg>

      <div className="absolute top-[80%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <span className="text-3xl font-bold font-pixel">{value}%</span>

        <span className="text-xl font-pixel text-(--text-muted)">{label}</span>
      </div>
    </div>
  );
}
