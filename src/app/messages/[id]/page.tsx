
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, Loader2, Trash2, MoreVertical, Smile, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useParams, useRouter } from 'next/navigation';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';


export default function ConversationPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  const fetchConversation = useCallback(async () => {
    if (!isAuthenticated || !conversationId) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/messages/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if(res.status === 404) {
             toast({ variant: 'destructive', title: 'Error', description: 'Conversation not found.' });
             router.push('/messages');
        }
        throw new Error('Failed to fetch conversation');
      }
      const data = await res.json();
      setConversation(data);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load messages.' });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast, conversationId, router]);


  useEffect(() => {
    fetchConversation();

    const intervalId = setInterval(fetchConversation, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [fetchConversation]);


  const otherUser = conversation?.participants.find(p => p.id !== user?.id);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !conversationId) return;
    const token = localStorage.getItem('token');
    const tempId = `temp-${Date.now()}`;
    const sentMessage: Message = {
        id: tempId,
        _id: tempId,
        text: newMessage,
        senderId: user!.id,
        timestamp: new Date().toISOString(),
        sender: user as User,
        isSender: true,
    };

    setConversation(prev => prev ? ({ ...prev, messages: [...prev.messages, sentMessage] }) : null);
    setNewMessage('');


    try {
      const res = await fetch(`/api/messages`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          conversationId: conversationId,
          text: newMessage,
        }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const savedMessage = await res.json();

       setConversation(prev => prev ? ({ 
            ...prev, 
            messages: prev.messages.map(m => m.id === tempId ? savedMessage : m) 
        }) : null);

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
       setConversation(prev => prev ? ({ ...prev, messages: prev.messages.filter(m => m.id !== tempId) }) : null);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete || !conversationId) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/messages', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                conversationId: conversationId,
                messageId: messageToDelete.id
            })
        });

        if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete message.');

        setConversation(prev =>
            prev ? {
                ...prev,
                messages: prev.messages.map(m =>
                    m.id === messageToDelete.id
                        ? { ...m, text: 'This message was deleted' }
                        : m
                ),
            } : null
        );
        toast({ title: 'Success', description: 'Message deleted.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setMessageToDelete(null);
    }
  };
  
  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  }

  const formatToIST = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
      });
    }
  }, [conversation?.messages.length]); // Only trigger on message count change

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return null;
    const lastSeenDate = new Date(dateString);
    const now = new Date();
    
    // If last seen is within the last 5 minutes, consider "Online"
    if (now.getTime() - lastSeenDate.getTime() < 5 * 60 * 1000) {
        return <span className="text-green-500">Online</span>;
    }
    
    if (isToday(lastSeenDate)) {
        return `Last seen today at ${format(lastSeenDate, 'p')}`;
    }
    
    if (isYesterday(lastSeenDate)) {
        return `Last seen yesterday at ${format(lastSeenDate, 'p')}`;
    }
    
    return `Last seen ${formatDistanceToNow(lastSeenDate)} ago`;
  };
  
  // Update user's 'lastSeen' status
  useEffect(() => {
    const updateActivity = () => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/user/active', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
    };
    // Update immediately and then every minute
    updateActivity();
    const activityInterval = setInterval(updateActivity, 60 * 1000); 

    return () => clearInterval(activityInterval);
  }, []);

  if (loading) {
    return (
       <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
    )
  }

  if (!conversation || !otherUser) {
    return (
         <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
             <p>Conversation not found.</p>
         </div>
    )
  }

  return (
    <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)]">
       <AlertDialog onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push('/messages')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar>
                        <AvatarImage
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        data-ai-hint="person"
                        />
                        <AvatarFallback>
                        {otherUser.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="font-headline text-lg">
                        {otherUser.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{formatLastSeen(otherUser.lastSeen)}</p>
                    </div>
                </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                {conversation.messages.map((message) => {
                    const isSender = message.senderId === user?.id;
                    const messageUser = conversation.participants.find(p => p.id === message.senderId);

                    return (
                        <div
                            key={message.id}
                            className={cn(
                                'flex items-end gap-2 group w-full',
                                isSender ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {!isSender && (
                                <Avatar className="h-8 w-8 self-end">
                                    <AvatarImage src={messageUser?.avatar} alt={messageUser?.name} />
                                    <AvatarFallback>{messageUser?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}

                            <div
                                className={cn(
                                    'max-w-[70%] rounded-lg p-3 lg:max-w-md break-words',
                                    isSender
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                )}
                            >
                                <p className="text-sm">{message.text}</p>
                                <p className="mt-1 text-right text-xs opacity-70">
                                    {formatToIST(message.timestamp)}
                                </p>
                            </div>

                            {isSender && message.text !== 'This message was deleted' && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={() => setMessageToDelete(message)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete for Everyone</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    );
                })}
                </div>
            </ScrollArea>
            <CardFooter className="border-t pt-4">
                <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <Smile className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 border-0">
                        <EmojiPicker onEmojiClick={onEmojiClick} width="100%" />
                    </PopoverContent>
                </Popover>

                <Input
                    placeholder="Type a message..."
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button
                    type="submit"
                    size="icon"
                    className="shrink-0"
                    disabled={!newMessage.trim()}
                >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                </Button>
                </form>
            </CardFooter>
        </Card>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this message for everyone in the conversation.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}
