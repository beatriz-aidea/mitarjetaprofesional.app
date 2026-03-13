import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, UserPlus } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1022] text-[#FAF7F5] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D61E51]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black tracking-tighter mb-2">Registro</h1>
            <p className="text-[10px] font-bold text-[#D61E51] uppercase tracking-widest">Crea tu cuenta única</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold uppercase tracking-wider">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} className="text-[#D61E51]" /> Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D61E51] focus:border-transparent transition-all placeholder:text-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} className="text-[#D61E51]" /> Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D61E51] focus:border-transparent transition-all placeholder:text-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} className="text-[#D61E51]" /> Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D61E51] focus:border-transparent transition-all placeholder:text-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-[#D61E51] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-[#b51844] transition-all shadow-lg shadow-[#D61E51]/20 uppercase tracking-widest disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Crear Cuenta <UserPlus size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[11px] text-white/50 font-bold uppercase tracking-widest">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#D61E51] hover:text-white transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
