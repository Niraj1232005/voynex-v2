'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin') {
        router.push('/admin');
      } else if (loggedInUser.role === 'agency' || loggedInUser.organization_id) {
        router.push('/agency');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please verify your email and password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal text-white text-3xl font-bold mb-6 shadow-lg shadow-accent/20">V</div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted mt-2">Sign in to your VOYNEX account</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl">
          {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 tap-target transition-all" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Password</label>
                <button type="button" className="text-xs font-medium text-accent hover:underline tap-target">Forgot Password?</button>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 tap-target transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-foreground transition-colors tap-target">
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-teal text-white font-semibold text-lg hover:shadow-lg hover:shadow-accent/25 disabled:opacity-50 transition-all tap-target mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-8 p-4 rounded-2xl bg-surface border border-border text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Demo Accounts (1-Click Fill):</span>
              <span className="text-[10px] text-muted font-medium">Default: Password123</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('traveler@voynex.com');
                  setPassword('Password123');
                }}
                className="px-2 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-bold transition-all text-center"
              >
                🎒 Traveler
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('agency@himalayan.com');
                  setPassword('Password123');
                }}
                className="px-2 py-2 rounded-xl bg-teal/10 hover:bg-teal/20 text-teal border border-teal/20 text-[11px] font-bold transition-all text-center"
              >
                🏢 Agency
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@voynex.com');
                  setPassword('Password123');
                }}
                className="px-2 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px] font-bold transition-all text-center"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-muted mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent font-semibold hover:underline tap-target">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
