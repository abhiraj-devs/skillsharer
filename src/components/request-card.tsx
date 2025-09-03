
import { useState, useEffect, useCallback } from 'react';
import type { Request, User as ConvoUser } from '@/lib/data';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFulfillDialogOpen, setIsFulfillDialogOpen] = useState(false);

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedSolver, setSelectedSolver] = useState<string>('');
  const [isFulfilling, setIsFulfilling] = useState(false);

  const form = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: request.title,
      description: request.description,
      budget: request.budget,
      tags: request.tags.join(', '),
    },
  });

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/messages', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const data = await res.json();
        const relevantUsers = data.map((convo: any) => convo.participants.find((p: any) => p.id !== user.id)).filter(Boolean);
        setConversations(relevantUsers);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load conversations for solver selection.' });
    }
  }, [user, toast]);
  
  useEffect(() => {
    if(isFulfillDialogOpen) {
      fetchConversations();
    }
  }, [isFulfillDialogOpen, fetchConversations])
  
  const handleOfferHelp = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to offer help.' });
        router.push('/auth');
        return;
    }
    if (user.id === request.user.id) {
        toast({ variant: 'destructive', title: 'Error', description: 'You cannot offer help on your own request.' });
        return;
    }
    
    setIsSubmittingOffer(true);
    const token = localStorage.getItem('token');

    try {
        const startConvoRes = await fetch('/api/conversations/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ recipientId: request.user.id })
        });

        if (!startConvoRes.ok) throw new Error((await startConvoRes.json()).message || 'Failed to start conversation');
        const { conversationId } = await startConvoRes.json();
        
        const messageText = `Regarding your request: "${request.title}"`;
        const sendMessageRes = await fetch(`/api/messages`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
              conversationId: conversationId,
              text: messageText,
            }),
        });

        if (!sendMessageRes.ok) throw new Error((await sendMessageRes.json()).message || 'Failed to send initial message');
        
        router.push(`/messages/${conversationId}`);

    } catch (error: any) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSubmittingOffer(false);
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
        setIsDeleteDialogOpen(false);

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

  const handleFulfillRequest = async () => {
    if (!selectedSolver) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a solver.' });
        return;
    }
    setIsFulfilling(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/requests/${request.id}/fulfill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ solverId: selectedSolver }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to fulfill request.');
      const updatedRequest = await res.json();
      toast({ title: 'Success!', description: `${updatedRequest.solver.name} has been paid.` });
      onRequestUpdated(updatedRequest);
      setIsFulfillDialogOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsFulfilling(false);
    }
  }


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg pr-2">{request.title}</CardTitle>
            {user?.id === request.user.id && request.status === 'open' && (
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
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
                                <DropdownMenuSeparator />
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
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this request from the board. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteRequest} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
        <div>
          {request.status === 'fulfilled' ? (
            <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Fulfilled</span>
            </div>
          ) : user?.id === request.user.id ? (
            <Dialog open={isFulfillDialogOpen} onOpenChange={setIsFulfillDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">Mark as Fulfilled</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Request as Fulfilled</DialogTitle>
                  <DialogDescription>
                    Select the user who completed this request. This will transfer the budget amount to their earnings. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Select onValueChange={setSelectedSolver} value={selectedSolver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the solver..." />
                    </SelectTrigger>
                    <SelectContent>
                      {conversations.map((convoUser) => (
                        <SelectItem key={convoUser.id} value={convoUser.id}>
                          <div className="flex items-center gap-2">
                             <Avatar className="h-6 w-6">
                                <AvatarImage src={convoUser.avatar} alt={convoUser.name}/>
                                <AvatarFallback>{convoUser.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            <span>{convoUser.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleFulfillRequest} disabled={isFulfilling || !selectedSolver}>
                    {isFulfilling && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Confirm & Pay ₹{request.budget}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button onClick={handleOfferHelp} disabled={isSubmittingOffer}>
              {isSubmittingOffer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Offer Help
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
