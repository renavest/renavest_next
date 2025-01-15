import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from "@/components/ui/button"


interface Advisor {
  id: number;
  name: string;
  title: string;
  clients: string[];
  certifications: string;
  yoe: string;
  song: string;
  profileUrl: string;
  introduction: string;
  expertise: string[];
  bookingURL: string;
  longBio: string;
  previewBlurb: string;
}

interface AdvisorCardProps {
  advisor: Advisor;
}

const AdvisorCard: React.FC<AdvisorCardProps> = ({ advisor }) => {
  return (
    <Popover classname="absolute top-0">
      <div className="relative flex flex-col mb-4">
        <PopoverContent className="w-80 absolute top-0 w-[500px] h-[500px] mx-0">
          <h1>hello</h1>
        </PopoverContent>
        <PopoverTrigger>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl">
            <img
              src={advisor.profileUrl}
              alt={advisor.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-semibold text-gray-900">{advisor.name}</h3>
            <p className="text-sm text-gray-600">{advisor.title}</p>
            <div className="mt-2">
              <p className="text-xs text-gray-500">{advisor.yoe} years of experience</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {advisor.expertise.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                {advisor.previewBlurb || advisor.introduction}
              </p>
            </div>
          </div>
        </PopoverTrigger>
      </div>
    </Popover>      

  );
};

const AdvisorGrid: React.FC<{ advisors: Advisor[] }> = ({ advisors }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {advisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>
    </div>
  );
};

export default AdvisorGrid;