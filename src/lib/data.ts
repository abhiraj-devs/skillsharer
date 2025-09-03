
// All mock data has been removed and is now being fetched from MongoDB via API endpoints.
// Type definitions are kept for frontend components.

export type User = {
  id: string;
  _id: string;
  name: string;
  avatar: string;
  email: string;
  bio: string;
  skills: string[];
  lastSeen?: string;
  totalEarnings?: number;
};

export type Service = {
  _id: string;
  id:string;
  title: string;
  category: string;
  price: number;
  rating: number;
  imageUrl: string;
  user: User;
};

export type Request = {
  _id: string;
  id: string;
  title: string;
  description: string;
  budget: number;
  tags: string[];
  user: User;
  status: 'open' | 'fulfilled';
  solver?: User | null;
};

export type Message = {
  _id: string;
  id: string;
  text: string;
  sender: User;
  isSender: boolean;
  senderId: string;
  timestamp: string;
};

export type Conversation = {
  _id: string;
  id: string;
  participants: User[]; 
  messages: Message[];
};

export type Review = {
    id: string;
    rating: number;
    comment: string;
    reviewer: User;
    user: User;
    createdAt: string;
}


// =================================================================
// Static data for dashboard and profile placeholders
export type UserProfile = {
  bio: string;
  completedTasks: { id: number; title: string; date: string }[];
  reviews: {
    id: number;
    user: {name: string, avatar: string};
    rating: number;
    comment: string;
  }[];
};
export const userProfile: UserProfile = {
  bio: 'Computer Science student passionate about web development and design. Turning ideas into reality one line of code at a time. Here to help and collaborate!',
  completedTasks: [
    { id: 1, title: 'Designed a resume', date: '2024-05-20' },
    { id: 2, title: 'Helped debug a Python script', date: '2024-05-18' },
    { id: 3, title: 'Wrote blog post on AI', date: '2024-05-15' },
  ],
  reviews: [
    {
      id: 1,
      user: { name: "Ben Carter", avatar: 'https://picsum.photos/seed/ben/100' },
      rating: 5,
      comment: 'Amazing work! Delivered a fantastic design ahead of schedule.',
    },
    {
      id: 2,
      user: { name: "Chloe Davis", avatar: 'https://picsum.photos/seed/chloe/100' },
      rating: 5,
      comment:
        'Super helpful and patient. Found the bug that I was stuck on for hours.',
    },
  ],
};

export type DashboardData = {
  stats: {
    totalEarnings: number;
    earningsThisMonth: number;
    completedTasks: number;
    ongoingTasks: number;
    averageRating: number;
    totalReviews: number;
  };
  performance: { month: string; earnings: number; tasks: number }[];
  recentReviews: {
    id: number;
    name: string;
    avatar: string;
    rating: number;
    comment: string;
  }[];
};
export const dashboardData: DashboardData = {
  stats: {
    totalEarnings: 4850,
    earningsThisMonth: 20.1,
    completedTasks: 32,
    ongoingTasks: 3,
    averageRating: 4.8,
    totalReviews: 25,
  },
  performance: [
    { month: 'Jan', earnings: 600, tasks: 5 },
    { month: 'Feb', earnings: 800, tasks: 7 },
    { month: 'Mar', earnings: 750, tasks: 6 },
    { month: 'Apr', earnings: 1200, tasks: 9 },
    { month: 'May', earnings: 900, tasks: 8 },
    { month: 'Jun', earnings: 1500, tasks: 11 },
  ],
  recentReviews: userProfile.reviews
    .slice(0, 3)
    .map((r) => ({ ...r, name: r.user.name, avatar: r.user.avatar })),
};
