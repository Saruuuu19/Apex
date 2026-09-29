"use client";

import { useSyncExternalStore } from "react";

import { formatElapsedTime } from "@/lib/utils";

const noopSubscribe = () => () => {};

let cachedSecond = Math.floor(Date.now() / 1000);

function subscribeToSeconds(onChange: () => void) {
  const tick = () => {
    cachedSecond = Math.floor(Date.now() / 1000);
    onChange();
  };
  tick();
  const interval = setInterval(tick, 1000);
  return () => clearInterval(interval);
}

function getSecondSnapshot() {
  return cachedSecond;
}

function getServerSecondSnapshot(): number | null {
  return null;
}

export function SessionTimer({
  startedAt,
  endedAt,
}: {
  startedAt: string;
  endedAt: string | null;
}) {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : null;
  const nowSecond = useSyncExternalStore(
    end === null ? subscribeToSeconds : noopSubscribe,
    getSecondSnapshot,
    getServerSecondSnapshot,
  );

  let elapsedSeconds: number | null = null;
  if (end !== null) {
    elapsedSeconds = (end - start) / 1000;
  } else if (nowSecond !== null) {
    elapsedSeconds = (nowSecond * 1000 - start) / 1000;
  }

  if (elapsedSeconds === null) return null;

  return (
    <>
      {" - "}
      <span className="tabular-nums">{formatElapsedTime(elapsedSeconds)}</span>
    </>
  );
}
