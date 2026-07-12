export type PlaybackCursor = {
  nextIndex: number
  nextTimeMs: number
}

export type ScheduledSlot = {
  index: number
  timeMs: number
}

type ScheduleWindowInput = {
  beatCount: number
  cursor: PlaybackCursor
  nowMs: number
  scheduleUntilMs: number
  stepMs: number
}

const wrapIndex = (index: number, beatCount: number) =>
  ((index % beatCount) + beatCount) % beatCount

export const playbackIndexAt = (
  startIndex: number,
  startedAtMs: number,
  nowMs: number,
  stepMs: number,
  beatCount: number,
) => {
  if (beatCount <= 0 || stepMs <= 0) return 0
  const elapsedSteps = Math.max(0, Math.floor((nowMs - startedAtMs) / stepMs))
  return wrapIndex(startIndex + elapsedSteps, beatCount)
}

export const playbackCursorAfter = (
  startIndex: number,
  startedAtMs: number,
  nowMs: number,
  stepMs: number,
  beatCount: number,
): PlaybackCursor => {
  const elapsedSteps = Math.max(0, Math.floor((nowMs - startedAtMs) / stepMs))
  const nextStep = elapsedSteps + 1
  return {
    nextIndex: wrapIndex(startIndex + nextStep, beatCount),
    nextTimeMs: startedAtMs + nextStep * stepMs,
  }
}

export const schedulePlaybackWindow = ({
  beatCount,
  cursor,
  nowMs,
  scheduleUntilMs,
  stepMs,
}: ScheduleWindowInput) => {
  if (beatCount <= 0 || stepMs <= 0) {
    return { cursor, scheduled: [] as ScheduledSlot[], skipped: 0 }
  }

  const skipped =
    cursor.nextTimeMs <= nowMs ? Math.floor((nowMs - cursor.nextTimeMs) / stepMs) + 1 : 0
  let nextIndex = wrapIndex(cursor.nextIndex + skipped, beatCount)
  let nextTimeMs = cursor.nextTimeMs + skipped * stepMs
  const scheduled: ScheduledSlot[] = []

  while (nextTimeMs < scheduleUntilMs) {
    scheduled.push({ index: nextIndex, timeMs: nextTimeMs })
    nextIndex = wrapIndex(nextIndex + 1, beatCount)
    nextTimeMs += stepMs
  }

  return {
    cursor: { nextIndex, nextTimeMs },
    scheduled,
    skipped,
  }
}
