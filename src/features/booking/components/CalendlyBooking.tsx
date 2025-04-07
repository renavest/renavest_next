// 'use client';

// import { useUser } from '@clerk/nextjs';
// import posthog from 'posthog-js';
// import { InlineWidget, useCalendlyEventListener } from 'react-calendly';

// import { COLORS } from '@/src/styles/colors';

// interface CalendlyBookingProps {
//   advisorId?: string;
//   advisorName?: string;
//   advisorUrl: string;
//   onEventScheduled: (eventData: any) => void;
// }

// export const CalendlyBooking = ({
//   advisorId,
//   advisorName,
//   advisorUrl,
//   onEventScheduled,
// }: CalendlyBookingProps) => {
//   const { user } = useUser();

//   useCalendlyEventListener({
//     onProfilePageViewed: () => {
//       console.log('onProfilePageViewed');
//       posthog.capture('calendly_profile_viewed', {
//         therapist_id: advisorId,
//         therapist_name: advisorName,
//       });
//     },
//     onDateAndTimeSelected: () => {
//       console.log('onDateAndTimeSelected');
//       posthog.capture('calendly_date_time_selected', {
//         therapist_id: advisorId,
//         therapist_name: advisorName,
//       });
//     },
//     onEventTypeViewed: () => {
//       console.log('onEventTypeViewed');
//       posthog.capture('calendly_event_type_viewed', {
//         therapist_id: advisorId,
//         therapist_name: advisorName,
//       });
//     },
//     onEventScheduled: (e) => {
//       console.log('Calendly event scheduled:', e.data.payload);
//       onEventScheduled(e);
//       posthog.capture('calendly_event_scheduled', {
//         therapist_id: advisorId,
//         therapist_name: advisorName,
//         event_data: e.data.payload,
//       });
//     },
//     onPageHeightResize: (e) => {
//       console.log('Calendly page height:', e.data.payload.height);
//     },
//   });

//   return (
//     <div className='fixed inset-0 z-50 bg-white'>
//       <div className='absolute top-4 left-4 right-4 z-10 flex justify-between items-center'>
//         <h1 className={`text-xl font-semibold ${COLORS.WARM_PURPLE.DEFAULT}`}>
//           Book a Session with {advisorName}
//         </h1>
//       </div>
//       <InlineWidget
//         url={advisorUrl}
//         styles={{
//           height: '100%',
//           width: '100%',
//           minHeight: '100vh',
//         }}
//         prefill={{
//           email: user?.emailAddresses[0]?.emailAddress || '',
//           firstName: user?.firstName || '',
//           lastName: user?.lastName || '',
//         }}
//         pageSettings={{
//           backgroundColor: 'ffffff',
//           primaryColor: COLORS.WARM_PURPLE.DEFAULT,
//         }}
//       />
//     </div>
//   );
// };
