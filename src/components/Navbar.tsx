import { Link, NavLink } from "react-router-dom";
import {
  BRAND_CONTACT,
  BRAND_NAME,
  BRAND_PHONE,
  BRAND_PHONE_TEL,
  BRAND_TAGLINE,
} from "../data/brand";
import "./Navbar.css";

type NavbarProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  compact?: boolean;
};

function BrandBlock() {
  return (
    <div className="brand">
      <Link to="/" className="brand-main" aria-label={`Trang chủ ${BRAND_NAME}`}>
        <span className="brand-mark" aria-hidden />
        <span className="brand-name">{BRAND_NAME}</span>
      </Link>
      <a className="brand-sub" href={BRAND_PHONE_TEL} aria-label={BRAND_CONTACT}>
        <span className="brand-sub-label">{BRAND_TAGLINE}</span>
        <span className="brand-sub-phone">{BRAND_PHONE}</span>
      </a>
    </div>
  );
}

export default function Navbar({ theme, onToggleTheme, compact }: NavbarProps) {
  return (
    <header className={`nav ${compact ? "nav-compact" : ""}`}>
      <div className="container nav-inner">
        <BrandBlock />

        {!compact && (
          <nav className="nav-links" aria-label="Chính">
            <a href="#features">Tính năng</a>
            <a href="#how">Cách dùng</a>
            <a href="#contact">Liên hệ</a>
          </nav>
        )}

        <div className="nav-actions">
          <a className="btn btn-ghost nav-call" href={BRAND_PHONE_TEL}>
            Gọi ngay
          </a>
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === "light" ? "Bật chế độ tối" : "Bật chế độ sáng"}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>
          <Link to="/app" className="btn btn-primary nav-cta">
            Mở xưởng đọc
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StudioNav({
  theme,
  onToggleTheme,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  return (
    <header className="nav nav-compact">
      <div className="container nav-inner">
        <BrandBlock />
        <nav className="nav-links" aria-label="Xưởng đọc">
          <NavLink to="/app" end>
            Đọc văn bản
          </NavLink>
        </nav>
        <div className="nav-actions">
          <a className="btn btn-ghost nav-call" href={BRAND_PHONE_TEL}>
            Gọi ngay
          </a>
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === "light" ? "Bật chế độ tối" : "Bật chế độ sáng"}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>
        </div>
      </div>
    </header>
  );
}
