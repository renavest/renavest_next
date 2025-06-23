'use client';

import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';

// Component for video library
const VideoLibrary = () => (
  <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
    <h3 className='font-semibold text-gray-800 mb-3'>Video Library</h3>
    <div className='flex space-x-4 items-stretch'>
      <div className='relative h-[250px] w-[150px] md:h-[300px] md:w-[200px] lg:h-[250px] lg:w-[150px]'>
        <Image
          src='https://d2qcuj7ucxw61o.cloudfront.net/atia_demo.jpg'
          alt='Financial Therapy Video 1'
          fill
          className='object-cover rounded-lg'
        />
        <div className='absolute inset-0 flex items-center justify-center'>
          <Play className='w-8 h-8 text-white bg-black/50 rounded-full p-2' />
        </div>
      </div>
      <div className='relative h-[250px] w-[150px]  md:hidden lg:block'>
        <Image
          src='https://d2qcuj7ucxw61o.cloudfront.net/shani_demo.jpg'
          alt='Financial Therapy Video 2'
          fill
          className='object-cover rounded-lg'
        />
        <div className='absolute inset-0 flex items-center justify-center'>
          <Play className='w-8 h-8 text-white bg-black/50 rounded-full p-2' />
        </div>
      </div>
      <button className='text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1'>
        View All
        <ArrowRight className='h-3 w-3 md:h-4 md:w-4' />
      </button>
    </div>
  </div>
);

export default VideoLibrary;
