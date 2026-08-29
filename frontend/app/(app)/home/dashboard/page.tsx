import { Gauge } from "@/components/features/dashboard/Gauge";
import { RecoveryRanking } from "@/components/features/dashboard/RecoveryRanking";

export default function DashboardPage() {
  return (
    <div className="flex min-h-auto w-full flex-col items-center justify-center py-6">
      <main className="flex w-full flex-col items-center gap-5">
        <header className="flex w-full flex-col items-center">
          <h1 className="font-pixel text-3xl font-bold">Welcome, Andrés.</h1>
        </header>
        <div className="flex w-full justify-center px-6">
          <Gauge percentage={60} label="Body Overview" />
        </div>

        <div className="flex flex-col items-start">
          <header className="flex flex-col items-start self-stretch">
            <h2 className="font-pixel text-2xl font-bold">Recovery Ranking</h2>
          </header>
        </div>
        <RecoveryRanking />
      </main>
    </div>
  );
}
