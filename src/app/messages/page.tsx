'use client';
import { useState } from 'react';
import { conversationsData } from '@/lib/data';
import type { Conversation } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, Send } from 'lucide-react';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>(conversationsData[0]);

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
                {conversationsData.map((convo) => (
                  <button
                    key={convo.id}
                    className={cn(
                      'flex w-full cursor-pointer items-start gap-3 p-4 text-left transition-colors hover:bg-muted',
                      selectedConversation.id === convo.id && 'bg-muted'
                    )}
                    onClick={() => setSelectedConversation(convo)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={convo.user.avatar} alt={convo.user.name} data-ai-hint="person" />
                      <AvatarFallback>
                        {convo.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-semibold">{convo.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {convo.lastMessageTime}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {convo.lastMessage}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </ScrollArea>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3 h-full flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={selectedConversation.user.avatar}
                      alt={selectedConversation.user.name}
                      data-ai-hint="person"
                    />
                    <AvatarFallback>
                      {selectedConversation.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="font-headline text-lg">
                      {selectedConversation.user.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Online</p>
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex items-end gap-2',
                        message.isSender ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-xs rounded-lg p-3 lg:max-w-md',
                          message.isSender
                            ? 'bg-primary/90 text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <p>{message.text}</p>
                        <p className="mt-1 text-right text-xs opacity-70">
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <CardFooter className="border-t pt-4">
                <div className="relative w-full">
                  <Input placeholder="Type a message..." className="pr-12" />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
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
