import Link from "next/link";

import { CompletedWorkoutCard } from "@/components/features/workout-sessions/CompletedWorkoutCard";
import { api } from "@/lib/api";

export default async function FeedPage() {
  const posts = await api.getFeed();

  return (
    <div className="flex min-h-screen w-full flex-col items-center py-6">
      <main className="flex w-full flex-col items-center gap-5">
        <header className="flex w-full flex-col">
          <h1 className="font-pixel text-3xl font-bold">Feed</h1>
        </header>

        {posts.length === 0 ? (
          <div className="flex w-full flex-col items-center gap-2 rounded-2xl border border-(--bg-input) px-6 py-10 text-center">
            <p className="font-pixel text-lg font-bold">No workouts yet</p>
            <p className="text-sm text-(--text-muted)">
              Complete a workout and it will show up here.
            </p>
            <Link
              href="/workout"
              className="mt-3 h-10 rounded-3xl bg-(--button-bg) px-5 leading-10 font-bold text-white transition-colors hover:bg-(--button-bg-hover)"
            >
              Start a workout
            </Link>
          </div>
        ) : (
          posts.map((post) => <CompletedWorkoutCard key={post.id} post={post} />)
        )}
      </main>
    </div>
  );
}
