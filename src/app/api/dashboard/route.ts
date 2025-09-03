
'use server';
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import ServiceModel from '@/models/Service';
import RequestModel from '@/models/Request';
import ReviewModel from '@/models/Review';
import { Types } from 'mongoose';

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

    const userServices = await ServiceModel.find({ user: userId });
    const userRequests = await RequestModel.find({ user: userId });
    const userReviews = await ReviewModel.find({ user: userId }).populate('reviewer', 'name avatar');

    const totalEarnings = userServices.reduce((acc, service) => acc + service.price, 0);
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


    return NextResponse.json({
      totalEarnings,
      completedTasks,
      activeTasks,
      averageRating,
      totalReviews,
      reviews: formattedReviews,
       performance: [
        { month: 'Jan', earnings: 600, tasks: 5 },
        { month: 'Feb', earnings: 800, tasks: 7 },
        { month: 'Mar', earnings: 750, tasks: 6 },
        { month: 'Apr', earnings: 1200, tasks: 9 },
        { month: 'May', earnings: 900, tasks: 8 },
        { month: 'Jun', earnings: 1500, tasks: 11 },
      ],
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
