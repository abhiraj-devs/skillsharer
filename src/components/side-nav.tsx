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
  Moon,
  Sun,
  LogOut,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

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
  const { setTheme, theme } = useTheme();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/auth' });
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error logging out',
        description: error.message,
      });
    }
  };

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
              {navItems.map((item) => {
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
            </ul>
          </TooltipProvider>
        </nav>
        <div className="hidden md:flex flex-col gap-4 border-t p-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {status !== 'loading' &&
            (session ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={session.user?.image || `https://avatar.vercel.sh/${session.user?.email}`}
                      alt={session.user?.name || 'User'}
                      data-ai-hint="person"
                    />
                    <AvatarFallback>
                      {session.user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {session.user?.name || session.user?.email}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="h-auto p-0 text-xs text-muted-foreground justify-start"
                    >
                      <LogOut className="mr-1 h-3 w-3" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button asChild>
                <Link href="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            ))}
        </div>
      </div>
    </aside>
  );
}
