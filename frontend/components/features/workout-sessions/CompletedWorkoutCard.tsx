import { Clock, Dumbbell, Weight } from "lucide-react";

import { API_BASE_URL } from "@/lib/api";
import {
  countSessionSets,
  formatMinutes,
  formatPerformedAt,
  formatVolume,
  formatWeekdayWorkout,
  sessionVolumeKg,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WorkoutPost } from "@/types";

type StatItem = {
  label: string;
  value: string;
  icon: React.ElementType;
};

function toImageSrc(imageUrl: string): string {
  return imageUrl.startsWith("/") ? `${API_BASE_URL}${imageUrl}` : imageUrl;
}

export function CompletedWorkoutCard({
  post,
  className,
}: {
  post: WorkoutPost;
  className?: string;
}) {
  const title = post.title?.trim() || formatWeekdayWorkout(post.performed_at);
  const caption = post.caption?.trim();
  const imageSrc = post.image_url ? toImageSrc(post.image_url) : null;
  const sets = countSessionSets(post.workout_session);

  const items: StatItem[] = [
    {
      label: "Minutes",
      value: formatMinutes(post.duration_seconds),
      icon: Clock,
    },
    {
      label: "Sets",
      value: sets === null ? "—" : String(sets),
      icon: Dumbbell,
    },
    {
      // Records/PRs are not tracked yet; Volume is shown until then.
      label: "Volume",
      value: formatVolume(sessionVolumeKg(post.workout_session)),
      icon: Weight,
    },
  ];

  return (
    <article
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-2xl border border-(--bg-input) bg-(--bg-card) p-4 shadow-lg shadow-black/20 sm:p-5",
        "max-w-105 sm:max-w-110 lg:max-w-120",
        className,
      )}
    >
      <header className="flex w-full items-center gap-3">
        <div
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-(--button-bg) to-(--button-bg-hover) font-pixel text-sm font-bold text-white ring-1 ring-(--bg-input) sm:size-10"
        >
          {post.user.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <span className="truncate font-pixel text-[13px] leading-none font-semibold tracking-tight sm:text-sm">
            {post.user.username}
          </span>
          <time
            dateTime={post.performed_at}
            className="text-[11px] leading-none text-(--text-secondary) sm:text-xs"
          >
            {formatPerformedAt(post.performed_at)}
          </time>
        </div>
      </header>

      <div className="mt-3 flex w-full flex-col gap-3 sm:mt-4 sm:gap-4">
        <div className="flex w-full flex-col gap-1">
          <h2 className="line-clamp-2 font-pixel text-[17px] leading-tight font-bold tracking-tight sm:text-lg lg:text-[19px]">
            {title}
          </h2>
          {caption ? (
            <p className="line-clamp-2 text-sm leading-[1.6] font-light text-(--text-secondary) sm:text-[15px]">
              {caption}
            </p>
          ) : null}
        </div>

        {imageSrc ? (
          <section
            aria-label="Workout photo and statistics"
            className="relative aspect-square w-full overflow-hidden rounded-xl bg-(--bg-input) sm:rounded-2xl"
          >
            <figure className="m-0 h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                width={800}
                height={800}
                className="h-full w-full object-cover"
                sizes="(max-width: 640px) 100vw, 440px"
              />
            </figure>

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-linear-to-t from-black/85 via-black/55 to-transparent sm:h-[46%] lg:h-[42%]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-60"
              aria-hidden="true"
            />

            <dl className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-2 px-2 pt-8 pb-3 sm:gap-3 sm:px-3 sm:pb-3.5 lg:px-4">
              {items.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-end gap-1 px-1 py-1 not-first:border-l not-first:border-white/15 not-first:pl-3 sm:gap-1.5 sm:px-2 sm:not-first:pl-4"
                >
                  <dt className="order-2 text-center text-xs font-medium tracking-[0.14em] uppercase leading-none sm:tracking-[0.16em]">
                    {label}
                  </dt>
                  <dd className="order-1 flex items-center justify-center gap-1.5 leading-none">
                    <Icon
                      aria-hidden="true"
                      className="size-6 shrink-0 text-white sm:size-3.75 lg:size-4"
                      strokeWidth={2}
                    />
                    <span className="font-pixel text-2xl font-bold tracking-tight text-white sm:text-[17px] lg:text-[18px]">
                      {value}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : (
          <dl className="grid w-full grid-cols-3 gap-2 rounded-xl border border-(--bg-input) px-2 py-3 sm:gap-3 sm:px-3">
            {items.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 not-first:border-l not-first:border-(--bg-input)"
              >
                <dt className="order-2 text-center text-[11px] font-medium tracking-[0.14em] text-(--text-muted) uppercase leading-none">
                  {label}
                </dt>
                <dd className="order-1 flex items-center justify-center gap-1.5 leading-none">
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-(--text-secondary)"
                    strokeWidth={2}
                  />
                  <span className="font-pixel text-base font-bold tracking-tight">
                    {value}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
