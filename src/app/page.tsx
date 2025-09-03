
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { userProfile } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Activity,
  DollarSign,
  Star,
  ListChecks,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type Review = {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
    avatar: string;
  };
};

type DashboardData = {
  totalEarnings: number;
  completedTasks: number;
  activeTasks: number;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  performance: { month: string; earnings: number; tasks: number }[];
};


export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        setLoading(false);
        return;
    };
    try {
        const response = await fetch('/api/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        const dashboardData = await response.json();
        setData(dashboardData);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not load dashboard data.'
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayData = data || {
    totalEarnings: 0,
    completedTasks: 0,
    activeTasks: 0,
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
    performance: [
        { month: 'Jan', earnings: 0, tasks: 0 },
        { month: 'Feb', earnings: 0, tasks: 0 },
        { month: 'Mar', earnings: 0, tasks: 0 },
        { month: 'Apr', earnings: 0, tasks: 0 },
        { month: 'May', earnings: 0, tasks: 0 },
        { month: 'Jun', earnings: 0, tasks: 0 },
    ]
  };


  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's a summary of your activity.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{displayData.totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on your offered services
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Services Offered
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.completedTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              Total services you have posted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {displayData.totalReviews} reviews
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayData.activeTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              Your active requests for help
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Monthly Performance</CardTitle>
            <CardDescription>
              Your earnings and tasks from offered services over the past 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full p-2">
            <ResponsiveContainer>
              <BarChart data={displayData.performance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  dataKey="earnings"
                  stroke="hsl(var(--primary))"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <YAxis
                  yAxisId="right"
                  dataKey="tasks"
                  orientation="right"
                  stroke="hsl(var(--accent))"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="earnings"
                  fill="hsl(var(--primary))"
                  name="Earnings (₹)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="tasks"
                  fill="hsl(var(--accent))"
                  name="Tasks Completed"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Reviews</CardTitle>
            <CardDescription>
              What people are saying about your work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {displayData.reviews.length > 0 ? (
                 displayData.reviews.map((review) => (
                  <li key={review.id} className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.user.avatar} alt={review.user.name} />
                      <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{review.user.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span>{review.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        "{review.comment}"
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
