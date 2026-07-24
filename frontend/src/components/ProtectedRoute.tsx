'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Role } from '@/types';

export default function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: Role[] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
    if (!loading && isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) router.push('/dashboard');
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
