
'use client';
import { Button } from '@/components/ui/button';
import { RequestCard } from '@/components/request-card';
import { type Request } from '@/lib/data';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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
import { useToast } from '@/hooks/use-toast';

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
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/requests');
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error(error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch requests.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const form = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: 0,
      tags: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof requestFormSchema>) => {
    if (!user) {
       toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to post a request.',
      });
      return;
    }
    
     const token = localStorage.getItem('token');

     try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || 'Failed to post request');
      }
      const newRequest = await response.json();
      setRequests((prev) => [newRequest, ...prev]);
      form.reset();
      setOpen(false);
       toast({
        title: 'Success!',
        description: 'Your new request has been posted.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not post request.',
      });
    }
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
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post Request
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </header>
      {loading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
