'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SubscriptionPlansCard } from '@/src/features/billing/components/SubscriptionPlansCard';

interface SponsorshipInfo {
  eligible: boolean;
  employer?: {
    id: number;
    name: string;
    allowsSponsorship: boolean;
  };
  sponsoredGroups?: Array<{
    id: number;
    name: string;
    type: string;
  }>;
  defaultSubsidyPercentage?: number;
}

interface SubscriptionStatus {
  status: string;
  subscriptionId: string | null;
  priceId: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
}

export default function BillingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [sponsorshipInfo, setSponsorshipInfo] = useState<SponsorshipInfo | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([fetchSponsorshipInfo(), fetchSubscriptionStatus()]).finally(() =>
        setLoading(false),
      );
    }
  }, [user]);

  const fetchSponsorshipInfo = async () => {
    try {
      const response = await fetch('/api/stripe/subscriptions/sponsored');
      const data = await response.json();
      setSponsorshipInfo(data);
    } catch (error) {
      console.error('Error fetching sponsorship info:', error);
      setSponsorshipInfo({ eligible: false });
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/stripe/subscriptions');
      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const handleSubscribe = async (priceId: string, isSponsored?: boolean) => {
    try {
      const endpoint = isSponsored
        ? '/api/stripe/subscriptions/sponsored'
        : '/api/stripe/subscriptions';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (isSponsored) {
          // For sponsored subscriptions, we might get immediate activation
          // Refresh subscription status
          await fetchSubscriptionStatus();
          // Show success message or redirect
          window.location.href = data.redirectUrl;
        } else {
          // Regular subscription flow - redirect to Stripe checkout
          window.location.href = data.url;
        }
      } else {
        throw new Error(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <div className='text-center'>
          <div className='text-lg text-gray-600'>Loading billing information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4 max-w-6xl'>
      <div className='mb-8'>
        <button
          onClick={() => {
            setIsNavigating(true);
            router.push('/employee');
          }}
          disabled={isNavigating}
          className='inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors font-medium disabled:opacity-50'
        >
          {isNavigating ? (
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          ) : (
            <ArrowLeft className='w-4 h-4 mr-2' />
          )}
          Back to Dashboard
        </button>

        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Billing & Subscriptions</h1>
        <p className='text-gray-600'>
          Manage your subscription and unlock premium features like direct messaging with
          therapists.
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscriptionStatus && subscriptionStatus.status !== 'none' && (
        <div className='mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl'>
          <h2 className='text-lg font-semibold text-blue-900 mb-2'>Current Subscription</h2>
          <div className='text-blue-800'>
            <p>
              Status: <span className='font-medium capitalize'>{subscriptionStatus.status}</span>
            </p>
            {subscriptionStatus.currentPeriodEnd && (
              <p>
                Next billing:{' '}
                {new Date(subscriptionStatus.currentPeriodEnd * 1000).toLocaleDateString()}
              </p>
            )}
            {subscriptionStatus.cancelAtPeriodEnd && (
              <p className='text-orange-600 font-medium mt-2'>
                Your subscription will cancel at the end of the current period.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <SubscriptionPlansCard
        currentPlan={subscriptionStatus?.priceId}
        hasEmployerSponsorship={sponsorshipInfo?.eligible}
        employerName={sponsorshipInfo?.employer?.name}
        onSubscribe={handleSubscribe}
        className='mb-8'
      />

      {/* Employer Sponsorship Info */}
      {sponsorshipInfo?.eligible && sponsorshipInfo.employer && (
        <div className='bg-green-50 border border-green-200 rounded-xl p-6'>
          <h2 className='text-lg font-semibold text-green-900 mb-4'>Employer Benefits Available</h2>

          <div className='space-y-3'>
            <div>
              <h3 className='font-medium text-green-800'>{sponsorshipInfo.employer.name}</h3>
              <p className='text-sm text-green-700'>
                Your employer offers subscription sponsorship and mental health benefits.
              </p>
            </div>

            {sponsorshipInfo.defaultSubsidyPercentage &&
              sponsorshipInfo.defaultSubsidyPercentage > 0 && (
                <div className='p-3 bg-green-100 rounded-lg'>
                  <p className='text-sm text-green-800'>
                    <span className='font-medium'>Company-wide benefit:</span>{' '}
                    {sponsorshipInfo.defaultSubsidyPercentage}% subsidy on all sessions
                  </p>
                </div>
              )}

            {sponsorshipInfo.sponsoredGroups && sponsorshipInfo.sponsoredGroups.length > 0 && (
              <div>
                <h4 className='font-medium text-green-800 mb-2'>Your Sponsored Groups:</h4>
                <div className='space-y-1'>
                  {sponsorshipInfo.sponsoredGroups.map((group) => (
                    <div key={group.id} className='text-sm text-green-700'>
                      • {group.name} ({group.type})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
