import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const RECAPTCHA_SITE_KEY = '6LfW2e0sAAAAAJz3QU6fZCgigGFVha-Cb5jUue_3';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rcReady, setRcReady] = useState(false);
  const recaptchaRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect jika sudah login
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated]);

  // Load reCAPTCHA script
  useEffect(() => {
    if (document.getElementById('recaptcha-script')) {
      setRcReady(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = 'https://www.google.com/recaptcha/api.js?onload=rcLoaded&render=explicit';
    script.async = true;
    script.defer = true;
    (window as any).rcLoaded = () => {
      recaptchaRef.current = window.grecaptcha.render('recaptcha-container', {
        sitekey: RECAPTCHA_SITE_KEY,
      });
      setRcReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    if (!rcReady || !window.grecaptcha) {
      toast.error('reCAPTCHA belum siap, tunggu sebentar');
      return;
    }

    const recaptchaToken = window.grecaptcha.getResponse(recaptchaRef.current ?? undefined);
    if (!recaptchaToken) {
      toast.error('Silakan selesaikan reCAPTCHA');
      return;
    }

    setIsLoading(true);
    try {
      await login(data.email, data.password, recaptchaToken);
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login gagal');
      window.grecaptcha.reset(recaptchaRef.current ?? undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white border-2 border-border rounded-2xl p-10 shadow-lg animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-3xl text-navy mb-1">Ultron Bimbel</h1>
          <p className="text-sm text-gold font-bold uppercase tracking-widest">Portal Belajar</p>
          <h2 className="font-bebas text-2xl text-navy mt-4">Selamat Datang</h2>
          <p className="text-sm text-muted mt-1">Masuk untuk mulai belajar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-2 tracking-wider">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="email@kamu.com"
              className={`input ${errors.email ? 'input-error' : ''}`}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-2 tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <div id="recaptcha-container"></div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !rcReady}
            className="btn btn-gold w-full mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Masuk
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-muted mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-gold font-bold hover:underline">
            Daftar sekarang
          </Link>
        </p>

        {/* Security notice */}
        <div className="mt-4 p-3 bg-gold-pale border border-gold/30 rounded-lg text-center">
          <p className="text-xs text-muted">
            🔒 Koneksi aman. Sesi otomatis berakhir setelah tidak aktif.
          </p>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-muted hover:text-gold transition">
            ← Kembali ke halaman utama
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;