interface AdvisorPopoverProps {
  advisor: Advisor;
  isOpen: boolean;
  position: string;
  onClose: () => void;
}


const AdvisorPopover: React.FC<AdvisorPopoverProps> = ({ advisor, isOpen, position, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        style={{ minHeight: '650px' }}      
        className="relative mx-4 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row md:gap-6">
          {/* Left column - Image and quick info */}
          <div className="mb-6 md:mb-0 md:w-1/3">
            <div className="overflow-hidden rounded-xl bg-gray-200 min-h-60 mb-6">
              <img
                src={advisor.profileUrl}
                alt={advisor.name}
                className="h-64 w-full object-cover md:h-auto"
              />
            </div>
            {advisor.bookingURL && (
              <a
                href={advisor.bookingURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-violet-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 w-full text-center"
              >
                Book a Session
              </a>
            )}            
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold">Expertise</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {/* {advisor.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                    >
                      {skill}
                    </span>
                  ))} */}
                  <p>{advisor.expertise}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Certifications</h3>
                <p className="mt-1 text-sm text-gray-600">{advisor.certifications}</p>
              </div>
              <div>
                <h3 className="font-semibold">Favorite Song</h3>
                <p className="mt-1 text-sm text-gray-600">{advisor.song}</p>
              </div>
            </div>
          </div>

          {/* Right column - Main content */}
          <div className="md:w-2/3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{advisor.name}</h2>
              <p className="text-lg text-gray-600">{advisor.title}</p>
              <p className="mt-1 text-sm text-gray-500">{advisor.yoe} years of experience</p>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">Introduction</h3>
              <p className="text-gray-700">{advisor.previewBlurb}</p>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-lg font-semibold">Who I Work With</h3>
              {/* <ul className="space-y-1 pl-5 text-gray-700">
                {advisor.clients.map((client, index) => (
                  <li key={index} className="list-disc">{client}</li>
                ))}
              </ul> */}
              <p>{advisor.clientele}</p>
            </div>

            {advisor.longBio && (
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold">About Me</h3>
                <p className="text-gray-700">{advisor.longBio}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorPopover;