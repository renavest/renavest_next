import { Inter } from 'next/font/google';

import BusinessImpactSection from '@/src/features/home/components/BusinessImpactSection';
import Footer from '@/src/features/home/components/Footer';
import HeroSection from '@/src/features/home/components/HeroSection';
import JasmineJourneySection from '@/src/features/home/components/JasmineJourneySection';
import Navbar from '@/src/features/home/components/Navbar';
import TestimonialSection from '@/src/features/home/components/TestimonialSection';

const inter = Inter({ subsets: ['latin'] });

export default function HomePage() {
  return (
    <div className={`min-h-screen bg-white ${inter.className}`}>
      <Navbar />
      <HeroSection />
      <JasmineJourneySection />
      <BusinessImpactSection />
      <TestimonialSection />
      <Footer />
    </div>
  );
}
