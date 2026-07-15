import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_VOICE_ID,
  EDGE_VOICES,
  type EdgeVoice,
} from "../data/voices";

export type SpeechStatus = "idle" | "loading" | "speaking" | "paused";

export type VoiceOption = EdgeVoice;

const defaultVoice =
  EDGE_VOICES.find((v) => v.id === DEFAULT_VOICE_ID) ?? EDGE_VOICES[0];

function destroyAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  try {
    audio.onplay = null;
    audio.onpause = null;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  } catch {
    // ignore
  }
}

export function useSpeech() {
  const [voices] = useState<VoiceOption[]>(EDGE_VOICES);
  const [voiceId, setVoiceIdState] = useState(DEFAULT_VOICE_ID);
  const [rate, setRate] = useState(defaultVoice?.defaultRate ?? 1);
  const [pitch, setPitch] = useState(defaultVoice?.defaultPitch ?? 1);
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const speakingLockRef = useRef(false);

  const selectedVoice = useMemo(
    () => voices.find((v) => v.id === voiceId) ?? voices[0] ?? null,
    [voices, voiceId],
  );

  const setVoiceId = useCallback(
    (id: string) => {
      setVoiceIdState(id);
      const voice = voices.find((v) => v.id === id);
      if (voice) {
        setRate(voice.defaultRate);
        setPitch(voice.defaultPitch);
      }
    },
    [voices],
  );

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    speakingLockRef.current = false;

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    destroyAudio(audioRef.current);
    audioRef.current = null;
    setStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      stop();
      revokeObjectUrl();
    };
  }, [revokeObjectUrl, stop]);

  const speak = useCallback(
    async (text: string) => {
      const cleaned = text.trim();
      if (!cleaned) return;

      // Chặn phát chồng (nguyên nhân vọng 2 giọng).
      if (speakingLockRef.current) {
        stop();
      }
      speakingLockRef.current = true;

      const requestId = ++requestIdRef.current;
      if (abortRef.current) abortRef.current.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      destroyAudio(audioRef.current);
      audioRef.current = null;

      setError(null);
      setStatus("loading");

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleaned,
            voice: voiceId,
            rate,
            pitch,
          }),
          signal: abort.signal,
        });

        if (requestId !== requestIdRef.current) return;

        if (!response.ok) {
          let message = "Không tạo được giọng đọc.";
          try {
            const data = (await response.json()) as { error?: string };
            if (data.error) message = data.error;
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        const blob = await response.blob();
        if (requestId !== requestIdRef.current) return;

        revokeObjectUrl();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setAudioUrl(url);

        destroyAudio(audioRef.current);
        const audio = new Audio(url);
        // Google: chỉnh tốc bằng playbackRate. Edge đã bake rate ở server.
        audio.playbackRate =
          selectedVoice?.engine === "google" ? rate : 1;
        audioRef.current = audio;

        audio.onplay = () => {
          if (requestId === requestIdRef.current) setStatus("speaking");
        };
        audio.onpause = () => {
          if (
            requestId === requestIdRef.current &&
            !audio.ended &&
            audio.currentTime > 0
          ) {
            setStatus("paused");
          }
        };
        audio.onended = () => {
          if (requestId === requestIdRef.current) {
            speakingLockRef.current = false;
            setStatus("idle");
          }
        };
        audio.onerror = () => {
          if (requestId === requestIdRef.current) {
            speakingLockRef.current = false;
            setStatus("idle");
            setError("Trình duyệt không phát được file audio.");
          }
        };

        await audio.play();
        if (requestId !== requestIdRef.current) {
          destroyAudio(audio);
          return;
        }
      } catch (err) {
        if (abort.signal.aborted || requestId !== requestIdRef.current) return;
        speakingLockRef.current = false;
        setStatus("idle");
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      }
    },
    [pitch, rate, revokeObjectUrl, selectedVoice?.engine, stop, voiceId],
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      setStatus("paused");
    }
  }, []);

  const resume = useCallback(async () => {
    const audio = audioRef.current;
    if (audio && audio.paused) {
      try {
        await audio.play();
        setStatus("speaking");
      } catch {
        setError("Không tiếp tục phát được.");
        setStatus("idle");
        speakingLockRef.current = false;
      }
    }
  }, []);

  return {
    supported: true,
    voices,
    voiceId,
    setVoiceId,
    selectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    status,
    error,
    audioUrl,
    speak,
    pause,
    resume,
    stop,
  };
}
