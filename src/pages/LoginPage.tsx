import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await login(data.username, data.password);
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Card */}
      <div className="bg-white border-2 border-border rounded-2xl p-12 shadow-lg animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-3xl text-navy mb-2">Ultron Bimbel</h1>
          <p className="text-sm text-gold font-bold uppercase tracking-widest">Admin Panel</p>
          <h2 className="font-bebas text-2xl text-navy mt-4">Selamat Datang</h2>
          <p className="text-sm text-muted mt-1">Masuk untuk mengelola platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-2 tracking-wider">
              Username
            </label>
            <input
              {...register('username')}
              type="text"
              placeholder="Username"
              className={`input ${errors.username ? 'input-error' : ''}`}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-gold w-full mt-7 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Masuk
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-gold-pale border border-gold/30 rounded-lg text-center">
          <p className="text-xs text-muted">
            🔒 Koneksi aman. Sesi akan berakhir otomatis setelah 30 menit tidak aktif.
          </p>
        </div>

        {/* Help Link */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-muted hover:text-gold transition">
            ← Kembali ke halaman utama
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
