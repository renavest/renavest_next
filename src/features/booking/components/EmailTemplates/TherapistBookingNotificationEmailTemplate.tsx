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
import * as React from 'react';

import { COLORS } from '@/src/styles/colors';

interface TherapistBookingNotificationEmailProps {
  therapistName: string;
  clientName: string;
  sessionDate: string;
  sessionTime: string;
  timezone: string;
}

export const TherapistBookingNotificationEmailTemplate: React.FC<
  Readonly<TherapistBookingNotificationEmailProps>
> = ({ therapistName, clientName, sessionDate, sessionTime, timezone }) => (
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
              <strong className={COLORS.WARM_PURPLE.DEFAULT}>Date:</strong> {sessionDate}
            </Text>
            <Text className='text-gray-800 my-2'>
              <strong className={COLORS.WARM_PURPLE.DEFAULT}>Time:</strong> {sessionTime}
            </Text>
          </Section>

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
              © {new Date().getFullYear()} Renavest. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
