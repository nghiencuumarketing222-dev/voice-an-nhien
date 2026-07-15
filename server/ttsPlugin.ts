import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Connect, Plugin } from "vite";
import { EdgeTTS } from "node-edge-tts";
import googleTTS from "google-tts-api";
import {
  DEFAULT_VOICE_ID,
  EDGE_VOICES,
  resolveEngineVoiceId,
  toEdgePercent,
  type EdgeVoice,
} from "../src/data/voices.ts";
import {
  checkAdminPassword,
  getStatsSummary,
  trackPageview,
  trackTts,
  trackVisit,
} from "./stats.ts";

type TtsBody = {
  text?: string;
  voice?: string;
  rate?: number;
  pitch?: number;
};

function readJson(req: IncomingMessage): Promise<TtsBody> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? (JSON.parse(raw) as TtsBody) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

async function synthesizeGoogle(text: string, lang: string): Promise<Buffer> {
  const urls = googleTTS.getAllAudioUrls(text, {
    lang,
    slow: false,
    host: "https://translate.google.com",
  });

  const parts: Buffer[] = [];
  for (const item of urls) {
    const response = await fetch(item.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
      },
    });
    if (!response.ok) {
      throw new Error(`Google TTS lỗi HTTP ${response.status}`);
    }
    parts.push(Buffer.from(await response.arrayBuffer()));
  }

  return Buffer.concat(parts);
}

async function synthesizeEdge(
  text: string,
  voice: EdgeVoice,
  rate: number,
  pitch: number,
): Promise<Buffer> {
  const dir = path.join(os.tmpdir(), "annhien-tts");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${randomUUID()}.mp3`);

  try {
    const tts = new EdgeTTS({
      voice: resolveEngineVoiceId(voice),
      lang: voice.lang,
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      pitch: toEdgePercent(pitch),
      rate: toEdgePercent(rate),
      timeout: 25000,
    });
    await tts.ttsPromise(text, filePath);
    return await readFile(filePath);
  } finally {
    await unlink(filePath).catch(() => undefined);
  }
}

async function handleTts(req: IncomingMessage, res: ServerResponse) {
  try {
    const body = await readJson(req);
    const text = body.text?.trim() ?? "";
    if (!text) {
      sendJson(res, 400, { error: "Thiếu nội dung văn bản." });
      return;
    }
    if (text.length > 5000) {
      sendJson(res, 400, {
        error: "Văn bản quá dài (tối đa 5000 ký tự mỗi lần).",
      });
      return;
    }

    const voice =
      EDGE_VOICES.find((v) => v.id === body.voice) ??
      EDGE_VOICES.find((v) => v.id === DEFAULT_VOICE_ID)!;
    const rate = typeof body.rate === "number" ? body.rate : 1;
    const pitch = typeof body.pitch === "number" ? body.pitch : 1;

    let audio: Buffer;
    let engineUsed = voice.engine;

    if (voice.engine === "google") {
      audio = await synthesizeGoogle(text, voice.googleLang || "vi");
    } else {
      try {
        audio = await synthesizeEdge(text, voice, rate, pitch);
      } catch (edgeError) {
        if (!voice.googleLang) throw edgeError;
        audio = await synthesizeGoogle(text, voice.googleLang);
        engineUsed = "google";
      }
    }

    const dir = path.join(os.tmpdir(), "annhien-tts");
    await mkdir(dir, { recursive: true });
    const outPath = path.join(dir, `${randomUUID()}.mp3`);
    await writeFile(outPath, audio);

    void trackTts();

    res.statusCode = 200;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-AnNhien-Engine", engineUsed);
    const stream = createReadStream(outPath);
    stream.pipe(res);
    stream.on("close", () => {
      void unlink(outPath).catch(() => undefined);
    });
    stream.on("error", () => {
      void unlink(outPath).catch(() => undefined);
      if (!res.headersSent) {
        sendJson(res, 500, { error: "Không đọc được file audio." });
      } else {
        res.end();
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tạo giọng đọc thất bại.";
    sendJson(res, 500, { error: message });
  }
}

async function handleTrack(req: IncomingMessage, res: ServerResponse) {
  try {
    const body = (await readJson(req)) as {
      type?: string;
      path?: string;
    };
    const pathname = typeof body.path === "string" ? body.path : "/";
    if (body.type === "visit") {
      await trackVisit();
    } else {
      await trackPageview(pathname);
    }
    sendJson(res, 200, { ok: true });
  } catch {
    sendJson(res, 400, { error: "Không ghi được lượt truy cập." });
  }
}

async function handleAdminStats(req: IncomingMessage, res: ServerResponse) {
  try {
    const body = (await readJson(req)) as { password?: string };
    if (!checkAdminPassword(body.password)) {
      sendJson(res, 401, { error: "Sai mật khẩu admin." });
      return;
    }
    const summary = await getStatsSummary(14);
    sendJson(res, 200, summary);
  } catch {
    sendJson(res, 500, { error: "Không đọc được thống kê." });
  }
}

export function ttsMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url?.split("?")[0] ?? "";

    if (req.method === "GET" && url === "/api/voices") {
      sendJson(res, 200, { voices: EDGE_VOICES });
      return;
    }

    if (req.method === "POST" && url === "/api/tts") {
      void handleTts(req, res);
      return;
    }

    if (req.method === "POST" && url === "/api/track") {
      void handleTrack(req, res);
      return;
    }

    if (req.method === "POST" && url === "/api/admin/stats") {
      void handleAdminStats(req, res);
      return;
    }

    if (req.method === "GET" && url === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    next();
  };
}

export function anNhienTtsPlugin(): Plugin {
  return {
    name: "annhien-tts-api",
    configureServer(server) {
      server.middlewares.use(ttsMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(ttsMiddleware());
    },
  };
}
