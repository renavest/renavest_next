'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";

interface FloatingHeaderProps {
  title: string;
}

const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  title,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 
        z-50
        transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-violet-500 py-2'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          <Image
            className='mr-4'
            src="/renavestlogo.avif"
            alt="Renavest Logo"
            width={50}
            height={50}
          />
          {/* Title */}
          <h1 
            className={`
              text-2xl font-semibold
              transition-all duration-300
              ${isScrolled ? 'text-gray-800' : 'text-white'}
            `}
          >
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
};

// Example usage
const Example = () => {
//   const handleCtaClick = () => {
//     console.log('CTA clicked!');
//   };

  return (
    <div>
      <FloatingHeader
        title="Renavest"
      />
    </div>
  );
};

export default Example;