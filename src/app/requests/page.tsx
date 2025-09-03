'use client';
import { Button } from '@/components/ui/button';
import { RequestCard } from '@/components/request-card';
import { requestsData, type Request, type User } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';

const requestFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters long.'),
  budget: z.coerce
    .number()
    .min(1, 'Budget must be greater than 0.'),
  tags: z.string().min(3, 'Please add at least one tag.'),
});

export default function RequestsPage() {
  const [requests, setRequests] = useState(requestsData);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: 0,
      tags: '',
    },
  });

  const onSubmit = (values: z.infer<typeof requestFormSchema>) => {
    if (!user) return; // Should not happen

    const currentUser: User = {
      name: user.name || 'User',
      avatar: user.image || `https://avatar.vercel.sh/${user.email}`
    };

    const newRequest: Request = {
      id: requests.length + 1,
      title: values.title,
      description: values.description,
      budget: values.budget,
      tags: values.tags.split(',').map((tag) => tag.trim()),
      user: currentUser,
    };
    setRequests([newRequest, ...requests]);
    form.reset();
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Request Board</h1>
          <p className="text-muted-foreground">
            Need help with a task? Post it for the community to see.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Post a Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
              <DialogDescription>
                Fill out the details below to post a task for the community.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Need help with a presentation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the task in detail..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Design, PowerPoint, Art" {...field} />
                      </FormControl>
                       <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Post Request</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}
