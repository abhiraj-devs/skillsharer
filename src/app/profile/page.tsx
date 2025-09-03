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
import { userProfile } from '@/lib/data';
import { Star } from 'lucide-react';
import AIProfileGenerator from '@/components/ai-profile-generator';

export default function ProfilePage() {
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
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} data-ai-hint="person" />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold font-headline">
                {userProfile.name}
              </h2>
              <p className="text-muted-foreground mt-2">{userProfile.bio}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {userProfile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
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
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Your Reviews</CardTitle>
                  <CardDescription>
                    Feedback from students you've collaborated with.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-6">
                    {userProfile.reviews.map((review) => (
                      <li key={review.id} className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage
                            src={review.user.avatar}
                            alt={review.user.name}
                            data-ai-hint="person"
                          />
                          <AvatarFallback>
                            {review.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{review.user.name}</p>
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
