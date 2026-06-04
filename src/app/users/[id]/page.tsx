
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
import { userProfile, type User as UserData } from '@/lib/data';
import { Star, Loader2 } from 'lucide-react';
import AIProfileGenerator from '@/components/ai-profile-generator';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';

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

export default function UserProfilePage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [profileUser, setProfileUser] = useState<UserData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

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

  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;
    setLoadingProfile(true);
    try {
        const res = await fetch(`/api/users/${userId}`);
         if (!res.ok) {
            if(res.status === 404) toast({ variant: 'destructive', title: 'Error', description: 'User not found.' });
            throw new Error('Failed to fetch user profile.');
        }
        const data = await res.json();
        setProfileUser(data);
    } catch(e: any) {
        console.error(e);
        router.push('/');
    } finally {
        setLoadingProfile(false);
    }
  }, [userId, toast, router]);

  useEffect(() => {
    fetchUserProfile();
    fetchReviews(userId);
  }, [fetchUserProfile, userId]);

  const fetchReviews = useCallback(async (id: string) => {
    if (!id) return;
    setLoadingReviews(true);
    try {
        const res = await fetch(`/api/reviews?userId=${id}`);
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

  const handleReviewSubmit = async (values: z.infer<typeof reviewSchema>) => {
    if (!currentUser || !profileUser) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ...values, userId: profileUser.id })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to submit review.');
        const newReview = await res.json();
        setReviews(prev => [newReview, ...prev]);
        reviewForm.reset();
        toast({ title: 'Success!', description: 'Your review has been submitted.' });
        fetchReviews(profileUser.id); // Re-fetch to update stats
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleStartConversation = async () => {
    if (!currentUser || !profileUser) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/conversations/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recipientId: profileUser.id }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to start conversation.');
      const { conversationId } = await res.json();
      router.push(`/messages/${conversationId}`);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  if (loadingProfile) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileUser) {
    return <p>User not found.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline">{profileUser.name}'s Profile</h1>
            <p className="text-muted-foreground">
            Learn more about {profileUser.name} and their skills.
            </p>
        </div>
        {currentUser && currentUser.id !== profileUser.id && (
          <Button onClick={handleStartConversation}>Message {profileUser.name}</Button>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                 <AvatarImage
                  src={(profileUser as any).avatar || `https://avatar.vercel.sh/${profileUser.email}`}
                  alt={profileUser.name || ''}
                  data-ai-hint="person"
                />
                <AvatarFallback>
                  {profileUser.name?.charAt(0).toUpperCase() || profileUser.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold font-headline">
                {profileUser.name}
              </h2>
              <p className="text-muted-foreground mt-2">{profileUser.email}</p>
              <p className="text-muted-foreground mt-2">{profileUser.bio}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(profileUser.skills && profileUser.skills.length > 0 ? profileUser.skills : []).map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {profileUser.skills && profileUser.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet.</p>}
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="reviews">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="reviews" className="mt-4">
               <div className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle className="font-headline">Reviews for {profileUser.name}</CardTitle>
                    <CardDescription>
                        Feedback from students they've collaborated with. 
                        They have {reviewStats.count} reviews with an average rating of {reviewStats.average.toFixed(1)}.
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
                 {currentUser && currentUser.id !== profileUser.id && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave a Review</CardTitle>
                            <CardDescription>Share your experience working with {profileUser.name}.</CardDescription>
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
                )}
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
