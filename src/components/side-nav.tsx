'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Briefcase,
  LayoutGrid,
  MessageSquare,
  User,
  PencilRuler,
  LogIn,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutGrid,
  },
  {
    href: '/services',
    label: 'Services',
    icon: Briefcase,
  },
  {
    href: '/requests',
    label: 'Requests',
    icon: PencilRuler,
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: MessageSquare,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
];

export default function SideNav() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  if (pathname === '/auth') {
    return null;
  }
  
  return (
    <aside className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur-sm md:relative md:h-screen md:w-60 md:border-r md:border-t-0 md:bg-background">
      <div className="flex h-full flex-col">
        <div className="hidden items-center gap-2 border-b px-4 py-5 md:flex">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold font-headline text-foreground">
            StudentHub
          </h1>
        </div>
        <nav className="flex-1">
          <TooltipProvider delayDuration={0}>
            <ul className="flex h-full flex-row items-center justify-around md:flex-col md:items-stretch md:justify-start md:p-4">
              {user &&
                navItems.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.label}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 rounded-md p-3 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:justify-start',
                              'flex-col justify-center text-xs md:flex-row md:text-sm',
                              isActive &&
                                'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="mt-1 md:mt-0">{item.label}</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="flex items-center gap-4 md:hidden"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  );
                })}
              {!user && !loading && (
                 <li className="flex-1 flex items-center justify-center md:items-end">
                    <Link href="/auth" passHref>
                        <Button className="w-full">
                            <LogIn className="mr-2" />
                            Login
                        </Button>
                    </Link>
                 </li>
              )}
            </ul>
          </TooltipProvider>
        </nav>
        <div className="hidden md:block border-t p-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL!} alt={user.displayName!} data-ai-hint="person" />
                  <AvatarFallback>
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user.displayName || user.email}
                  </p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={signOut}>
                      <LogOut />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sign Out</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
             <Link href="/auth" passHref>
                <Button className="w-full">
                    <LogIn className="mr-2" />
                    Login / Register
                </Button>
             </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
