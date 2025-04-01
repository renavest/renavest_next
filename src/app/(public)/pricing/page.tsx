import DashboardHeader from '@/src/features/employee-dashboard/components/DashboardHeader';
import {
  PricingCard,
  PricingHeader,
  WhyChooseUs,
  CTASection,
} from '@/src/features/pricing/components';
import { plans, Plan } from '@/src/features/pricing/data/pricing-data';

export default function PricingPage() {
  return (
    <div className='bg-white py-24'>
      <DashboardHeader />
      <div className='mx-auto max-w-7xl px-6 lg:px-8 pt-16'>
        <PricingHeader />

        <div className='isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3'>
          {plans.map((plan: Plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className='mt-20 flex flex-col items-center'>
          <WhyChooseUs />
          <CTASection />
        </div>
      </div>
    </div>
  );
}




