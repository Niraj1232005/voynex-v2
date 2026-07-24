'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TbX, TbCheck, TbBrandGoogle, TbBrandApple, TbMail, TbLock } from 'react-icons/tb';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const router = useRouter();

  // Input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.redirect) {
        setRedirectUrl(customEvent.detail.redirect);
      }
      setIsOpen(true);
    };
    window.addEventListener('openAuthModal', handleOpen);
    return () => window.removeEventListener('openAuthModal', handleOpen);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(fullName, email, password, 'user');
      }
      setIsOpen(false);
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-4xl bg-surface/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Side: Value Props */}
            <div className="md:w-5/12 bg-gradient-to-br from-primary to-teal p-8 sm:p-10 text-white flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-6">Unlock the world with VOYNEX</h2>
                <ul className="space-y-6">
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white/20 mt-1"><TbCheck size={14} /></div>
                    <div>
                      <h4 className="font-bold">Member-only prices</h4>
                      <p className="text-sm text-white/80 mt-1">Save up to 20% on selected trips.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white/20 mt-1"><TbCheck size={14} /></div>
                    <div>
                      <h4 className="font-bold">Save your dream trips</h4>
                      <p className="text-sm text-white/80 mt-1">Wishlist and compare your favorites.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white/20 mt-1"><TbCheck size={14} /></div>
                    <div>
                      <h4 className="font-bold">AI Travel Tools</h4>
                      <p className="text-sm text-white/80 mt-1">Full access to our AI Planner and Budget tools.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-7/12 p-8 sm:p-12 bg-card relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-surface-hover hover:bg-border transition-colors tap-target"
              >
                <TbX size={20} />
              </button>
              
              <h3 className="text-2xl font-bold mb-2">{isLogin ? 'Welcome back' : 'Create an account'}</h3>
              <p className="text-muted mb-6">{isLogin ? 'Enter your details to access your account.' : 'Join VOYNEX to start planning.'}</p>
              
              {errorMsg && (
                <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                {!isLogin && (
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Full Name</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Email</label>
                  <div className="relative">
                    <TbMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@example.com" className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative">
                    <TbLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                  </div>
                </div>
                
                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" className="text-xs font-bold text-accent hover:underline">Forgot password?</button>
                  </div>
                )}

                <button type="submit" className="w-full py-3.5 rounded-xl bg-accent text-white font-bold hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all tap-target mt-4">
                  {isLogin ? 'Log In' : 'Sign Up'}
                </button>
              </form>

              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative px-4 bg-card text-xs font-bold text-muted uppercase">Or continue with</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={handleSubmit} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-background hover:bg-surface-hover font-semibold transition-colors tap-target text-sm">
                  <TbBrandGoogle size={18} className="text-red-500" /> Google
                </button>
                <button type="button" onClick={handleSubmit} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-background hover:bg-surface-hover font-semibold transition-colors tap-target text-sm">
                  <TbBrandApple size={18} /> Apple
                </button>
              </div>

              <p className="text-center text-sm font-medium text-muted mt-8">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-accent font-bold hover:underline">
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
