'use client';

import { render } from '@react-email/render';
import * as React from 'react';

import { BookingConfirmationEmailTemplate } from './EmailTemplates/BookingConfirmationEmailTemplate';
import { TherapistBookingNotificationEmailTemplate } from './EmailTemplates/TherapistBookingNotificationEmailTemplate';

export function EmailPreview() {
  const [clientHtmlOutput, setClientHtmlOutput] = React.useState('');
  const [therapistHtmlOutput, setTherapistHtmlOutput] = React.useState('');

  React.useEffect(() => {
    // Sample data for email preview
    const sampleData = {
      clientName: 'Emily Rodriguez',
      therapistName: 'Dr. Alex Chen',
      sessionDate: 'August 22, 2024',
      sessionTime: '3:30 PM',
      timezone: 'PST',
    };

    // Render client email
    const renderClientEmail = async () => {
      const clientHtml = await render(
        <BookingConfirmationEmailTemplate
          clientName={sampleData.clientName}
          therapistName={sampleData.therapistName}
          sessionDate={sampleData.sessionDate}
          sessionTime={sampleData.sessionTime}
          timezone={sampleData.timezone}
        />,
      );
      setClientHtmlOutput(clientHtml);
    };

    // Render therapist email
    const renderTherapistEmail = async () => {
      const therapistHtml = await render(
        <TherapistBookingNotificationEmailTemplate
          therapistName={sampleData.therapistName}
          clientName={sampleData.clientName}
          sessionDate={sampleData.sessionDate}
          sessionTime={sampleData.sessionTime}
          timezone={sampleData.timezone}
        />,
      );
      setTherapistHtmlOutput(therapistHtml);
    };

    // Call both rendering functions
    renderClientEmail();
    renderTherapistEmail();
  }, []);

  const openInNewWindow = (htmlContent: string, title: string) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { margin: 0; }
              iframe { width: 100%; height: 100vh; border: none; }
            </style>
          </head>
          <body>
            <iframe srcdoc="${htmlContent.replace(/"/g, '&quot;')}"></iframe>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className='p-4 bg-gray-100 space-y-4'>
      <h2 className='text-2xl font-bold mb-4'>Email Templates Preview</h2>

      <div className='grid md:grid-cols-2 gap-4'>
        {/* Client Email Preview */}
        <div>
          <h3 className='text-xl font-semibold mb-2'>Client Email</h3>
          {clientHtmlOutput ? (
            <div className='space-y-2'>
              <iframe
                srcDoc={clientHtmlOutput}
                className='w-full h-[600px] border border-gray-300 rounded'
                title='Client Email Preview'
              />
              <button
                onClick={() => openInNewWindow(clientHtmlOutput, 'Client Booking Confirmation')}
                className='w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition'
              >
                Open Client Email in New Window
              </button>
            </div>
          ) : (
            <p>Generating client email preview...</p>
          )}
        </div>

        {/* Therapist Email Preview */}
        <div>
          <h3 className='text-xl font-semibold mb-2'>Therapist Email</h3>
          {therapistHtmlOutput ? (
            <div className='space-y-2'>
              <iframe
                srcDoc={therapistHtmlOutput}
                className='w-full h-[600px] border border-gray-300 rounded'
                title='Therapist Email Preview'
              />
              <button
                onClick={() =>
                  openInNewWindow(therapistHtmlOutput, 'Therapist Booking Notification')
                }
                className='w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition'
              >
                Open Therapist Email in New Window
              </button>
            </div>
          ) : (
            <p>Generating therapist email preview...</p>
          )}
        </div>
      </div>
    </div>
  );
}
