import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
};

type LeadsFile = {
  leads: Lead[];
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const leadsPath = path.resolve(__dirname, "../data/leads.json");

let cache: LeadsFile = { leads: [] };
let loaded = false;
let writeQueue: Promise<void> = Promise.resolve();

async function load(): Promise<LeadsFile> {
  if (loaded) return cache;
  try {
    const raw = await readFile(leadsPath, "utf8");
    const parsed = JSON.parse(raw) as LeadsFile;
    cache = { leads: Array.isArray(parsed.leads) ? parsed.leads : [] };
  } catch {
    cache = { leads: [] };
  }
  loaded = true;
  return cache;
}

function persist(): void {
  writeQueue = writeQueue.then(async () => {
    await mkdir(path.dirname(leadsPath), { recursive: true });
    await writeFile(leadsPath, JSON.stringify(cache, null, 2), "utf8");
  });
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "").trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 12;
}

export async function addLead(input: {
  name?: string;
  phone?: string;
  email?: string;
}): Promise<{ ok: true; lead: Lead } | { ok: false; error: string }> {
  await load();
  const name = input.name?.trim() ?? "";
  const phone = normalizePhone(input.phone ?? "");
  const email = input.email?.trim().toLowerCase() ?? "";

  if (name.length < 2) {
    return { ok: false, error: "Vui lòng nhập họ tên." };
  }
  if (!isValidPhone(phone)) {
    return { ok: false, error: "Số điện thoại chưa hợp lệ." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Email chưa hợp lệ." };
  }

  const existing = cache.leads.find(
    (l) => l.email === email || l.phone === phone,
  );
  if (existing) {
    return { ok: true, lead: existing };
  }

  const lead: Lead = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    phone,
    email,
    createdAt: new Date().toISOString(),
  };
  cache.leads.unshift(lead);
  // Keep last 2000 leads
  if (cache.leads.length > 2000) cache.leads.length = 2000;
  persist();
  return { ok: true, lead };
}

export async function listLeads(limit = 100): Promise<Lead[]> {
  await load();
  return cache.leads.slice(0, limit);
}
