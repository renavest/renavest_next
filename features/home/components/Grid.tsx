"use client";
import React, { useState } from "react";
import AdvisorPopover from "../../profile/AdvisorPopover";
import { Advisor } from "@/shared/types";

interface AdvisorCardProps {
  advisor: Advisor;
  onClick: () => void;
}

const AdvisorCard: React.FC<AdvisorCardProps> = ({ advisor, onClick }) => {
  return (
    <div className="relative flex flex-col mb-4" onClick={onClick}>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200 min-h-60 mb-6">
        <img
          src={advisor.profileUrl || advisor.bookingURL}
          alt={advisor.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-semibold text-gray-900">{advisor.name}</h3>
        <p className="text-sm text-gray-600">{advisor.title}</p>
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            {advisor.yoe} years of experience
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            <p>{advisor.expertise}</p>
          </div>
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">
            {advisor.previewBlurb || advisor.introduction}
          </p>
        </div>
      </div>
    </div>
  );
};

const AdvisorGrid: React.FC<{ advisors: Advisor[] }> = ({ advisors }) => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {advisors.map((advisor) => (
          <AdvisorCard
            key={advisor.id}
            advisor={advisor}
            onClick={() => setSelectedAdvisor(advisor)}
          />
        ))}
      </div>
      {selectedAdvisor && (
        <AdvisorPopover
          advisor={selectedAdvisor}
          isOpen={!!selectedAdvisor}
          position="center"
          onClose={() => setSelectedAdvisor(null)}
        />
      )}
    </div>
  );
};

export default AdvisorGrid;
