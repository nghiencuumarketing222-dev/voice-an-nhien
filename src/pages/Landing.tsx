import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  BRAND_NAME,
  BRAND_PHONE,
  BRAND_PHONE_TEL,
  BRAND_TAGLINE,
} from "../data/brand";
import "./Landing.css";

type LandingProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

const features = [
  {
    title: "Giọng podcast tiếng Việt",
    body: "Có sẵn Podcast Nữ, Podcast Nam, Kể chuyện và Tin tức — tối ưu nhịp đọc dài.",
  },
  {
    title: "Chuyển chữ thành giọng",
    body: "Dán script, chọn giọng, chỉnh tốc độ rồi nghe ngay trong trình duyệt.",
  },
  {
    title: "Tải file MP3",
    body: "Xuất audio để đăng podcast, short, video hoặc nghe offline.",
  },
  {
    title: "Không cần đăng nhập",
    body: "Mở xưởng đọc là dùng được — không bắt buộc tài khoản Google.",
  },
  {
    title: "Lịch sử trên máy bạn",
    body: "Giữ vài đoạn văn gần nhất để mở lại nhanh khi làm việc.",
  },
  {
    title: "Nhiều kiểu giọng",
    body: "Podcast neural + giọng Việt ổn định; thêm vài ngôn ngữ khác khi cần.",
  },
];

export default function Landing({ theme, onToggleTheme }: LandingProps) {
  return (
    <div className="landing">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main>
        <section className="hero">
          <div className="container hero-inner">
            <div className="badge hero-badge">
              Giọng podcast tiếng Việt · nữ & nam
            </div>
            <h1 className="hero-brand">{BRAND_NAME}</h1>
            <a className="hero-contact" href={BRAND_PHONE_TEL}>
              <span className="hero-contact-label">{BRAND_TAGLINE}</span>
              <span className="hero-contact-phone">{BRAND_PHONE}</span>
            </a>
            <p className="hero-line">Đọc văn bản thành podcast</p>
            <p className="hero-sub">
              Biến script tiếng Việt thành giọng đọc tự nhiên — phù hợp podcast,
              review, tin tức và kể chuyện. Cần học video 1-1? Liên hệ ngay.
            </p>
            <div className="hero-cta">
              <Link to="/app" className="btn btn-primary">
                Bắt đầu miễn phí
                <span aria-hidden>→</span>
              </Link>
              <a href={BRAND_PHONE_TEL} className="btn btn-ghost">
                Học video 1-1
              </a>
            </div>

            <div className="hero-wave" aria-hidden>
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="section features">
          <div className="container">
            <h2 className="section-title">Mọi thứ bạn cần</h2>
            <p className="section-sub">
              Tập trung vào đọc tiếng Việt — mở app là có giọng podcast.
            </p>
            <div className="feature-grid">
              {features.map((item) => (
                <article key={item.title} className="feature-item">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="section how">
          <div className="container">
            <h2 className="section-title">Cách hoạt động</h2>
            <p className="section-sub">Ba bước để có tập podcast.</p>
            <ol className="how-list">
              <li>
                <strong>01</strong>
                <div>
                  <h3>Mở xưởng đọc</h3>
                  <p>Vào trang đọc, dán script tiếng Việt của bạn.</p>
                </div>
              </li>
              <li>
                <strong>02</strong>
                <div>
                  <h3>Chọn giọng podcast</h3>
                  <p>Podcast Nữ, Nam, Kể chuyện hoặc Tin tức.</p>
                </div>
              </li>
              <li>
                <strong>03</strong>
                <div>
                  <h3>Nghe và tải MP3</h3>
                  <p>Chỉnh tốc độ rồi xuất file để đăng tải.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section id="contact" className="section contact">
          <div className="container contact-inner">
            <div>
              <h2 className="section-title">Học video 1-1</h2>
              <p className="section-sub">
                Được hướng dẫn trực tiếp qua video call — liên hệ để đặt lịch.
              </p>
            </div>
            <div className="contact-card">
              <p className="contact-label">Hotline / Zalo</p>
              <a className="contact-phone" href={BRAND_PHONE_TEL}>
                {BRAND_PHONE}
              </a>
              <p className="contact-note">
                Nhắn tin hoặc gọi: {BRAND_TAGLINE}
              </p>
              <a className="btn btn-primary contact-cta" href={BRAND_PHONE_TEL}>
                Gọi {BRAND_PHONE}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand-block">
              <div className="brand-main footer-brand">
                <span className="brand-mark" aria-hidden />
                <span className="brand-name">{BRAND_NAME}</span>
              </div>
              <a className="footer-contact" href={BRAND_PHONE_TEL}>
                {BRAND_TAGLINE} · {BRAND_PHONE}
              </a>
            </div>
            <p>Giọng đọc podcast tiếng Việt cho nhà sáng tạo nội dung.</p>
          </div>
          <p className="footer-copy">
            © {new Date().getFullYear()} {BRAND_NAME}
          </p>
        </div>
      </footer>
    </div>
  );
}
