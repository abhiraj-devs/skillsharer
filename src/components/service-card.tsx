
import { useState } from 'react';
import type { Service } from '@/lib/data';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const serviceFormSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters long.'),
  category: z.string().min(3, 'Please select a category.'),
  price: z.coerce.number().min(1, 'Price must be greater than 0.'),
  imageUrl: z.string().url('Please enter a valid image URL.'),
});

type ServiceCardProps = {
  service: Service;
  onServiceDeleted?: (serviceId: string) => void;
  onServiceUpdated?: (service: Service) => void;
};

export function ServiceCard({ service, onServiceDeleted, onServiceUpdated }: ServiceCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: service.title,
      category: service.category,
      price: service.price,
      imageUrl: service.imageUrl,
    },
  });

  const startConversation = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to contact a seller.' });
        return;
    }
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/conversations/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ recipientId: service.user.id })
        });
        if (!res.ok) throw new Error('Failed to start conversation');
        const { conversationId } = await res.json();
        router.push(`/messages/${conversationId}`);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start conversation.' });
    }
  };

  const handleDelete = async () => {
    if (!onServiceDeleted) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete service.');
      toast({ title: 'Success', description: 'Service deleted successfully.' });
      onServiceDeleted(service.id);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const onUpdateSubmit = async (values: z.infer<typeof serviceFormSchema>) => {
    if (!onServiceUpdated) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update service.');
      const updatedService = await res.json();
      toast({ title: 'Success', description: 'Service updated.' });
      onServiceUpdated(updatedService);
      setIsEditDialogOpen(false);
      form.reset(updatedService);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={service.imageUrl}
          alt={service.title}
          fill
          className="object-cover"
          data-ai-hint="abstract"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-headline text-lg line-clamp-2 pr-2">
            {service.title}
          </CardTitle>
          {user?.id === service.user.id ? (
            <AlertDialog>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DialogTrigger asChild>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4"/>
                        <span>Edit</span>
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4"/>
                          <span>Delete</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                      <DialogTitle>Edit Service</DialogTitle>
                      <CardDescription>Update the details of your service.</CardDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-4">
                      <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Design">Design</SelectItem><SelectItem value="Development">Development</SelectItem><SelectItem value="Writing">Writing</SelectItem><SelectItem value="Translation">Translation</SelectItem><SelectItem value="Tutoring">Tutoring</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this service. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            service.rating > 0 && (
              <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                <span>{service.rating.toFixed(1)}</span>
              </div>
            )
          )}
        </div>
        <div className="flex items-center gap-2 pt-1">
            <Link href={`/users/${service.user.id}`}>
              <Avatar className="h-6 w-6 cursor-pointer">
                <AvatarImage
                  src={service.user.avatar}
                  alt={service.user.name}
                  data-ai-hint="person"
                />
                <AvatarFallback>{service.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
            <Link href={`/users/${service.user.id}`}>
              <span className="text-sm font-medium text-muted-foreground cursor-pointer hover:underline">
                {service.user.name}
              </span>
            </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{service.category}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/50 py-3 px-6">
        <div className="text-lg font-bold">
          <span className="text-xs font-normal text-muted-foreground">
            FROM{' '}
          </span>
          ₹{service.price.toLocaleString()}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startConversation} disabled={user?.id === service.user.id}>
            Exchange
          </Button>
          <Button size="sm" onClick={startConversation} disabled={user?.id === service.user.id}>
            Buy
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
