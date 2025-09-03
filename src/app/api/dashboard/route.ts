
'use server';
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import ServiceModel from '@/models/Service';
import RequestModel from '@/models/Request';
import ReviewModel from '@/models/Review';
import { Types } from 'mongoose';
import { subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = verifyJwt(token);
    if (!decodedToken || !decodedToken.id) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = new Types.ObjectId(decodedToken.id);

    // Fetch all data in parallel
    const [userServices, userRequests, userReviews] = await Promise.all([
      ServiceModel.find({ user: userId }),
      RequestModel.find({ user: userId }),
      ReviewModel.find({ user: userId }).populate('reviewer', 'name avatar')
    ]);

    const totalEarnings = userServices.reduce((acc, service) => acc + (service.price || 0), 0);
    const completedTasks = userServices.length; 
    const activeTasks = userRequests.length;

    const totalReviews = userReviews.length;
    const averageRating = totalReviews > 0
      ? userReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
      : 0;
      
    const formattedReviews = userReviews.map(review => ({
        id: review._id.toString(),
        comment: review.comment,
        rating: review.rating,
        user: { // This is the reviewer
            name: (review.reviewer as any).name,
            avatar: (review.reviewer as any).avatar
        }
    }));

    // --- Generate Monthly Performance Data ---
    const performanceData: { [key: string]: { earnings: number, tasks: number } } = {};
    const monthLabels: { [key: string]: string } = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, 'yyyy-MM');
        const monthName = format(date, 'MMM');
        performanceData[monthKey] = { earnings: 0, tasks: 0 };
        monthLabels[monthKey] = monthName;
    }

    // Process services
    userServices.forEach(service => {
        if (service.createdAt) {
            const monthKey = format(new Date(service.createdAt), 'yyyy-MM');
            if (performanceData[monthKey]) {
                performanceData[monthKey].earnings += service.price;
                performanceData[monthKey].tasks += 1;
            }
        }
    });

    const performance = Object.keys(performanceData).map(key => ({
        month: monthLabels[key],
        ...performanceData[key]
    })).slice(-6); // Ensure only last 6 months are sent


    return NextResponse.json({
      totalEarnings,
      completedTasks,
      activeTasks,
      averageRating,
      totalReviews,
      reviews: formattedReviews,
      performance,
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
