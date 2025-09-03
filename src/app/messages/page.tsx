
'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import type { Conversation, Message, User } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/messages');
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const data = await res.json();
        setConversations(data);
        if (data.length > 0) {
          setSelectedConversationId(data[0].id);
        }
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load messages.' });
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [isAuthenticated, toast]);


  const selectedConversation = useMemo(() => {
    return conversations.find(c => c.id === selectedConversationId);
  }, [conversations, selectedConversationId]);


  const getOtherUserInConvo = (convo: Conversation): User | undefined => {
    return convo.participants.find(p => p.id !== user?.id);
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedConversationId) return;

    try {
      const res = await fetch(`/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          text: newMessage,
        }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const sentMessage = await res.json();

      // Update the conversation in the state
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversationId
            ? { ...c, messages: [...c.messages, sentMessage] }
            : c
        )
      );
      setNewMessage('');
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
      });
    }
  }, [selectedConversation?.messages]);

  if (loading) {
    return (
       <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with other students about your projects.
        </p>
      </header>
      <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        <Card className="md:col-span-1 lg:col-span-1 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              Conversations
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-8" />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-0">
              <div className="space-y-1">
                {conversations.map((convo) => {
                  const otherUser = getOtherUserInConvo(convo);
                  if (!otherUser) return null;
                  const lastMessage = convo.messages[convo.messages.length - 1];

                  return (
                    <button
                      key={convo.id}
                      className={cn(
                        'flex w-full cursor-pointer items-start gap-3 p-4 text-left transition-colors hover:bg-muted',
                        selectedConversationId === convo.id && 'bg-muted'
                      )}
                      onClick={() => setSelectedConversationId(convo.id)}
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
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-semibold">{otherUser.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {lastMessage?.timestamp}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage?.text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </ScrollArea>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3 h-full flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                    {getOtherUserInConvo(selectedConversation) && (
                        <>
                        <Avatar>
                            <AvatarImage
                            src={getOtherUserInConvo(selectedConversation)?.avatar}
                            alt={getOtherUserInConvo(selectedConversation)?.name}
                            data-ai-hint="person"
                            />
                            <AvatarFallback>
                            {getOtherUserInConvo(selectedConversation)?.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="font-headline text-lg">
                            {getOtherUserInConvo(selectedConversation)?.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">Online</p>
                        </div>
                        </>
                    )}
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {selectedConversation.messages.map((message) => {
                    const isSender = message.senderId === user?.id;
                    const messageUser = selectedConversation.participants.find(p => p.id === message.senderId);

                    return (
                        <div
                        key={message.id}
                        className={cn(
                            'flex items-end gap-2',
                            isSender ? 'justify-end' : 'justify-start'
                        )}
                        >
                        {!isSender && (
                            <Avatar className="h-8 w-8">
                            <AvatarImage src={messageUser?.avatar} alt={messageUser?.name} />
                            <AvatarFallback>{messageUser?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            'max-w-xs rounded-lg p-3 lg:max-w-md',
                            isSender
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                        >
                            <p>{message.text}</p>
                            <p className="mt-1 text-right text-xs opacity-70">
                            {message.timestamp}
                            </p>
                        </div>
                        </div>
                    );
                    })}
                </div>
              </ScrollArea>
              <CardFooter className="border-t pt-4">
                <form onSubmit={handleSendMessage} className="relative w-full">
                  <Input
                    placeholder="Type a message..."
                    className="pr-12"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">
                Select a conversation to start chatting
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
