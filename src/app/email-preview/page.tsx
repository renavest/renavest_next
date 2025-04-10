'use client';

import { render } from '@react-email/render';
import * as React from 'react';

import { BookingConfirmationEmailTemplate } from '@/src/features/booking/components/EmailTemplates/BookingConfirmationEmailTemplate';
import { TherapistBookingNotificationEmailTemplate } from '@/src/features/booking/components/EmailTemplates/TherapistBookingNotificationEmailTemplate';

export default function EmailPreviewPage() {
  const [previewMode, setPreviewMode] = React.useState<'client' | 'therapist'>('client');
  const [clientHtmlOutput, setClientHtmlOutput] = React.useState('');
  const [therapistHtmlOutput, setTherapistHtmlOutput] = React.useState('');

  React.useEffect(() => {
    const generateHtml = async () => {
      // Sample data for email preview
      const sampleData = {
        clientName: 'John Doe',
        therapistName: 'Dr. Jane Smith',
        sessionDate: 'July 15, 2024',
        sessionTime: '2:00 PM',
        timezone: 'EST',
      };

      // Render client email
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

      // Render therapist email
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

    generateHtml();
  }, []);

  const renderPreview = () => {
    const htmlOutput = previewMode === 'client' ? clientHtmlOutput : therapistHtmlOutput;
    return (
      <iframe srcDoc={htmlOutput} className='w-full h-[600px] border border-gray-300 rounded' />
    );
  };

  const openInNewWindow = () => {
    const htmlOutput = previewMode === 'client' ? clientHtmlOutput : therapistHtmlOutput;
    const title =
      previewMode === 'client' ? 'Client Booking Confirmation' : 'Therapist Booking Notification';

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
            <iframe srcdoc="${htmlOutput.replace(/"/g, '&quot;')}"></iframe>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Email Template Preview</h1>
        <div className='space-x-2'>
          <button
            onClick={() => setPreviewMode('client')}
            className={`px-4 py-2 rounded ${
              previewMode === 'client' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Client Email
          </button>
          <button
            onClick={() => setPreviewMode('therapist')}
            className={`px-4 py-2 rounded ${
              previewMode === 'therapist' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            Therapist Email
          </button>
          <button onClick={openInNewWindow} className='px-4 py-2 bg-green-600 text-white rounded'>
            Open in New Window
          </button>
        </div>
      </div>

      <div className='border border-gray-200 rounded-lg overflow-hidden'>
        {clientHtmlOutput && therapistHtmlOutput ? renderPreview() : <p>Loading preview...</p>}
      </div>
    </div>
  );
}
