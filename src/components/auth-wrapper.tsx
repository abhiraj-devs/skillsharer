'use client';
import { useSession } from 'next-auth/react';
import SideNav from './side-nav';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const loading = status === 'loading';
  const isAuthPage = pathname === '/auth';
  const isPublicPage = isAuthPage; // Add other public pages here if any

  useEffect(() => {
    if (!loading && !session && !isPublicPage) {
      router.push(`/auth?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [loading, session, isPublicPage, pathname, router]);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!session) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Redirecting to login...</p>
      </div>
    );
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
