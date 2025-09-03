
'use client';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/service-card';
import { type Service } from '@/lib/data';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const serviceFormSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.'),
  category: z.string().min(3, 'Please select a category.'),
  price: z.coerce.number().min(1, 'Price must be greater than 0.'),
  imageUrl: z.string().url('Please enter a valid image URL.'),
});

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch services.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const form = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: '',
      category: '',
      price: 0,
      imageUrl: 'https://picsum.photos/600/400',
    },
  });

  const onSubmit = async (values: z.infer<typeof serviceFormSchema>) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to post a service.',
      });
      return;
    }
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || 'Failed to post service');
      }
      const newService = await response.json();
      setServices((prev) => [newService, ...prev]);
      form.reset();
      setOpen(false);
       toast({
        title: 'Success!',
        description: 'Your new service has been posted.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not post service.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Services</h1>
          <p className="text-muted-foreground">
            Browse and discover skills offered by fellow students.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Post a Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Showcase your skills by offering a new service to the community.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., I will design a modern resume"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Development">Development</SelectItem>
                          <SelectItem value="Writing">Writing</SelectItem>
                          <SelectItem value="Translation">Translation</SelectItem>
                          <SelectItem value="Tutoring">Tutoring</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
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
                    Post Service
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
