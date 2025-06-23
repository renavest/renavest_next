import Image from 'next/image';
import Link from 'next/link';

import { getCurrentYear } from '@/src/utils/timezone';

function Footer() {
  return (
    <footer className='bg-gray-50 border-t border-gray-200 py-8 md:py-10'>
      <div className='max-w-6xl mx-auto px-6 md:px-10 flex justify-between items-center'>
        <div className='flex items-center'>
          <div className='relative w-10 h-10 mr-3'>
            <Image
              src='/renavestlogo.png'
              alt='Renavest Logo'
              width={40}
              height={40}
              className='object-contain'
            />
          </div>
          <p className='text-gray-500 text-sm'>
            © {getCurrentYear()} Renavest. All rights reserved.
          </p>
        </div>
        <div className='flex space-x-4'>
          <Link
            href='https://www.linkedin.com/company/renavest'
            target='_blank'
            rel='noopener noreferrer'
            className='text-gray-500 hover:text-[#9071FF]'
          >
            <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
              <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z' />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
