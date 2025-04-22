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

interface BookingConfirmationEmailProps {
  clientName: string;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  timezone: string;
  googleMeetLink?: string;
}

export const BookingConfirmationEmailTemplate: React.FC<
  Readonly<BookingConfirmationEmailProps>
> = ({ clientName, therapistName, sessionDate, sessionTime, timezone, googleMeetLink }) => (
  <Html>
    <Head>
      <Preview>Your Therapy Session is Confirmed</Preview>
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
              New Session Booked
            </Heading>
          </Section>

          <Text className='text-gray-700 mb-4'>Hi {clientName}! 👋</Text>

          <Text className='text-gray-600 mb-4'>
            Great news! Your session is all set and ready to go. Here are the details to help you
            prepare:
          </Text>

          <Section
            className={`${COLORS.WARM_PURPLE['5']} ${COLORS.WARM_PURPLE['20']} p-4 rounded-lg mb-6`}
          >
            <Text className='text-gray-800 my-2'>
              <strong className={COLORS.WARM_PURPLE.DEFAULT}>Your Therapist:</strong>{' '}
              {therapistName}
            </Text>
            <Text className='text-gray-800 my-2'>
              <strong className={COLORS.WARM_PURPLE.DEFAULT}>Date:</strong> {sessionDate}
            </Text>
            <Text className='text-gray-800 my-2'>
              <strong className={COLORS.WARM_PURPLE.DEFAULT}>Time:</strong> {sessionTime}
            </Text>
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
            We're looking forward to supporting you on your financial wellness journey! You can
            review all the details in your Renavest dashboard.
          </Text>

          <Text className='text-gray-700 mb-4'>
            Warmly,
            <br />
            Your Renavest Support Team
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
