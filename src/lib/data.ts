export type User = {
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
  timestamp: string;
};

export type Conversation = {
  id: number;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  messages: Message[];
};

export type UserProfile = {
  name: string;
  avatar: string;
  bio: string;
  skills: string[];
  completedTasks: { id: number; title: string; date: string }[];
  reviews: {
    id: number;
    user: User;
    rating: number;
    comment: string;
  }[];
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

const users = {
  currentUser: { name: 'Alex Doe', avatar: 'https://picsum.photos/seed/alex/100' },
  user1: { name: 'Ben Carter', avatar: 'https://picsum.photos/seed/ben/100' },
  user2: { name: 'Chloe Davis', avatar: 'https://picsum.photos/seed/chloe/100' },
  user3: { name: 'David Evans', avatar: 'https://picsum.photos/seed/david/100' },
};

export const servicesData: Service[] = [
  {
    id: 1,
    title: 'I will design a professional modern resume for you',
    category: 'Design',
    price: 100,
    rating: 4.9,
    imageUrl: 'https://picsum.photos/seed/resume/600/400',
    user: users.user1,
  },
  {
    id: 2,
    title: 'I will debug your Python or JavaScript code',
    category: 'Development',
    price: 250,
    rating: 4.8,
    imageUrl: 'https://picsum.photos/seed/code/600/400',
    user: users.user2,
  },
  {
    id: 3,
    title: 'I will write engaging content for your blog',
    category: 'Writing',
    price: 150,
    rating: 5.0,
    imageUrl: 'https://picsum.photos/seed/blog/600/400',
    user: users.user3,
  },
  {
    id: 4,
    title: 'I will create a custom logo for your brand',
    category: 'Design',
    price: 300,
    rating: 4.7,
    imageUrl: 'https://picsum.photos/seed/logo/600/400',
    user: users.user1,
  },
];

export const requestsData: Request[] = [
  {
    id: 1,
    title: 'Need help with a presentation design',
    description: 'Looking for someone to help me create a visually appealing PowerPoint presentation for my class project. It has about 15 slides. I have the content ready.',
    budget: 80,
    tags: ['PowerPoint', 'Design', 'Presentation'],
    user: users.user2,
  },
  {
    id: 2,
    title: 'Simple React component bug fix',
    description: 'I have a small bug in my React project where a state is not updating correctly. Need a fresh pair of eyes to help me figure it out. The codebase is small.',
    budget: 120,
    tags: ['React', 'JavaScript', 'Debugging'],
    user: users.user3,
  },
  {
    id: 3,
    title: 'Proofread my 5-page essay',
    description: 'I need someone to proofread my sociology essay for grammar, spelling, and punctuation errors. It is about 1500 words long. Quick turnaround needed.',
    budget: 50,
    tags: ['Proofreading', 'Editing', 'Writing'],
    user: users.user1,
  },
];

export const userProfile: UserProfile = {
  name: users.currentUser.name,
  avatar: users.currentUser.avatar,
  bio: 'Computer Science student passionate about web development and design. Turning ideas into reality one line of code at a time. Here to help and collaborate!',
  skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Figma', 'UI/UX Design'],
  completedTasks: [
    { id: 1, title: 'Designed a resume', date: '2024-05-20' },
    { id: 2, title: 'Helped debug a Python script', date: '2024-05-18' },
    { id: 3, title: 'Wrote blog post on AI', date: '2024-05-15' },
  ],
  reviews: [
    { id: 1, user: users.user1, rating: 5, comment: 'Amazing work! Delivered a fantastic design ahead of schedule.' },
    { id: 2, user: users.user2, rating: 5, comment: 'Super helpful and patient. Found the bug that I was stuck on for hours.' },
    { id: 3, user: users.user3, rating: 4, comment: 'Good writing, but took a bit longer than expected.' },
  ],
};

export const conversationsData: Conversation[] = [
  {
    id: 1,
    user: users.user1,
    lastMessage: 'Sure, I can have it ready by tomorrow evening.',
    lastMessageTime: '2h ago',
    unreadCount: 2,
    messages: [
      { id: 1, text: 'Hey! I saw your offer for resume design. Are you available?', isSender: false, timestamp: '10:00 AM' },
      { id: 2, text: 'Hi! Yes, I am. What do you have in mind?', isSender: true, timestamp: '10:01 AM' },
      { id: 3, text: 'Great! I need a one-page modern resume. I can send you my details.', isSender: false, timestamp: '10:02 AM' },
      { id: 4, text: 'Sure, I can have it ready by tomorrow evening.', isSender: true, timestamp: '10:03 AM' },
    ],
  },
  {
    id: 2,
    user: users.user2,
    lastMessage: 'Got it. I will take a look now.',
    lastMessageTime: '1d ago',
    messages: [
      { id: 1, text: 'Hello, I need help with a React bug.', isSender: false, timestamp: 'Yesterday' },
      { id: 2, text: 'Can you share the repository link?', isSender: true, timestamp: 'Yesterday' },
       { id: 3, text: 'Yes, here it is: github.com/example/repo', isSender: false, timestamp: 'Yesterday' },
       { id: 4, text: 'Got it. I will take a look now.', isSender: true, timestamp: 'Yesterday' },
    ],
  },
  {
    id: 3,
    user: users.user3,
    lastMessage: 'You: Thanks for the feedback!',
    lastMessageTime: '3d ago',
    messages: [
      {id: 1, text: 'The blog post is live. Thanks for your work!', isSender: false, timestamp: '3d ago'},
      {id: 2, text: 'Thanks for the feedback!', isSender: true, timestamp: '3d ago'},
    ],
  },
];

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
  recentReviews: userProfile.reviews.slice(0, 3).map(r => ({...r, name: r.user.name, avatar: r.user.avatar})),
};
