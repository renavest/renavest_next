import { NextResponse } from 'next/server';

import { kv, CACHE_KEYS } from '@/src/features/stripe';

export async function GET() {
  try {
    console.log('Testing Upstash connection...');

    // Test basic connection
    const testKey = 'test:connection';
    const testValue = {
      timestamp: Date.now(),
      message: 'Upstash connection test',
      environment: process.env.NODE_ENV,
    };

    // Write to KV
    await kv.set(testKey, testValue, { ex: 60 }); // Expire in 60 seconds
    console.log('✅ Successfully wrote to Upstash');

    // Read from KV
    const retrieved = await kv.get(testKey);
    console.log('✅ Successfully read from Upstash:', retrieved);

    // Test cache key generation
    const userSubKey = CACHE_KEYS.userSubscription('test_user_123');
    const customerKey = CACHE_KEYS.stripeCustomer('test_user_456');
    const therapistKey = CACHE_KEYS.therapistAccount('test_therapist_789');

    console.log('Cache keys generated:', {
      userSubKey,
      customerKey,
      therapistKey,
    });

    return NextResponse.json({
      success: true,
      message: 'Upstash connection successful',
      testData: {
        written: testValue,
        retrieved,
        cacheKeys: {
          userSubKey,
          customerKey,
          therapistKey,
        },
      },
      environment: process.env.NODE_ENV,
      upstashUrl: process.env.UPSTASH_REDIS_REST_URL ? 'Configured' : 'Missing',
      upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Configured' : 'Missing',
    });
  } catch (error) {
    console.error('❌ Upstash connection test failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        upstashUrl: process.env.UPSTASH_REDIS_REST_URL ? 'Configured' : 'Missing',
        upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Configured' : 'Missing',
      },
      { status: 500 },
    );
  }
}
