'use client';

import React, { useState } from 'react';
import { Clock, User, Info, Calendar, CheckCircle, Circle } from 'lucide-react';

type SessionStatus = 'available' | 'booked' | 'used';

interface Session {
  id: number;
  status: SessionStatus;
}

const FinancialTherapySection: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, status: 'available' },
    { id: 2, status: 'available' },
    { id: 3, status: 'available' }
  ]);

  const availableSessions = sessions.filter(session => session.status === 'available').length;
  const bookedSessions = sessions.filter(session => session.status === 'booked').length;
  const usedSessions = sessions.filter(session => session.status === 'used').length;
  const totalUsed = bookedSessions + usedSessions;
  const progressPercentage = (totalUsed / 3) * 100;

  const handleBookSession = (sessionId: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId && session.status === 'available'
          ? { ...session, status: 'booked' }
          : session
      )
    );
  };

  const getStatusConfig = (status: SessionStatus) => {
    switch (status) {
      case 'available':
        return {
          badge: 'Available',
          badgeColor: 'bg-blue-100 text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          buttonText: 'Book Session',
          disabled: false
        };
      case 'booked':
        return {
          badge: 'Booked',
          badgeColor: 'bg-green-100 text-green-800',
          buttonColor: 'bg-green-600',
          buttonText: 'Booked',
          disabled: true
        };
      case 'used':
        return {
          badge: 'Used',
          badgeColor: 'bg-gray-100 text-gray-800',
          buttonColor: 'bg-gray-400',
          buttonText: 'Completed',
          disabled: true
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Therapy</h2>
        <p className="text-gray-600">
          You have <span className="font-semibold text-blue-600">{availableSessions}</span> sessions available
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Sessions Progress</span>
          <span className="text-sm text-gray-500">{totalUsed}/3 sessions</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Session Cards */}
      <div className="grid gap-4 mb-6">
        {sessions.map((session) => {
          const config = getStatusConfig(session.status);
          return (
            <div
              key={session.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">Session {session.id}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badgeColor}`}>
                      {config.badge}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>1 hour financial therapy</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>Certified Therapist</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBookSession(session.id)}
                  disabled={config.disabled}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 ${config.buttonColor} disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {session.status === 'booked' && <CheckCircle className="w-4 h-4" />}
                  {session.status === 'available' && <Calendar className="w-4 h-4" />}
                  {session.status === 'used' && <Circle className="w-4 h-4" />}
                  {config.buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* How it Works Section */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              Each session is a 1-hour one-on-one consultation with a certified financial therapist. 
              Our therapists help you develop healthy financial habits, overcome money-related stress, 
              and create personalized strategies for your financial wellbeing. Sessions can be booked 
              individually and used within your employment period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialTherapySection;