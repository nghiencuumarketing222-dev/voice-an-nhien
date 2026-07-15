import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { StudioNav } from "../components/Navbar";
import {
  BRAND_PHONE,
  BRAND_PHONE_TEL,
  BRAND_TAGLINE,
} from "../data/brand";
import type { VoiceCategory } from "../data/voices";
import { useSpeech } from "../hooks/useSpeech";
import "./Studio.css";

type StudioProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

const HISTORY_KEY = "annhien-history";
const MAX_HISTORY = 8;

const SAMPLE_PODCAST = `Chào mừng bạn đến với tập podcast hôm nay.

Trong tập này, chúng ta sẽ nói về cách biến một đoạn văn bản tiếng Việt thành giọng đọc tự nhiên, sẵn sàng đăng lên các nền tảng nghe audio.

Bạn chỉ cần dán nội dung, chọn giọng Podcast Nữ hoặc Podcast Nam, rồi nhấn Phát. Nếu ổn, hãy tải file MP3 về máy.`;

const CATEGORIES: { id: VoiceCategory | "all"; label: string }[] = [
  { id: "podcast", label: "Podcast" },
  { id: "thuong", label: "Giọng thường" },
  { id: "khac", label: "Khác" },
  { id: "all", label: "Tất cả" },
];

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x) => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export default function Studio({ theme, onToggleTheme }: StudioProps) {
  const {
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
  } = useSpeech();

  const [text, setText] = useState(SAMPLE_PODCAST);
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VoiceCategory | "all">("podcast");

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const busy = status === "loading";

  const filteredVoices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return voices.filter((v) => {
      const matchCategory = category === "all" || v.category === category;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.localeLabel.toLowerCase().includes(q) ||
        v.gender.toLowerCase().includes(q) ||
        v.blurb.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    });
  }, [voices, query, category]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const pushHistory = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    setHistory((prev) => {
      const next = [cleaned, ...prev.filter((item) => item !== cleaned)];
      return next.slice(0, MAX_HISTORY);
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || busy || status === "speaking") return;
    pushHistory(text);
    void speak(text);
  };

  const statusLabel =
    status === "loading"
      ? "Đang tạo giọng…"
      : status === "speaking"
        ? "Đang đọc"
        : status === "paused"
          ? "Tạm dừng"
          : "Sẵn sàng";

  return (
    <div className="studio">
      <StudioNav theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container studio-main">
        <div className="studio-head">
          <div>
            <p className="eyebrow">Xưởng đọc</p>
            <h1>Đọc thành podcast</h1>
            <p className="studio-lead">
              Chọn giọng podcast tiếng Việt, dán script, nghe thử rồi tải MP3.
              {selectedVoice ? ` Đang chọn: ${selectedVoice.name}.` : ""}
            </p>
          </div>
          <div className={`status-pill status-${status}`}>{statusLabel}</div>
        </div>

        <a className="studio-contact" href={BRAND_PHONE_TEL}>
          <strong>{BRAND_TAGLINE}</strong>
          <span>{BRAND_PHONE}</span>
        </a>

        {error && <div className="notice danger">{error}</div>}

        <form className="studio-grid" onSubmit={onSubmit}>
          <section className="panel editor">
            <div className="panel-top">
              <label htmlFor="script">Nội dung / script</label>
              <div className="meta">
                {wordCount} từ · {charCount} ký tự
              </div>
            </div>
            <textarea
              id="script"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Dán script podcast tiếng Việt vào đây…"
              rows={16}
              disabled={busy}
            />
            <div className="editor-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setText("")}
                disabled={busy}
              >
                Xóa
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setText(SAMPLE_PODCAST)}
                disabled={busy}
              >
                Mẫu podcast
              </button>
              {status === "speaking" ? (
                <button type="button" className="btn btn-ghost" onClick={pause}>
                  Tạm dừng
                </button>
              ) : status === "paused" ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void resume()}
                >
                  Tiếp tục
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={stop}
                disabled={status === "idle" || busy}
              >
                Dừng
              </button>
              {audioUrl && (
                <a
                  className="btn btn-ghost"
                  href={audioUrl}
                  download="voice-an-nhien-podcast.mp3"
                >
                  Tải MP3
                </a>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!text.trim() || busy || status === "speaking"}
              >
                {busy ? "Đang tạo…" : status === "speaking" ? "Phát lại" : "Phát"}
              </button>
            </div>
          </section>

          <aside className="side">
            <section className="panel">
              <div className="panel-top">
                <label htmlFor="voice-search">Giọng đọc</label>
                <span className="meta">{filteredVoices.length} giọng</span>
              </div>

              <div className="voice-tabs" role="tablist" aria-label="Nhóm giọng">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={category === item.id}
                    className={`voice-tab ${category === item.id ? "is-active" : ""}`}
                    onClick={() => setCategory(item.id)}
                    disabled={busy}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <input
                id="voice-search"
                className="field"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm: podcast, nữ, nam, kể chuyện…"
              />
              <div
                className="voice-list"
                role="listbox"
                aria-label="Danh sách giọng"
              >
                {filteredVoices.map((voice) => (
                  <button
                    key={voice.id}
                    type="button"
                    role="option"
                    aria-selected={voice.id === voiceId}
                    className={`voice-item ${voice.id === voiceId ? "is-active" : ""}`}
                    onClick={() => setVoiceId(voice.id)}
                    disabled={busy}
                  >
                    <span className="voice-name">
                      {voice.name}
                      {voice.category === "podcast" ? (
                        <span className="voice-badge">Podcast</span>
                      ) : null}
                    </span>
                    <span className="voice-lang">
                      {voice.gender} · {voice.localeLabel}
                    </span>
                    <span className="voice-blurb">{voice.blurb}</span>
                  </button>
                ))}
                {filteredVoices.length === 0 && (
                  <p className="empty">Không tìm thấy giọng phù hợp.</p>
                )}
              </div>
            </section>

            <section className="panel">
              <div className="panel-top">
                <span>Điều chỉnh</span>
              </div>
              <label className="slider">
                <span>Tốc độ · {rate.toFixed(2)}x</span>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  disabled={busy}
                />
              </label>
              <label className="slider">
                <span>Cao độ · {pitch.toFixed(2)}</span>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  disabled={busy}
                />
              </label>
              <p className="hint">
                Giọng podcast đã chỉnh sẵn nhịp đọc. Bạn vẫn có thể tinh chỉnh thêm.
              </p>
            </section>

            <section className="panel">
              <div className="panel-top">
                <span>Gần đây</span>
              </div>
              {history.length === 0 ? (
                <p className="empty">Chưa có lịch sử.</p>
              ) : (
                <div className="history-list">
                  {history.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="history-item"
                      onClick={() => setText(item)}
                      title={item}
                      disabled={busy}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </form>
      </main>
    </div>
  );
}
