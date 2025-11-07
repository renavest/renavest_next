'use client';
import Image from 'next/image';
import React from 'react';

interface TherapistCardProps {
  name: string;
  title: string;
  expertise: string;
  previewblurb: string | null;
  profileurl: string | null;
  onClick: () => void;
}

export default function TherapistCard({ 
  name, 
  title, 
  expertise, 
  previewblurb,
  profileurl,
  onClick
}: TherapistCardProps) {
  // Split expertise by commas and trim whitespace
  const expertiseItems = expertise.split(',').map(item => item.trim());

  const handleClick = () => {
    onClick();
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-square overflow-hidden rounded-xl mb-3 bg-gray-100">
        {profileurl ? (
          <Image
            src={profileurl}
            alt={name}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, rgb(144, 113, 255), rgb(164, 143, 255))' }}>
            <span className="text-6xl text-white font-semibold">
              {name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {name}
        </h3>
        
        <p className="text-sm text-gray-600">
          {title}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {expertiseItems.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium  bg-accent-dark text-white"
            >
              {item}
            </span>
          ))}
        </div>
        
        {previewblurb && (
          <p className="text-sm text-gray-700 leading-relaxed pt-1 line-clamp-3">
            {previewblurb}
          </p>
        )}
      </div>
    </div>
  );
}
