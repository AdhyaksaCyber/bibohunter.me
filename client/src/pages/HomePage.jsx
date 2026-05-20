import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar-landing">
        <a href="/" className="navbar-logo">Ultron<span>Bimbel</span></a>
        <div className="navbar-links">
          <a href="#numbers">Statistik</a>
          <a href="#proof">Testimoni</a>
          <a href="#cta">Daftar</a>
          <Link to="/login" className="btn-primary" style={{ padding: '9px 22px', fontSize: '.85rem' }}>
            Masuk
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-eyebrow">Bimbingan SKD CPNS Terbaik</div>
              <h1>
                Lolos CPNS
                <em>Bersama Kami</em>
              </h1>
              <p className="hero-sub">
                Bimbingan intensif SKD dengan <strong>trik eksklusif</strong> dari mentor
                berpengalaman. Skor mentor kami <strong>470 SKD</strong> — terbukti lolos CPNS 2024.
              </p>
              <div className="hero-actions">
                <a
                  href="https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20daftar%20bimbel%20SKD"
                  className="btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.12 1.523 5.851L.057 23.571a.5.5 0 00.614.614l5.72-1.466A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.666-.523-5.181-1.433l-.371-.22-3.843.985.999-3.733-.241-.386A9.939 9.939 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Daftar via WhatsApp
                </a>
                <Link to="/login" className="btn-secondary">
                  Sudah Punya Akun →
                </Link>
              </div>
            </div>

            {/* SIDEBAR STAT CARDS */}
            <div className="hero-sidebar">
              <div className="stat-card">
                <div className="stat-card-label">Skor SKD Mentor</div>
                <div className="stat-card-num">470</div>
                <div className="stat-card-desc">Dari 550 — masuk top 1% nasional</div>
                <div className="badge-lulus">Lolos 2024</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Alumni Lolos</div>
                <div className="stat-card-num">138+</div>
                <div className="stat-card-desc">Tersebar di 12 instansi berbeda</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Sesi Bimbingan</div>
                <div className="stat-card-num">500+</div>
                <div className="stat-card-desc">Jam bimbingan intensif sejak 2022</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="proof-strip" id="proof">
        <div className="wrap">
          <div className="proof-inner">
            <div className="proof-score">
              <div className="proof-score-num">470</div>
              <div className="proof-score-label">Skor SKD</div>
            </div>
            <div className="proof-text">
              <h3>Mentor kami bukan sekadar pengajar — kami pernah ada di posisi kamu</h3>
              <p>
                Dengan skor <span className="hl">TWK 150 · TIU 160 · TKP 160</span>, mentor kami
                membuktikan metode yang diajarkan benar-benar bekerja. Bukan teori — tapi
                strategi nyata yang sudah diuji di ujian resmi CPNS 2024.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="numbers" id="numbers">
        <div className="wrap">
          <div className="sec-header">
            <h2>Angka yang <span className="accent">Bicara Sendiri</span></h2>
            <p>Hasil nyata dari bimbingan yang terstruktur dan konsisten</p>
          </div>
          <div className="numbers-grid">
            <div className="num-card">
              <div className="num-card-val">138+</div>
              <div className="num-card-desc">Alumni Lolos CPNS</div>
            </div>
            <div className="num-card">
              <div className="num-card-val">92%</div>
              <div className="num-card-desc">Tingkat Kelulusan SKD</div>
            </div>
            <div className="num-card">
              <div className="num-card-val">470</div>
              <div className="num-card-desc">Skor Tertinggi Mentor</div>
            </div>
            <div className="num-card">
              <div className="num-card-val">12</div>
              <div className="num-card-desc">Instansi yang Berhasil Ditembus</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="cta">
        <h2>Siap <span>Lolos</span> CPNS?</h2>
        <p>Bergabunglah dengan ratusan alumni yang sudah buktikan metode kami. Daftar sekarang sebelum kuota penuh.</p>
        <a
          href="https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20daftar%20bimbel%20SKD"
          className="btn-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Daftar Sekarang via WhatsApp
        </a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2025 Ultron Bimbel · <a href="/login">Login</a> · <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
      </footer>

      {/* WA FLOAT */}
      <div className="wa-float">
        <a
          href="https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20tanya%20tentang%20bimbel%20SKD"
          className="wa-btn"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat WhatsApp"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.12 1.523 5.851L.057 23.571a.5.5 0 00.614.614l5.72-1.466A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.666-.523-5.181-1.433l-.371-.22-3.843.985.999-3.733-.241-.386A9.939 9.939 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
        </a>
      </div>
    </>
  );
}