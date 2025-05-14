import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { DateTime } from 'luxon';
import * as React from 'react';

import { formatDateTime } from '@/src/features/booking/utils/dateTimeUtils';
import { COLORS } from '@/src/styles/colors';
import { createDate } from '@/src/utils/timezone';

interface TherapistBookingNotificationEmailProps {
  therapistName: string;
  clientName: string;
  sessionDate: string;
  sessionTime: string;
  clientTimezone: string;
  therapistTimezone: string;
  googleMeetLink?: string;
}

export const TherapistBookingNotificationEmailTemplate: React.FC<
  Readonly<TherapistBookingNotificationEmailProps>
> = ({
  therapistName,
  clientName,
  sessionDate,
  sessionTime,
  clientTimezone: _clientTimezone,
  therapistTimezone,
  googleMeetLink,
}) => {
  // Use therapistTimezone for display
  let dateObj: { date: string; time: string; timezone: string };
  let parseError = '';
  if (typeof sessionDate === 'string' && typeof sessionTime === 'string') {
    const dt = DateTime.fromFormat(`${sessionDate} ${sessionTime}`, 'yyyy-MM-dd HH:mm', {
      zone: therapistTimezone,
    });
    if (dt.isValid) {
      dateObj = formatDateTime(dt, therapistTimezone);
    } else {
      dateObj = { date: 'Invalid DateTime', time: 'Invalid DateTime', timezone: therapistTimezone };
      parseError = `Invalid DateTime: ${sessionDate} ${sessionTime} (${therapistTimezone})`;

      if (typeof window === 'undefined') console.error(parseError);
    }
  } else {
    dateObj = { date: sessionDate, time: sessionTime, timezone: therapistTimezone };
  }

  return (
    <Html>
      <Head>
        <Preview>New Client Session Scheduled</Preview>
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
          rel='stylesheet'
        />
        <style>
          {`
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }
          `}
        </style>
      </Head>
      <Tailwind>
        <Body className={`${COLORS.WARM_WHITE.bg} font-inter`}>
          <Container className='max-w-xl mx-auto p-6'>
            <Section
              className={`${COLORS.WARM_PURPLE.bg} text-white p-4 rounded-lg mb-6 text-center`}
            >
              <Heading as='h1' className='text-2xl font-semibold m-0'>
                New Client Session Scheduled
              </Heading>
            </Section>

            <Text className='text-gray-700 mb-4'>Hi {therapistName}, 👋</Text>

            <Text className='text-gray-600 mb-4'>
              A new client session has been booked on your calendar. Here are the details:
            </Text>

            <Section
              className={`${COLORS.WARM_PURPLE['5']} ${COLORS.WARM_PURPLE['20']} p-4 rounded-lg mb-6`}
            >
              <Text className='text-gray-800 my-2'>
                <strong className={COLORS.WARM_PURPLE.DEFAULT}>Client Name:</strong> {clientName}
              </Text>
              <Text className='text-gray-800 my-2'>
                <strong className={COLORS.WARM_PURPLE.DEFAULT}>Date:</strong> {dateObj.date}
              </Text>
              <Text className='text-gray-800 my-2'>
                <strong className={COLORS.WARM_PURPLE.DEFAULT}>Time:</strong> {dateObj.time}{' '}
                {dateObj.timezone}
              </Text>
              <Text className='text-gray-800 my-2'>
                <strong className={COLORS.WARM_PURPLE.DEFAULT}>Timezone:</strong> {dateObj.timezone}
              </Text>
              {parseError && <Text className='text-red-600 my-2'>{parseError}</Text>}
            </Section>

            {googleMeetLink && (
              <Section className='text-center mb-6'>
                <a
                  href={googleMeetLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-block px-6 py-2 bg-[#9071FF] text-white rounded-full text-base font-semibold shadow hover:bg-[#7a5fd6] transition-colors'
                >
                  Join Google Meet
                </a>
              </Section>
            )}

            <Text className='text-gray-600 mb-4'>
              Take a moment to review the client's profile and prepare for your upcoming session.
              Remember, every conversation is an opportunity to guide your client towards financial
              and emotional wellness.
            </Text>

            <Text className='text-gray-700 mb-4'>
              Best wishes,
              <br />
              Renavest Scheduling Team
            </Text>

            <Section className={`${COLORS.WARM_PURPLE['10']} p-3 rounded-lg text-center mt-6`}>
              <Text className={`${COLORS.WARM_PURPLE.DEFAULT} text-xs m-0`}>
                © {createDate().year} Renavest. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
