import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type DayStats = {
  visits: number;
  pageviews: number;
  tts: number;
  landing: number;
  studio: number;
};

type StatsFile = {
  days: Record<string, DayStats>;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const statsPath = path.resolve(__dirname, "../data/stats.json");

const emptyDay = (): DayStats => ({
  visits: 0,
  pageviews: 0,
  tts: 0,
  landing: 0,
  studio: 0,
});

let cache: StatsFile = { days: {} };
let loaded = false;
let writeQueue: Promise<void> = Promise.resolve();

function todayKey(date = new Date()): string {
  // Asia/Ho_Chi_Minh (UTC+7) calendar day
  const local = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

async function load(): Promise<StatsFile> {
  if (loaded) return cache;
  try {
    const raw = await readFile(statsPath, "utf8");
    const parsed = JSON.parse(raw) as StatsFile;
    cache = { days: parsed.days ?? {} };
  } catch {
    cache = { days: {} };
  }
  loaded = true;
  return cache;
}

function persist(): void {
  writeQueue = writeQueue.then(async () => {
    await mkdir(path.dirname(statsPath), { recursive: true });
    await writeFile(statsPath, JSON.stringify(cache, null, 2), "utf8");
  });
}

function ensureDay(key: string): DayStats {
  if (!cache.days[key]) cache.days[key] = emptyDay();
  return cache.days[key];
}

export async function trackVisit(): Promise<void> {
  await load();
  ensureDay(todayKey()).visits += 1;
  persist();
}

export async function trackPageview(pathname: string): Promise<void> {
  await load();
  const day = ensureDay(todayKey());
  day.pageviews += 1;
  if (pathname === "/" || pathname === "") day.landing += 1;
  else if (pathname.startsWith("/app")) day.studio += 1;
  persist();
}

export async function trackTts(): Promise<void> {
  await load();
  ensureDay(todayKey()).tts += 1;
  persist();
}

export async function getStatsSummary(days = 14) {
  await load();
  const keys: string[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    keys.push(todayKey(d));
  }

  const rows = keys.map((date) => ({
    date,
    ...(cache.days[date] ?? emptyDay()),
  }));

  const today = rows[0] ?? { date: todayKey(), ...emptyDay() };
  const totals = rows.reduce(
    (acc, row) => ({
      visits: acc.visits + row.visits,
      pageviews: acc.pageviews + row.pageviews,
      tts: acc.tts + row.tts,
    }),
    { visits: 0, pageviews: 0, tts: 0 },
  );

  return { today, lastDays: rows, totals, timezone: "Asia/Ho_Chi_Minh" };
}

export function checkAdminPassword(password: string | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD || "annhien2026";
  return Boolean(password) && password === expected;
}
