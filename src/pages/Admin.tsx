import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BRAND_NAME } from "../data/brand";
import "./Admin.css";

type DayRow = {
  date: string;
  visits: number;
  pageviews: number;
  tts: number;
  landing: number;
  studio: number;
};

type StatsResponse = {
  today: DayRow;
  lastDays: DayRow[];
  totals: { visits: number; pageviews: number; tts: number };
  timezone: string;
};

function StatsChart({ rows }: { rows: DayRow[] }) {
  const chronological = [...rows].reverse();
  const max = Math.max(
    1,
    ...chronological.flatMap((r) => [r.visits, r.tts, r.pageviews]),
  );

  return (
    <div className="admin__chart">
      <div className="admin__chart-head">
        <h2>Sơ đồ 14 ngày</h2>
        <div className="admin__legend">
          <span className="admin__legend-item admin__legend-item--visits">
            Truy cập
          </span>
          <span className="admin__legend-item admin__legend-item--tts">
            Tạo giọng
          </span>
          <span className="admin__legend-item admin__legend-item--views">
            Xem trang
          </span>
        </div>
      </div>
      <div className="admin__chart-body" role="img" aria-label="Biểu đồ thống kê 14 ngày">
        {chronological.map((row) => {
          const label = row.date.slice(5); // MM-DD
          return (
            <div className="admin__bar-col" key={row.date} title={`${row.date}`}>
              <div className="admin__bars">
                <div
                  className="admin__bar admin__bar--visits"
                  style={{ height: `${(row.visits / max) * 100}%` }}
                  title={`Truy cập: ${row.visits}`}
                />
                <div
                  className="admin__bar admin__bar--tts"
                  style={{ height: `${(row.tts / max) * 100}%` }}
                  title={`Tạo giọng: ${row.tts}`}
                />
                <div
                  className="admin__bar admin__bar--views"
                  style={{ height: `${(row.pageviews / max) * 100}%` }}
                  title={`Xem trang: ${row.pageviews}`}
                />
              </div>
              <span className="admin__bar-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState(() =>
    sessionStorage.getItem("annhien-admin-pass") ?? "",
  );
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStats(pass: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      const data = (await res.json()) as StatsResponse & { error?: string };
      if (!res.ok) {
        setStats(null);
        setError(data.error || "Không đăng nhập được.");
        return;
      }
      sessionStorage.setItem("annhien-admin-pass", pass);
      setStats(data);
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void loadStats(password);
  }

  return (
    <main className="admin">
      <header className="admin__header">
        <div>
          <p className="admin__eyebrow">Admin</p>
          <h1>{BRAND_NAME}</h1>
          <p className="admin__sub">Thống kê lượt truy cập & tạo giọng</p>
        </div>
        <Link to="/" className="admin__back">
          ← Về trang chủ
        </Link>
      </header>

      {!stats ? (
        <form className="admin__login" onSubmit={onSubmit}>
          <label>
            Mật khẩu admin
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="admin__error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "Đang tải…" : "Xem dashboard"}
          </button>
        </form>
      ) : (
        <section className="admin__panel">
          <div className="admin__actions">
            <button type="button" onClick={() => void loadStats(password)}>
              Làm mới
            </button>
            <button
              type="button"
              className="admin__ghost"
              onClick={() => {
                sessionStorage.removeItem("annhien-admin-pass");
                setStats(null);
                setPassword("");
              }}
            >
              Đăng xuất
            </button>
          </div>

          <div className="admin__cards">
            <article>
              <span>Hôm nay · truy cập</span>
              <strong>{stats.today.visits}</strong>
            </article>
            <article>
              <span>Hôm nay · xem trang</span>
              <strong>{stats.today.pageviews}</strong>
            </article>
            <article>
              <span>Hôm nay · tạo giọng</span>
              <strong>{stats.today.tts}</strong>
            </article>
            <article>
              <span>14 ngày · truy cập</span>
              <strong>{stats.totals.visits}</strong>
            </article>
          </div>

          <p className="admin__hint">
            Ngày theo múi giờ {stats.timezone}. Mỗi trình duyệt tính 1 lần truy
            cập / phiên.
          </p>

          <StatsChart rows={stats.lastDays} />

          <div className="admin__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Truy cập</th>
                  <th>Xem trang</th>
                  <th>Landing</th>
                  <th>Studio</th>
                  <th>Tạo giọng</th>
                </tr>
              </thead>
              <tbody>
                {stats.lastDays.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.visits}</td>
                    <td>{row.pageviews}</td>
                    <td>{row.landing}</td>
                    <td>{row.studio}</td>
                    <td>{row.tts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
