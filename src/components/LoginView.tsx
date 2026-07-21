import React, { useState } from 'react';
import { Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Could not authenticate. Please double check credentials.');
      }
    } catch (err) {
      setError('An unexpected login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate OAuth login instantly
      await onLogin('nizarar42@gmail.com', 'google-oauth');
    } catch (err) {
      setError('Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 mt-16 space-y-8" id="login-view-container">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider font-sans">
          ADMIN ACCESS
        </span>
        <h1 className="font-sans font-extrabold text-3xl text-[#1a2e26] tracking-tight">
          Welcome back.
        </h1>
        <p className="text-sm text-[#446257] max-w-sm mx-auto">
          This area is for the site owner. Public visitors don't need an account.
        </p>
      </div>

      {/* Login Card */}
      <div className="neumorph-raised rounded-2xl p-8 border border-white/40 shadow-xl space-y-6">
        
        {/* Error notification if any */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl neumorph-btn font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          id="google-signin-btn"
        >
          {/* Simple vector Google Icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200/50"></div>
          <span className="flex-shrink mx-4 text-xs font-mono text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-200/50"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-[#1e4646]/80 uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl neumorph-input text-sm text-gray-850 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1e4646]/80 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl neumorph-input text-sm text-gray-850 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-full neumorph-btn-teal font-bold text-sm disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
            id="login-submit-btn"
          >
            <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
            <ArrowRight size={14} />
          </button>

        </form>

        <p className="text-center text-xs text-gray-400">
          Need an account? <span className="text-[#1e4646] font-bold hover:underline cursor-pointer">Sign up</span>
        </p>

      </div>

    </div>
  );
}
