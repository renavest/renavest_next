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
import { createDate } from '@/src/utils/timezone';

interface TherapistCalendlyEmailProps {
  therapistName: string;
  clientName: string;
  clientEmail: string;
}

export const TherapistCalendlyEmail: React.FC<Readonly<TherapistCalendlyEmailProps>> = ({
  therapistName,
  clientName,
  clientEmail,
}) => (
  <Html>
    <Head>
      <Preview>New Client Booking Notification</Preview>
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
              New Client Booking
            </Heading>
          </Section>

          <Text className='text-gray-700 mb-4'>Hi {therapistName}, 👋</Text>

          <Text className='text-gray-600 mb-4'>
            A new client, <strong>{clientName}</strong>, has booked you through Calendly.
          </Text>

          <Text className='text-gray-700 mb-4'>
            Since we do not have the appointment date and time, please reply to this email with the
            date and time of the session so we can update our records.
          </Text>

          <Text className='text-gray-700 mb-4'>
            Client Email: <strong>{clientEmail}</strong>
          </Text>

          <Text className='text-gray-700 mb-4'>
            Thank you for your cooperation!
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
