'use client';
import { useAuth } from '@/hooks/use-auth';
import SideNav from './side-nav';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pathname === '/auth') {
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
