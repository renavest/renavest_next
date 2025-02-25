"use client";
import { useSignal, useComputed } from "@preact/signals-react";
import React, { useCallback, useEffect } from "react";
import AdvisorPopover from "../../profile/AdvisorPopover";
import { Advisor } from "@/src/shared/types";
import { Award } from "lucide-react";
import Image from "next/image";

interface AdvisorCardProps {
  advisor: Advisor;
  onSelect: (advisor:Advisor) => void;
}

const AdvisorGrid: React.FC<{ advisors: Advisor[] }> = ({ advisors }) => {

  // Create signals at component level
  const selectedAdvisor = useSignal<Advisor | null>(null);
  const isModalOpen = useSignal(false);

  // Create a computed value that will trigger re-renders
  const modalState = useComputed(() => ({
    advisor: selectedAdvisor.value,
    isOpen: isModalOpen.value
  }));

  // Add effect to log state changes
  useEffect(() => {
    console.log('Modal state changed:', {
      advisor: modalState.value.advisor?.name,
      isOpen: modalState.value.isOpen
    });
  }, [modalState.value]);

  const handleSelect = useCallback((advisor: Advisor) => {
    console.log('handleSelect called with:', advisor.name);
    // Force synchronous updates
    Promise.resolve().then(() => {
      selectedAdvisor.value = advisor;
      isModalOpen.value = true;
    });
  }, []);

  const handleClose = useCallback(() => {
    console.log('handleClose called');
    // Force synchronous updates
    Promise.resolve().then(() => {
      isModalOpen.value = false;
      selectedAdvisor.value = null;
    });
  }, []);

  // Render with modalState value to ensure updates
  const { advisor, isOpen } = modalState.value;
  
  console.log('Rendering Grid with:', { advisorName: advisor?.name, isOpen });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-8xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {advisors.map((advisor) => (
          <AdvisorCard
            key={advisor.id}
            advisor={advisor}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <AdvisorPopover
        advisor={advisor}
        isOpen={isOpen}
        position="center"
        onClose={handleClose}
      />
    </div>
  );
};

const AdvisorCard: React.FC<AdvisorCardProps> = ({ advisor, onSelect }) => {

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Card clicked:', advisor.name);
    onSelect(advisor);
  }, [advisor, onSelect]);

  return (
    <div
      onClick={handleClick}
      className="relative rounded-2xl flex flex-col mb-4 p-4 hover:bg-[#ecc0ff] hover:p-4 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="group relative aspect-[3/4] w-full overflow-hidden">
        <Image
          width={350}
          height={350}
          src={advisor.profileUrl || "/experts/placeholderexp.png"}
          alt={advisor.name}
          className="h-full w-full rounded-2xl object-cover object-top transition-transform duration-500 group-hover:scale-110"
        />
        {/* Experience Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium tracking-wide text-gray-700 shadow-sm">
          {advisor.yoe} years of experience
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 tracking-wide">
              {advisor.name}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5 flex items-center tracking-wide">
              <Award className="w-4 h-4 mr-1" />
              {advisor.title}
            </p>
          </div>
        </div>

        {/* Expertise Tags (Clamped) */}
        <div className="mt-2 flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
          {advisor.expertise?.split(",")?.map((exp, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full tracking-wide"
            >
              {exp.trim()}
            </span>
          ))}
        </div>

        {/* Preview Text (Clamped) */}
        <p className="mt-3 text-sm text-gray-600 tracking-wide line-clamp-3">
          {advisor.previewBlurb || advisor.introduction}
        </p>
      </div>
    </div>
  );
};

export default AdvisorGrid;
