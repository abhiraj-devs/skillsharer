
export type User = {
  id: string;
  name: string;
  avatar: string;
};

export type Service = {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  imageUrl: string;
  user: User;
};

export type Request = {
  id: number;
  title: string;
  description: string;
  budget: number;
  tags: string[];
  user: User;
};

export type Message = {
  id: number;
  text: string;
  isSender: boolean;
  senderId: string;
  timestamp: string;
};

export type Conversation = {
  id: number;
  // Participants will include the current user and the other user.
  participants: User[]; 
  messages: Message[];
};


// In-memory 'database'
// =================================================================
import { users as registeredUsers } from './users';

// Helper to get a registered user by ID
const getUserById = (id: string): User | undefined => {
    const foundUser = registeredUsers.find(u => u.id === id);
    if (!foundUser) return undefined;
    return {
        id: foundUser.id,
        name: foundUser.name,
        avatar: `https://avatar.vercel.sh/${foundUser.email}`
    };
}


const initialUsers = {
  user1: getUserById('1') || { id: '1', name: 'Ben Carter', avatar: 'https://picsum.photos/seed/ben/100' },
  user2: { id: '2', name: 'Chloe Davis', avatar: 'https://picsum.photos/seed/chloe/100' },
  user3: { id: '3', name: 'David Evans', avatar: 'https://picsum.photos/seed/david/100' },
  user4: { id: '4', name: 'Sarah Lee', avatar: 'https://picsum.photos/seed/sarah/100' },
}

export const servicesData: Service[] = [
  {
    id: 1,
    title: 'I will design a professional modern resume for you',
    category: 'Design',
    price: 100,
    rating: 4.9,
    imageUrl: 'https://picsum.photos/seed/resume/600/400',
    user: initialUsers.user1,
  },
  {
    id: 2,
    title: 'I will debug your Python or JavaScript code',
    category: 'Development',
    price: 250,
    rating: 4.8,
    imageUrl: 'https://picsum.photos/seed/code/600/400',
    user: initialUsers.user2,
  },
  {
    id: 3,
    title: 'I will write engaging content for your blog',
    category: 'Writing',
    price: 150,
    rating: 5.0,
    imageUrl: 'https://picsum.photos/seed/blog/600/400',
    user: initialUsers.user3,
  },
];

export const requestsData: Request[] = [
  {
    id: 1,
    title: 'Need help with a presentation design',
    description:
      'Looking for someone to help me create a visually appealing PowerPoint presentation for my class project. It has about 15 slides. I have the content ready.',
    budget: 80,
    tags: ['PowerPoint', 'Design', 'Presentation'],
    user: initialUsers.user2,
  },
  {
    id: 2,
    title: 'Simple React component bug fix',
    description:
      'I have a small bug in my React project where a state is not updating correctly. Need a fresh pair of eyes to help me figure it out. The codebase is small.',
    budget: 120,
    tags: ['React', 'JavaScript', 'Debugging'],
    user: initialUsers.user3,
  },
];


export let conversationsData: Conversation[] = [
  {
    id: 1,
    participants: [initialUsers.user1, initialUsers.user2],
    messages: [
       {
        id: 1,
        text: 'Hey! I saw your offer for resume design. Are you available?',
        isSender: false, // This will be determined on the client
        senderId: initialUsers.user2.id,
        timestamp: '10:00 AM',
      },
      {
        id: 2,
        text: 'Hi! Yes, I am. What do you have in mind?',
        isSender: false, // This will be determined on the client
        senderId: initialUsers.user1.id,
        timestamp: '10:01 AM',
      },
    ],
  },
];


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
