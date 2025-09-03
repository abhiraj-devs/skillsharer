
'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import ReviewModel from '@/models/Review';
import UserModel from '@/models/User';
import { Types } from 'mongoose';

// GET reviews for a specific user
export async function GET(request: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    try {
        const reviews = await ReviewModel.find({ user: new Types.ObjectId(userId) })
            .populate({ path: 'reviewer', model: UserModel, select: 'name avatar' })
            .sort({ createdAt: -1 });

        const formattedReviews = reviews.map(review => ({
            id: review._id.toString(),
            rating: review.rating,
            comment: review.comment,
            reviewer: {
                id: (review.reviewer as any)._id.toString(),
                name: (review.reviewer as any).name,
                avatar: (review.reviewer as any).avatar,
            },
            createdAt: review.createdAt,
        }));
        
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
            : 0;

        return NextResponse.json({ reviews: formattedReviews, averageRating, totalReviews });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching reviews' }, { status: 500 });
    }
}


// POST a new review for a user
export async function POST(request: NextRequest) {
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
    
    const reviewerId = new Types.ObjectId(decodedToken.id);

    try {
        const body = await request.json();
        const { userId, rating, comment } = body;

        if (!userId || !rating || !comment) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        if (reviewerId.toString() === userId) {
            return NextResponse.json({ message: 'You cannot review yourself.' }, { status: 400 });
        }
        
        const newReview = new ReviewModel({
            user: new Types.ObjectId(userId),
            reviewer: reviewerId,
            rating,
            comment
        });

        await newReview.save();

        const createdReview = await ReviewModel.findById(newReview._id).populate({ path: 'reviewer', model: UserModel, select: 'name avatar' });

         if (!createdReview) {
          throw new Error('Review creation failed');
        }

        const responseReview = {
            id: createdReview._id.toString(),
            rating: createdReview.rating,
            comment: createdReview.comment,
            reviewer: {
                id: (createdReview.reviewer as any)._id.toString(),
                name: (createdReview.reviewer as any).name,
                avatar: (createdReview.reviewer as any).avatar,
            },
            createdAt: createdReview.createdAt,
        };

        return NextResponse.json(responseReview, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating review' }, { status: 500 });
    }
}
