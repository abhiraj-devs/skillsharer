
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userProfile, type User } from '@/lib/data';
import { Edit, Save, Star, X, Loader2 } from 'lucide-react';
import AIProfileGenerator from '@/components/ai-profile-generator';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type Review = {
  id: string;
  rating: number;
  comment: string;
  reviewer: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
};

const reviewSchema = z.object({
    rating: z.coerce.number().min(1, "Rating is required.").max(5),
    comment: z.string().min(10, "Comment must be at least 10 characters.").max(500),
});

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [skills, setSkills] = useState('');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  const [loadingReviews, setLoadingReviews] = useState(true);

  const reviewForm = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
        rating: 0,
        comment: ''
    }
  });


  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSkills(user.skills?.join(', ') || '');
      fetchReviews(user.id);
    }
  }, [user]);

  const fetchReviews = useCallback(async (userId: string) => {
    setLoadingReviews(true);
    try {
        const res = await fetch(`/api/reviews?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch reviews.');
        const data = await res.json();
        setReviews(data.reviews);
        setReviewStats({ average: data.averageRating, count: data.totalReviews });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setLoadingReviews(false);
    }
  }, [toast]);

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Name cannot be empty.',
      });
      return;
    }
    try {
      await updateUser({ name });
      toast({
        title: 'Success',
        description: 'Your name has been updated.',
      });
      setIsEditingName(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update name.',
      });
    }
  };

  const handleSaveSkills = async () => {
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      await updateUser({ skills: skillsArray });
      toast({
        title: 'Success',
        description: 'Your skills have been updated.',
      });
      setIsEditingSkills(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update skills.',
      });
    }
  };

  const handleReviewSubmit = async (values: z.infer<typeof reviewSchema>) => {
    if (!user) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ...values, userId: user.id })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to submit review.');
        const newReview = await res.json();
        setReviews(prev => [newReview, ...prev]);
        reviewForm.reset();
        toast({ title: 'Success!', description: 'Your review has been submitted.' });
        fetchReviews(user.id); // Re-fetch to update stats
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your skills, view your history, and grow your reputation.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                 <AvatarImage
                  src={user?.image || `https://avatar.vercel.sh/${user?.email}`}
                  alt={user?.name || ''}
                  data-ai-hint="person"
                />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {!isEditingName ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold font-headline">
                    {user?.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setName(user?.name || '');
                      setIsEditingName(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-center"
                  />
                  <Button variant="ghost" size="icon" onClick={handleSaveName}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingName(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-muted-foreground mt-2">{user?.email}</p>
              <p className="text-muted-foreground mt-2">{userProfile.bio}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex-row items-center justify-between'>
              <CardTitle className="font-headline text-lg">Skills</CardTitle>
              {!isEditingSkills && (
                 <Button variant="ghost" size="icon" onClick={() => setIsEditingSkills(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditingSkills ? (
                 <div className="space-y-4">
                    <Textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="Enter skills, separated by commas"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditingSkills(false)}>Cancel</Button>
                      <Button onClick={handleSaveSkills}>Save</Button>
                    </div>
                  </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(user?.skills && user.skills.length > 0 ? user.skills : []).map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {user?.skills && user.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet.</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="portfolio">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="portfolio">AI Portfolio</TabsTrigger>
              <TabsTrigger value="tasks">Completed Tasks</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="portfolio" className="mt-4">
              <AIProfileGenerator />
            </TabsContent>
            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">
                    Completed Task History
                  </CardTitle>
                  <CardDescription>
                    A record of all the services you've provided and requests
                    you've fulfilled.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {userProfile.completedTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between rounded-md border p-4"
                      >
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.date}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
               <div className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle className="font-headline">Your Reviews</CardTitle>
                    <CardDescription>
                        Feedback from students you've collaborated with. 
                        You have {reviewStats.count} reviews with an average rating of {reviewStats.average.toFixed(1)}.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    {loadingReviews ? <Loader2 className="animate-spin" /> : (
                        <ul className="space-y-6">
                            {reviews.map((review) => (
                            <li key={review.id} className="flex items-start gap-4">
                                <Avatar>
                                <AvatarImage
                                    src={review.reviewer.avatar}
                                    alt={review.reviewer.name}
                                    data-ai-hint="person"
                                />
                                <AvatarFallback>
                                    {review.reviewer.name.charAt(0)}
                                </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{review.reviewer.name}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Star className="h-4 w-4 fill-accent text-accent" />
                                    <span>{review.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    "{review.comment}"
                                </p>
                                </div>
                            </li>
                            ))}
                        </ul>
                    )}
                    {reviews.length === 0 && !loadingReviews && (
                        <p className="text-sm text-center text-muted-foreground py-4">No reviews yet.</p>
                    )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Leave a Review</CardTitle>
                        <CardDescription>Share your experience working with {user?.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={reviewForm.handleSubmit(handleReviewSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <Controller
                                    name="rating"
                                    control={reviewForm.control}
                                    render={({ field }) => (
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map(i => (
                                                <Star 
                                                    key={i} 
                                                    className={cn("h-6 w-6 cursor-pointer", i <= field.value ? "text-accent fill-accent" : "text-gray-300")}
                                                    onClick={() => field.onChange(i)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                />
                                {reviewForm.formState.errors.rating && <p className="text-destructive text-sm mt-1">{reviewForm.formState.errors.rating.message}</p>}
                            </div>
                            <div>
                               <label className="block text-sm font-medium mb-2">Comment</label>
                               <Textarea {...reviewForm.register('comment')} placeholder="Describe your experience..."/>
                               {reviewForm.formState.errors.comment && <p className="text-destructive text-sm mt-1">{reviewForm.formState.errors.comment.message}</p>}
                            </div>
                            <Button type="submit" disabled={reviewForm.formState.isSubmitting}>
                                {reviewForm.formState.isSubmitting && <Loader2 className="animate-spin mr-2"/>}
                                Submit Review
                            </Button>
                        </form>
                    </CardContent>
                </Card>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
