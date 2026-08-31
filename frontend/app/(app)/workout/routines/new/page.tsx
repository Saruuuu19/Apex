import { createRoutine } from "@/lib/actions/workout";
import { RoutineForm } from "@/components/features/routines/RoutineForm";

export default function NewRoutinePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center py-6">
      <main className="flex w-full flex-col items-center gap-5">
        <div className="w-full">
          <RoutineForm
            action={createRoutine}
            submitLabel="Create Routine"
            heading="New Routine"
          />
        </div>
      </main>
    </div>
  );
}
