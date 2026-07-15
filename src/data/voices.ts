export type TtsEngine = "google" | "edge";
export type VoiceCategory = "podcast" | "thuong" | "khac";

export type EdgeVoice = {
  id: string;
  name: string;
  lang: string;
  gender: "Nữ" | "Nam";
  localeLabel: string;
  engine: TtsEngine;
  category: VoiceCategory;
  /** ID thật gửi sang Edge TTS (nếu khác id hiển thị). */
  engineVoiceId?: string;
  googleLang?: string;
  defaultRate: number;
  defaultPitch: number;
  blurb: string;
};

/** Giọng tiếng Việt trước; nhóm Podcast tối ưu nhịp đọc dài. */
export const EDGE_VOICES: EdgeVoice[] = [
  {
    id: "podcast-nu",
    name: "Podcast Nữ",
    lang: "vi-VN",
    gender: "Nữ",
    localeLabel: "Podcast · Hoài My",
    engine: "edge",
    category: "podcast",
    engineVoiceId: "vi-VN-HoaiMyNeural",
    googleLang: "vi",
    defaultRate: 0.9,
    defaultPitch: 1,
    blurb: "Giọng nữ ấm, nhịp chậm vừa — đọc bài / podcast.",
  },
  {
    id: "podcast-nam",
    name: "Podcast Nam",
    lang: "vi-VN",
    gender: "Nam",
    localeLabel: "Podcast · Nam Minh",
    engine: "edge",
    category: "podcast",
    engineVoiceId: "vi-VN-NamMinhNeural",
    googleLang: "vi",
    defaultRate: 0.92,
    defaultPitch: 0.95,
    blurb: "Giọng nam trầm, dễ nghe khi nghe dài.",
  },
  {
    id: "podcast-ke-chuyen",
    name: "Podcast Kể chuyện",
    lang: "vi-VN",
    gender: "Nữ",
    localeLabel: "Podcast · kể chuyện",
    engine: "edge",
    category: "podcast",
    engineVoiceId: "vi-VN-HoaiMyNeural",
    googleLang: "vi",
    defaultRate: 0.82,
    defaultPitch: 0.98,
    blurb: "Nhịp chậm kể chuyện, một giọng rõ ràng.",
  },
  {
    id: "podcast-tin-tuc",
    name: "Podcast Tin tức",
    lang: "vi-VN",
    gender: "Nữ",
    localeLabel: "Podcast · thời sự",
    engine: "edge",
    category: "podcast",
    engineVoiceId: "vi-VN-HoaiMyNeural",
    googleLang: "vi",
    defaultRate: 1.05,
    defaultPitch: 1,
    blurb: "Nhanh gọn, rõ chữ — đọc tin / tóm tắt.",
  },
  {
    id: "vi-google",
    name: "Giọng Việt chuẩn",
    lang: "vi-VN",
    gender: "Nữ",
    localeLabel: "Tiếng Việt · ổn định",
    engine: "google",
    category: "thuong",
    googleLang: "vi",
    defaultRate: 1,
    defaultPitch: 1,
    blurb: "Giọng Việt thông dụng, ít lỗi mạng.",
  },
  {
    id: "vi-VN-HoaiMyNeural",
    name: "Hoài My",
    lang: "vi-VN",
    gender: "Nữ",
    localeLabel: "Tiếng Việt · neural",
    engine: "edge",
    category: "thuong",
    engineVoiceId: "vi-VN-HoaiMyNeural",
    googleLang: "vi",
    defaultRate: 1,
    defaultPitch: 1,
    blurb: "Giọng nữ neural Microsoft Edge.",
  },
  {
    id: "vi-VN-NamMinhNeural",
    name: "Nam Minh",
    lang: "vi-VN",
    gender: "Nam",
    localeLabel: "Tiếng Việt · neural",
    engine: "edge",
    category: "thuong",
    engineVoiceId: "vi-VN-NamMinhNeural",
    googleLang: "vi",
    defaultRate: 1,
    defaultPitch: 1,
    blurb: "Giọng nam neural Microsoft Edge.",
  },
  {
    id: "en-google",
    name: "Tiếng Anh",
    lang: "en-US",
    gender: "Nữ",
    localeLabel: "English · ổn định",
    engine: "google",
    category: "khac",
    googleLang: "en",
    defaultRate: 1,
    defaultPitch: 1,
    blurb: "Đọc tiếng Anh khi cần.",
  },
  {
    id: "en-US-AriaNeural",
    name: "Aria",
    lang: "en-US",
    gender: "Nữ",
    localeLabel: "English · neural",
    engine: "edge",
    category: "khac",
    engineVoiceId: "en-US-AriaNeural",
    googleLang: "en",
    defaultRate: 1,
    defaultPitch: 1,
    blurb: "Giọng Anh Mỹ nữ.",
  },
  {
    id: "ja-JP-NanamiNeural",
    name: "Nanami",
    lang: "ja-JP",
    gender: "Nữ",
    localeLabel: "日本語",
    engine: "edge",
    category: "khac",
    engineVoiceId: "ja-JP-NanamiNeural",
    googleLang: "ja",
    defaultRate: 1,
    defaultPitch: 1,
    blurb: "Giọng Nhật.",
  },
  {
    id: "zh-CN-XiaoxiaoNeural",
    name: "Xiaoxiao",
    lang: "zh-CN",
    gender: "Nữ",
    localeLabel: "中文",
    engine: "edge",
    category: "khac",
    engineVoiceId: "zh-CN-XiaoxiaoNeural",
    googleLang: "zh",
    defaultRate: 1,
    defaultPitch: 1,
    blurb: "Giọng Trung.",
  },
];

export const DEFAULT_VOICE_ID = "podcast-nu";

export function toEdgePercent(value: number): string {
  const pct = Math.round((value - 1) * 100);
  if (pct === 0) return "+0%";
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

export function resolveEngineVoiceId(voice: EdgeVoice): string {
  return voice.engineVoiceId ?? voice.id;
}
