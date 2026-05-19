import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="hero-eyebrow">BIMBINGAN CPNS TERPERCAYA</div>
            <h1>
              LOLOS CPNS
              <em>BUKAN KEBERUNTUNGAN</em>
            </h1>
            <p className="hero-sub">
              Bimbingan intensif SKD dengan <strong>trik eksklusif</strong>, mentor yang pernah
              raih skor <strong>470 SKD</strong>, dan metode yang sudah terbukti lulus.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn-primary">Mulai Sekarang</Link>
              <a href="#alumni" className="btn-secondary">Lihat Alumni Lulus</a>
            </div>
          </div>

          <div className="hero-sidebar">
            <div className="stat-card">
              <div className="stat-card-label">Skor SKD Mentor</div>
              <div className="stat-card-num">470</div>
              <div className="stat-card-desc">dari 550 poin — hasil nyata bukan klaim</div>
              <div className="badge-lulus">Terbukti Lulus</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Batch Pertama</div>
              <div className="stat-card-num">2</div>
              <div className="stat-card-desc">alumni berhasil lolos CPNS 2024</div>
              <div className="badge-lulus">Terbukti Lulus</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROOF STRIP ===== */}
      <section className="proof-strip">
        <div className="wrap proof-inner">
          <div className="proof-score">
            <div className="proof-score-num">470</div>
            <div className="proof-score-label">SKD Score</div>
          </div>
          <div className="proof-text">
            <h3>Bukti Nyata dari Mentor Kami</h3>
            <p>
              Mentor kami telah mencapai skor{' '}
              <span className="hl">470 SKD dari 550 poin</span>, dan metode yang diajarkan
              telah membuahkan hasil dengan alumni yang berhasil lolos CPNS 2024. Ini bukan
              sekadar klaim, tapi hasil yang terukur dan dapat diverifikasi.
            </p>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="numbers">
        <div className="wrap">
          <div className="numbers-grid">
            {[
              { val: '2+', desc: 'Alumni Lulus CPNS 2024' },
              { val: '470', desc: 'Skor SKD Mentor' },
              { val: '100%', desc: 'Metode Terbukti Efektif' },
              { val: '24/7', desc: 'Akses Materi & Support' },
            ].map((item, i) => (
              <div key={i} className="num-card">
                <div className="num-card-val">{item.val}</div>
                <div className="num-card-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ALUMNI ===== */}
      <section id="alumni" className="numbers" style={{ background: 'var(--c-white)' }}>
        <div className="wrap">
          <div className="sec-header">
            <h2>Alumni Kami yang <span className="accent">LOLOS</span></h2>
            <p>Kisah sukses dari peserta bimbingan kami</p>
          </div>
          <div
            className="numbers-grid"
            style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}
          >
            {[
              {
                name: 'Hilarry Sri Rizky',
                score: '428',
                location: '📍 Pemerintah Provinsi Sumatera Barat',
                quote:
                  '"Bimbingan dari Ultron benar-benar membantu saya memahami pola soal strategis. Alhamdulillah berhasil lolos CPNS 2024!"',
              },
              {
                name: 'Nolvia Elisia',
                score: '395',
                location: '📍 Apoteker – Kejaksaan RI',
                quote:
                  '"Materi lengkap, pengajar sabar dan detail. Grup diskusinya aktif, jadi belajar lebih ringan. Alhamdulillah langsung lolos!"',
              },
            ].map((a, i) => (
              <div key={i} className="num-card">
                <div className="stat-card-label" style={{ marginBottom: 12 }}>{a.name}</div>
                <div className="num-card-val" style={{ fontSize: '2.2rem', color: 'var(--c-gold)' }}>
                  {a.score}
                </div>
                <div
                  style={{
                    fontSize: '.75rem',
                    color: 'var(--c-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '.8px',
                    marginBottom: 12,
                    fontWeight: 600,
                  }}
                >
                  Skor SKD CPNS 2024
                </div>
                <p style={{ color: 'var(--c-muted)', fontSize: '.85rem', lineHeight: 1.6, marginBottom: 16 }}>
                  {a.location}
                </p>
                <p
                  style={{
                    color: 'var(--c-ink)',
                    fontSize: '.85rem',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    borderLeft: '2px solid var(--c-gold)',
                    paddingLeft: 12,
                    marginBottom: 12,
                  }}
                >
                  {a.quote}
                </p>
                <div className="badge-lulus" style={{ marginTop: 12 }}>✓✓ Terbukti Lulus</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MENTOR ===== */}
      <section
        id="mentor"
        className="numbers"
        style={{
          background: 'var(--c-bg2)',
          padding: '72px 0',
          borderTop: '1px solid var(--c-border)',
          borderBottom: '1px solid var(--c-border)',
        }}
      >
        <div className="wrap">
          <div className="sec-header">
            <h2>
              Mentor Kami yang <span className="accent">BERPENGALAMAN</span>
            </h2>
            <p>Dipimpin oleh mentor dengan track record terbukti</p>
          </div>
          <div
            style={{
              background: 'var(--c-white)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-lg)',
              padding: '44px 40px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', gap: 44, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flexShrink: 0, width: 140, textAlign: 'center' }}>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--c-navy), var(--c-navy2))',
                    border: '3px solid var(--c-gold)',
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 50,
                    fontWeight: 'bold',
                    color: 'var(--c-gold)',
                  }}
                >
                  B
                </div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--c-muted)', marginBottom: 8 }}>
                  @bigbalb_
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    background: 'var(--c-gold-pale)',
                    color: 'var(--c-gold)',
                    border: '1px solid var(--c-gold-border)',
                    borderRadius: 6,
                    fontSize: '.62rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Verified Mentor
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-navy)', marginBottom: 10 }}>
                  Mentor Berpengalaman
                </h3>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.8, fontSize: '.9375rem', marginBottom: 22 }}>
                  Mentor kami telah memiliki pengalaman{' '}
                  <span style={{ color: 'var(--c-gold)', fontWeight: 700 }}>5+ tahun</span> dalam
                  persiapan CPNS SKD. Telah membimbing{' '}
                  <span style={{ color: 'var(--c-gold)', fontWeight: 700 }}>100+ peserta</span> mencapai
                  skor di atas 400, dengan track record{' '}
                  <span style={{ color: 'var(--c-gold)', fontWeight: 700 }}>470 SKD</span> yang terbukti
                  lolos.
                </p>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {[
                    { val: '5+', label: 'Tahun' },
                    { val: '100+', label: 'Peserta' },
                    { val: '470', label: 'Skor SKD' },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        textAlign: 'center',
                        padding: '14px 20px',
                        background: 'var(--c-bg)',
                        border: '1px solid var(--c-border)',
                        borderRadius: 12,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: '2.2rem',
                          color: 'var(--c-gold)',
                          lineHeight: 1,
                        }}
                      >
                        {s.val}
                      </div>
                      <div
                        style={{
                          fontSize: '.68rem',
                          color: 'var(--c-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          fontWeight: 700,
                          marginTop: 3,
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROGRAM ===== */}
      <section
        className="numbers"
        style={{ background: 'var(--c-white)', padding: '72px 0', borderBottom: '1px solid var(--c-border)' }}
      >
        <div className="wrap">
          <div className="sec-header">
            <h2>
              Program Bimbingan<span className="accent"> Lengkap</span>
            </h2>
            <p>Fasilitas & metode terbukti untuk persiapan CPNS SKD</p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 36,
              maxWidth: 1000,
              margin: '0 auto',
            }}
          >
            {/* Fasilitas */}
            <div
              style={{
                background: 'var(--c-bg)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-lg)',
                padding: '32px 28px',
              }}
            >
              <h3
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '1.6rem',
                  letterSpacing: 1.5,
                  color: 'var(--c-navy)',
                  marginBottom: 20,
                }}
              >
                Fasilitas Bimbingan
              </h3>
              {[
                { title: 'E-Book Materi SKD Lengkap', desc: 'Materi komprehensif meliputi TWK, TIU, dan TKP' },
                { title: 'Tryout Relevan & Sistem CAN BKN', desc: '20+ simulasi ujian dengan sistem resmi' },
                { title: 'Frequent Review (FR) SKD', desc: 'Ulang pembahasan materi tahun-tahun sebelumnya' },
                { title: 'Tips Jitu Eksklusif', desc: 'Tips jalur langit, tips mental, & strategi menjawab' },
                { title: 'Konsultasi Private & Grup', desc: 'Diskusi dengan mentor hingga tuntas' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 4 ? 16 : 0 }}>
                  <span style={{ color: 'var(--c-gold)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--c-ink)', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--c-muted)', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div
              style={{
                background: 'var(--c-gold-pale)',
                border: '2px solid var(--c-gold-border)',
                borderRadius: 'var(--r-lg)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '3.5rem',
                    color: 'var(--c-gold)',
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  Hanya 350K
                </div>
                <div style={{ fontSize: '.9rem', color: 'var(--c-muted)', textDecoration: 'line-through' }}>
                  Harga Normal 500K
                </div>
              </div>
              <div
                style={{
                  background: 'var(--c-white)',
                  borderRadius: 10,
                  padding: 20,
                  marginBottom: 20,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--c-navy)', marginBottom: 8, fontSize: '.95rem' }}>
                  Akses Penuh Ke:
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--c-muted)', lineHeight: 1.8 }}>
                  ✓ E-Book Eksklusif<br />
                  ✓ Pembelajaran Mandiri<br />
                  ✓ Konsultasi Private
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(168,96,14,.1)',
                  borderLeft: '3px solid var(--c-gold)',
                  padding: 16,
                  borderRadius: 6,
                }}
              >
                <div style={{ fontSize: '.8rem', color: 'var(--c-navy)', lineHeight: 1.6, fontWeight: 600 }}>
                  ⏰ Kesempatan tidak datang dua kali, tapi persiapan bisa kamu ulang setiap hari.
                  Jadilah bagian dari mereka yang berhasil!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <h2>
          Siap <span>LOLOS</span> CPNS?
        </h2>
        <p>
          Bergabunglah dengan ratusan peserta yang telah berhasil melalui program bimbingan kami.
          Jangan biarkan kesempatan ini berlalu.
        </p>
        <Link to="/login" className="btn-primary">
          Daftar Sekarang
        </Link>
      </section>

      {/* ===== WA FLOAT ===== */}
      <div className="wa-float">
        <a
          href="https://wa.me/62895316626256"
          className="wa-btn"
          title="Hubungi via WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width={28} height={28}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.934 1.349c-1.532.959-2.72 2.589-2.72 4.509 0 2.13 1.193 4.01 3.1 4.775l-3.272 1.197c-.667.243-.614.96.104 1.16l3.62 1.25c1.04.36 2.187.36 3.227 0l3.62-1.25c.718-.2.771-.917.104-1.16l-3.272-1.197c1.907-.765 3.1-2.646 3.1-4.775 0-1.92-1.188-3.55-2.72-4.509a9.87 9.87 0 00-4.934-1.349" />
          </svg>
        </a>
      </div>

    </div>
  );
};

export default HomePage;