
import { useState } from 'react';
import type { Request } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { MoreVertical, Edit, Trash2, Loader2, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import Link from 'next/link';

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


type RequestCardProps = {
  request: Request;
  onRequestDeleted: (requestId: string) => void;
  onRequestUpdated: (request: Request) => void;
};

export function RequestCard({ request, onRequestDeleted, onRequestUpdated }: RequestCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: request.title,
      description: request.description,
      budget: request.budget,
      tags: request.tags.join(', '),
    },
  });
  
  const handleOfferHelp = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to offer help.' });
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
            body: JSON.stringify({ recipientId: request.user.id })
        });
        if (!res.ok) throw new Error('Failed to start conversation');
        const { conversationId } = await res.json();
        router.push(`/messages/${conversationId}`);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start conversation.' });
    }
  };

  const handleDeleteRequest = async () => {
     const token = localStorage.getItem('token');
     try {
        const res = await fetch(`/api/requests/${request.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if(!res.ok) throw new Error((await res.json()).message || 'Failed to delete request');
        
        toast({ title: 'Success', description: 'Request deleted successfully.' });
        onRequestDeleted(request.id);

     } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
     }
  }
  
  const onUpdateSubmit = async (values: z.infer<typeof requestFormSchema>) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/requests/${request.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(values)
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to update request');
        const updatedRequest = await res.json();
        toast({ title: 'Success', description: 'Request updated.' });
        onRequestUpdated(updatedRequest);
        setIsEditDialogOpen(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg pr-2">{request.title}</CardTitle>
            {user?.id === request.user.id && (
                <AlertDialog>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <AlertDialogTrigger asChild>
                                     <DropdownMenuItem>
                                        <CheckCircle className="mr-2 h-4 w-4"/>
                                        <span>Mark as Done</span>
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <DropdownMenuSeparator />
                                <DialogTrigger asChild>
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4"/>
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                </DialogTrigger>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDeleteRequest}>
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Request</DialogTitle>
                                <DialogDescription>
                                    Update the details of your request.
                                </DialogDescription>
                            </DialogHeader>
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-4">
                                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="budget" render={({ field }) => (<FormItem><FormLabel>Budget (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="tags" render={({ field }) => (<FormItem><FormLabel>Tags</FormLabel><FormControl><Input {...field} /></FormControl><p className="text-xs text-muted-foreground">Separate tags with commas.</p><FormMessage /></FormItem>)} />
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
                        <AlertDialogTitle>Mark this request as done?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this request from the board. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteRequest} className="bg-destructive hover:bg-destructive/90">Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
        <div className="flex items-center gap-2 pt-2">
            <Link href={`/users/${request.user.id}`}>
                <Avatar className="h-6 w-6 cursor-pointer">
                    <AvatarImage
                    src={request.user.avatar}
                    alt={request.user.name}
                    data-ai-hint="person"
                    />
                    <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
             <Link href={`/users/${request.user.id}`}>
                <span className="text-sm font-medium cursor-pointer hover:underline">{request.user.name}</span>
            </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {request.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {request.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm font-semibold text-primary">
          Budget: ₹{request.budget.toLocaleString()}
        </div>
        <Button onClick={handleOfferHelp} disabled={user?.id === request.user.id}>
            Offer Help
        </Button>
      </CardFooter>
    </Card>
  );
}
