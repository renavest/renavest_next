export default function WelcomeSection() {
  return (
    <div className='w-full md:w-1/2 flex items-center justify-center p-8 relative overflow-hidden'>
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-[#faf9f6] z-0'>
          {/* Decorative lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className='absolute bg-[#952e8f]/10'
              style={{
                height: '1px',
                width: '100%',
                top: `${i * 12.5}%`,
                transform: 'rotate(-5deg)',
                transformOrigin: 'left',
              }}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className='absolute bg-[#952e8f]/10'
              style={{
                width: '1px',
                height: '100%',
                left: `${i * 12.5}%`,
                transform: 'rotate(5deg)',
                transformOrigin: 'top',
              }}
            />
          ))}
        </div>
      </div>

      <div className='relative z-10 w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border-2 border-[#952e8f]/20'>
        <h1 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight'>
          Welcome to
          <br />
          Renavest!
        </h1>
        <p className='mt-4 text-gray-600'>
          Transform your relationship with money through Financial Therapy
        </p>
      </div>
    </div>
  );
}
