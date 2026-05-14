import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero section relative overflow-hidden">
        <div className="container mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gold-pale border border-gold/30 rounded-full">
              <span className="text-sm font-bold text-gold">✨ TERPERCAYA</span>
            </div>

            <h1 className="font-bebas text-5xl md:text-6xl text-navy mb-4 leading-tight">
              <span className="block">Bimbingan CPNS</span>
              <span className="block text-gold">SKD Terbaik</span>
            </h1>

            <p className="text-lg text-muted mb-8 leading-relaxed max-w-md">
              Bimbingan intensif dengan <strong>trik eksklusif</strong>. Mentor berpengalaman raih <strong>skor 470</strong>. Terbukti lolos CPNS 2024.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn btn-gold">
                Mulai Belajar <ArrowRight size={18} />
              </Link>
              <a href="#keunggulan" className="btn btn-outline">
                Lihat Keunggulan
              </a>
            </div>
          </div>
        </div>

        {/* Hero Cards */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
          <div className="card w-60">
            <p className="text-xs uppercase font-bold text-muted mb-2">Lulus CPNS 2024</p>
            <p className="font-bebas text-4xl text-gold">240+</p>
            <p className="text-xs text-muted mt-2">Alumni berhasil lolos</p>
            <span className="inline-block mt-3 px-3 py-1 text-xs bg-green-100 text-green font-bold rounded-full">
              ✓ Terbukti Lolos
            </span>
          </div>
          <div className="card w-60">
            <p className="text-xs uppercase font-bold text-muted mb-2">Skor Tertinggi</p>
            <p className="font-bebas text-4xl text-gold">470</p>
            <p className="text-xs text-muted mt-2">Mentor raih skor maksimal</p>
          </div>
        </div>
      </section>

      {/* Score Strip */}
      <section className="bg-navy py-12">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-gold to-gold-light rounded-xl p-8 text-navy">
            <h2 className="font-bebas text-3xl mb-2">Skor 470 SKD</h2>
            <p className="text-navy/80">
              Mentor kami telah membuktikan sistem bimbingan dengan skor tertinggi. <strong>Sistem trik yang terbukti efektif</strong> meningkatkan skor hingga 470 poin.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Alumni Lolos', value: '240+' },
              { label: 'Skor Tertinggi', value: '470' },
              { label: 'Tahun Berdiri', value: '2020' },
              { label: 'Kepuasan', value: '98%' },
            ].map((stat, i) => (
              <div key={i} className="card text-center">
                <p className="text-xs uppercase text-muted font-bold mb-2">{stat.label}</p>
                <p className="font-bebas text-4xl text-gold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section className="section bg-cream2" id="keunggulan">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bebas text-4xl text-navy mb-2">Keunggulan Kami</h2>
            <p className="text-muted">Sistem bimbingan terbaik dengan teknologi modern</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'Fokus TWK, TIU, TKP',
                desc: 'Materi terstruktur mengikuti pola SKD terbaru',
              },
              {
                icon: '👨‍🏫',
                title: 'Mentor Berpengalaman',
                desc: 'Mentor dengan track record lolos CPNS berkali-kali',
              },
              {
                icon: '⏱️',
                title: 'Waktu Fleksibel',
                desc: 'Belajar kapan saja, di mana saja sesuai ritme Anda',
              },
              {
                icon: '📊',
                title: 'Tryout Unlimited',
                desc: 'Latihan soal unlimited dengan pembahasan detail',
              },
              {
                icon: '💬',
                title: 'Support 24/7',
                desc: 'Bantuan kapan pun Anda membutuhkan',
              },
              {
                icon: '📈',
                title: 'Analytics Real-time',
                desc: 'Tracking progress dan rekomendasi personal',
              },
            ].map((item, i) => (
              <div key={i} className="card">
                <p className="text-3xl mb-3">{item.icon}</p>
                <h3 className="font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni Section */}
      <section className="section" id="alumni">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bebas text-4xl text-navy mb-2">Alumni Sukses</h2>
            <p className="text-muted">Kisah nyata dari alumni yang lolos CPNS</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                name: 'Rini Putri',
                position: 'Lolos CPNS 2024',
                score: 420,
                quote: 'Metode belajar di Ultron sangat efektif. Saya lolos dengan skor 420!',
              },
              {
                name: 'Budi Santoso',
                position: 'Lolos CPNS 2024',
                score: 398,
                quote: 'Mentor-mentornya sangat membantu. Saya tidak pernah berharap lolos!',
              },
            ].map((alumnus, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-navy">{alumnus.name}</p>
                    <p className="text-xs text-muted">{alumnus.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bebas text-2xl text-gold">{alumnus.score}</p>
                    <p className="text-xs text-muted">Nilai SKD</p>
                  </div>
                </div>
                <p className="text-sm text-muted italic">"{alumnus.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-navy">
        <div className="container mx-auto text-center text-white">
          <h2 className="font-bebas text-5xl mb-4">Mulai Belajar Sekarang</h2>
          <p className="text-lg text-gold-light mb-8 max-w-md mx-auto">
            Jangan tunggu lagi! Ratusan alumni sudah membuktikan efektivitas sistem kami.
          </p>
          <Link to="/register" className="btn bg-gold text-navy hover:bg-gold-light">
            Daftar Gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
