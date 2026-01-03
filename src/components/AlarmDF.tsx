/* ============================================================
 * Alarm → Chart Series Builder
 *
 * Semantics:
 * - TL / TT => state = 1 (immediate)
 * - IS at bucket start => bucket = 0, future = 0
 * - IS inside bucket   => bucket = 1, future = 0
 * - State persists otherwise
 * ============================================================
 */

/* ---------- Types ---------- */

export interface AlarmEvent {
  t: number;          // unix timestamp in seconds
  group: string;
  id: string;
  lo: string;         // TL | TT | IS | ...
}

export interface AlarmSeriesResult {
  timestamps: number[];
  series: Map<string, (0 | 1)[]>;
}

export interface BuildOptions {
  fromTs: number;     // ms
  toTs: number;       // ms
  maxPoints?: number; // default 100
}

/* ---------- Constants ---------- */

const BASE_STEP_MS = 1000; // 1 second
const MAX_POINTS_DEFAULT = 100;

const SET_STATES = new Set(['TL', 'TT']);
const CLEAR_STATE = 'IS';

/* ---------- Utilities ---------- */

function alignToStep(ts: number, stepMs: number): number {
  return Math.floor(ts / stepMs) * stepMs;
}

function computeStepMs(
  fromTs: number,
  toTs: number,
  maxPoints: number
): number {
  const range = toTs - fromTs;
  const rawStep = Math.ceil(range / maxPoints);
  return Math.max(
    BASE_STEP_MS,
    Math.ceil(rawStep / BASE_STEP_MS) * BASE_STEP_MS
  );
}

/* ---------- Public API ---------- */

export function buildAlarmSeries(
  events: AlarmEvent[],
  options: BuildOptions
): AlarmSeriesResult {

  const {
    fromTs,
    toTs,
    maxPoints = MAX_POINTS_DEFAULT
  } = options;

  const stepMs = computeStepMs(fromTs, toTs, maxPoints);
  const startTs = alignToStep(fromTs, stepMs);

  /* ----- Shared timestamps ----- */

  const timestamps: number[] = [];
  for (let ts = startTs; ts <= toTs; ts += stepMs) {
    timestamps.push(ts);
  }

  /* ----- Group events ----- */

  const byAlarm = new Map<string, AlarmEvent[]>();

  for (const e of events) {
    const key = `${e.group}/${e.id}`;
    if (!byAlarm.has(key)) byAlarm.set(key, []);
    byAlarm.get(key)!.push(e);
  }

  /* ----- Build series ----- */

  const series = new Map<string, (0 | 1)[]>();

  for (const [alarmKey, alarmEvents] of byAlarm) {
    const sorted = [...alarmEvents].sort((a, b) => a.t - b.t);

    const values: (0 | 1)[] = [];
    let state: 0 | 1 = 0;
    let eventIdx = 0;

    for (let i = 0; i < timestamps.length; i++) {
      const bucketStart = timestamps[i];
      const bucketEnd = bucketStart + stepMs;

      let isAtStart = false;
      let isInside = false;

      // Process events in this bucket
      while (
        eventIdx < sorted.length &&
        sorted[eventIdx].t * 1000 < bucketEnd
      ) {
        const eventTs = sorted[eventIdx].t * 1000;
        const lo = sorted[eventIdx].lo;

        if (SET_STATES.has(lo)) {
          state = 1;
        } else if (lo === CLEAR_STATE) {
          if (eventTs === bucketStart) {
            isAtStart = true;
          } else {
            isInside = true;
          }
        }

        eventIdx++;
      }

      // Apply IS semantics
      if (isAtStart) {
        state = 0;
        values.push(0);
      } else if (isInside) {
        values.push(1);
        state = 0; // cleared for next buckets
      } else {
        values.push(state);
      }
    }

    series.set(alarmKey, values);
  }

  return { timestamps, series };
}

