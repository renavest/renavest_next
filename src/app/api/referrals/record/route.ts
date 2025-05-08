import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// This would typically store the referral in your database
export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { referrerId, referredId } = await request.json();

    if (!referrerId || !referredId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real implementation, you would store this in your database
    // For example:
    // await prisma.referral.create({
    //   data: {
    //     referrerId: referrerId,
    //     referredId: referredId,
    //     status: 'COMPLETED',
    //     completedAt: new Date(),
    //   }
    // });

    // For now, we'll just log it
    console.log(`Recorded referral: ${referrerId} referred ${referredId}`);

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording referral:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
