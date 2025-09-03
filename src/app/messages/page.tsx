
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Conversation, User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';


export default function MessagesListPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();


  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load conversations.' });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const getOtherUserInConvo = (convo: Conversation): User | undefined => {
    return convo.participants.find(p => p.id !== user?.id);
  }

  const formatToIST = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  const filteredConversations = useMemo(() => {
    return conversations.filter(convo => {
      const otherUser = getOtherUserInConvo(convo);
      return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
    })
  }, [conversations, searchTerm, user?.id]);

  if (loading) {
    return (
       <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Messages</h1>
        <p className="text-muted-foreground">
          Your conversation history.
        </p>
      </header>
       <Card className="flex-1 flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-lg">
                    Conversations
                </CardTitle>
                <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search conversations..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
            </CardHeader>
            <ScrollArea className="flex-1">
                <CardContent className="p-0">
                    <div className="space-y-1">
                        {filteredConversations.map((convo) => {
                            const otherUser = getOtherUserInConvo(convo);
                            if (!otherUser) return null;
                            const lastMessage = convo.messages[convo.messages.length - 1];
                            const isSender = lastMessage?.senderId === user?.id;

                            return (
                                <Link
                                    href={`/messages/${convo.id}`}
                                    key={convo.id}
                                    className={cn(
                                        'flex w-full cursor-pointer items-start gap-3 p-4 text-left transition-colors hover:bg-muted'
                                    )}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                        src={otherUser.avatar}
                                        alt={otherUser.name}
                                        data-ai-hint="person"
                                        />
                                        <AvatarFallback>
                                        {otherUser.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between">
                                        <p className="font-semibold truncate">{otherUser.name}</p>
                                        <p className="text-xs text-muted-foreground shrink-0">
                                            {lastMessage && formatToIST(lastMessage.timestamp)}
                                        </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                        {lastMessage ? (isSender ? `You: ${lastMessage.text}` : lastMessage.text) : 'No messages yet'}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </ScrollArea>
        </Card>
    </div>
  );
}
