'use client';
import { useAuth } from '@/hooks/use-auth';
import SideNav from './side-nav';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/auth';
  const isPublicPage = isAuthPage;

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicPage) {
      router.push(`/auth?callbackUrl=${encodeURIComponent(pathname)}`);
    }
    if (!loading && isAuthenticated && isAuthPage) {
        router.push('/');
    }
  }, [loading, isAuthenticated, isPublicPage, pathname, router, isAuthPage]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated && !isPublicPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Redirecting to login...</p>
      </div>
    );
  }

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen w-full">
      <SideNav />
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
