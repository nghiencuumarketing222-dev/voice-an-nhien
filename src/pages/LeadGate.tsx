import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StudioNav } from "../components/Navbar";
import { BRAND_NAME, BRAND_CONTACT } from "../data/brand";
import "./LeadGate.css";

const ACCESS_KEY = "annhien-user";

type LeadGateProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function hasStudioAccess(): boolean {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { name?: string; phone?: string; email?: string };
    return Boolean(parsed.name && parsed.phone && parsed.email);
  } catch {
    return false;
  }
}

export default function LeadGate({ theme, onToggleTheme }: LeadGateProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });
      const data = (await res.json()) as {
        error?: string;
        lead?: { name: string; phone: string; email: string };
      };
      if (!res.ok || !data.lead) {
        setError(data.error || "Không gửi được thông tin.");
        return;
      }
      localStorage.setItem(
        ACCESS_KEY,
        JSON.stringify({
          name: data.lead.name,
          phone: data.lead.phone,
          email: data.lead.email,
        }),
      );
      navigate("/app", { replace: true });
    } catch {
      setError("Không kết nối được máy chủ. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lead-gate">
      <StudioNav theme={theme} onToggleTheme={onToggleTheme} />
      <main className="lead-gate__main">
        <div className="lead-gate__card">
          <p className="lead-gate__eyebrow">Bắt đầu miễn phí</p>
          <h1>Điền thông tin để dùng {BRAND_NAME}</h1>
          <p className="lead-gate__sub">
            Chỉ một lần — sau đó bạn vào thẳng xưởng đọc podcast.{" "}
            {BRAND_CONTACT}
          </p>

          <form className="lead-gate__form" onSubmit={onSubmit}>
            <label>
              Họ và tên
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                required
              />
            </label>
            <label>
              Số điện thoại
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx"
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@email.com"
                autoComplete="email"
                required
              />
            </label>

            {error ? <p className="lead-gate__error">{error}</p> : null}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang mở…" : "Vào dùng ngay"}
            </button>
          </form>

          <p className="lead-gate__note">
            Thông tin chỉ dùng để hỗ trợ / liên hệ từ {BRAND_NAME}.{" "}
            <Link to="/">Quay lại trang chủ</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
