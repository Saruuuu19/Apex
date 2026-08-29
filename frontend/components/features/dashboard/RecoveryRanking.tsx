type RecoveryItem = {
  muscle: string;
  percentage: number;
};

const mockData: RecoveryItem[] = [
  { muscle: "Chest", percentage: 87 },
  { muscle: "Back", percentage: 76 },
  { muscle: "Shoulders", percentage: 71 },
  { muscle: "Quadriceps", percentage: 64 },
  { muscle: "Hamstrings", percentage: 48 },
  { muscle: "Biceps", percentage: 32 },
];

const getRecoveryColor = (value: number): string => {
  if (value < 35) return "var(--recovery-red)";
  if (value < 60) return "var(--recovery-yellow)";
  return "var(--recovery-green)";
};

export function RecoveryRanking({
  data = mockData,
}: {
  data?: RecoveryItem[];
}) {
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <ol className="grid grid-cols-3 gap-x-6 gap-y-4 w-full list-none p-0 m-0">
      {sortedData.map((item) => {
        const value = Math.min(100, Math.max(0, item.percentage));
        const color = getRecoveryColor(value);

        return (
          <li
            key={item.muscle}
            className="flex flex-col items-center justify-center"
          >
            <div className="mb-1 flex items-center justify-center gap-2">
              <span className="font-pixel text-sm font-semibold">
                {item.muscle}
              </span>
              <span
                className="font-pixel font-semibold text-sm"
                style={{ color }}
              >
                {value}%
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Recuperación de ${item.muscle}`}
              className="h-1.5 w-full bg-neutral-800 overflow-hidden rounded-full"
            >
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${value}%`, backgroundColor: color }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
