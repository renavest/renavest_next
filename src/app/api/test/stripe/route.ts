import { NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/src/features/stripe';

export async function GET() {
  try {
    console.log('Testing Stripe connection...');

    // Test Stripe connection with a simple API call
    const balance = await stripe.balance.retrieve();
    console.log('✅ Successfully connected to Stripe');

    // Test creating a customer (this is a safe test)
    const testCustomer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
      metadata: {
        test: 'true',
        created_by: 'upstash_test_endpoint',
      },
    });
    console.log('✅ Successfully created test customer:', testCustomer.id);

    // Clean up by deleting the test customer
    await stripe.customers.del(testCustomer.id);
    console.log('✅ Successfully deleted test customer');

    return NextResponse.json({
      success: true,
      message: 'Stripe connection successful',
      testData: {
        balanceAvailable: balance.available.length > 0,
        balancePending: balance.pending.length > 0,
        testCustomerCreated: testCustomer.id,
        testCustomerDeleted: true,
      },
      config: {
        environment: process.env.NODE_ENV,
        stripeKeyConfigured: !!STRIPE_CONFIG.SECRET_KEY,
        webhookSecretConfigured: !!STRIPE_CONFIG.WEBHOOK_SECRET,
        keyPrefix: STRIPE_CONFIG.SECRET_KEY?.substring(0, 8) + '...',
      },
    });
  } catch (error) {
    console.error('❌ Stripe connection test failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        config: {
          environment: process.env.NODE_ENV,
          stripeKeyConfigured: !!STRIPE_CONFIG.SECRET_KEY,
          webhookSecretConfigured: !!STRIPE_CONFIG.WEBHOOK_SECRET,
          keyPrefix: STRIPE_CONFIG.SECRET_KEY?.substring(0, 8) + '...',
        },
      },
      { status: 500 },
    );
  }
}
