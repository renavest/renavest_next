'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, CreditCard } from 'lucide-react';

import MetricCard from '@/src/shared/components/MetricCard';
import { COLORS } from '@/src/styles/colors';

interface SponsoredGroup {
  id: number;
  name: string;
  groupType: string;
  description: string;
  memberCount: number;
  allocatedSessionCredits: number;
  remainingSessionCredits: number;
  isActive: boolean;
  createdAt: string;
}

export function SponsoredGroupsSection() {
  const [sponsoredGroups, setSponsoredGroups] = useState<SponsoredGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSponsoredGroups();
  }, []);

  const fetchSponsoredGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employer/sponsored-groups');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sponsored groups');
      }

      const data = await response.json();
      setSponsoredGroups(data.sponsoredGroups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const totalGroups = sponsoredGroups.length;
  const totalMembers = sponsoredGroups.reduce((sum, group) => sum + group.memberCount, 0);
  const totalCreditsAllocated = sponsoredGroups.reduce((sum, group) => sum + group.allocatedSessionCredits, 0);
  const totalCreditsRemaining = sponsoredGroups.reduce((sum, group) => sum + group.remainingSessionCredits, 0);
  const creditsUtilization = totalCreditsAllocated > 0 
    ? Math.round(((totalCreditsAllocated - totalCreditsRemaining) / totalCreditsAllocated) * 100)
    : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Sponsored Groups</h3>
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchSponsoredGroups}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Sponsored Groups"
          value={totalGroups.toString()}
          subtitle="Groups with members"
          className="bg-blue-50 border border-blue-200 shadow-sm rounded-xl"
          titleClassName="text-gray-600"
          valueClassName="text-blue-600"
          subtitleClassName="text-gray-500"
        />
        
        <MetricCard
          title="Total Members"
          value={totalMembers.toString()}
          subtitle="Across all groups"
          className="bg-green-50 border border-green-200 shadow-sm rounded-xl"
          titleClassName="text-gray-600"
          valueClassName="text-green-600"
          subtitleClassName="text-gray-500"
        />
        
        <MetricCard
          title="Credits Utilization"
          value={`${creditsUtilization}%`}
          subtitle={`${totalCreditsRemaining} of ${totalCreditsAllocated} remaining`}
          className="bg-purple-50 border border-purple-200 shadow-sm rounded-xl"
          titleClassName="text-gray-600"
          valueClassName="text-purple-600"
          subtitleClassName="text-gray-500"
        />
      </div>

      {/* Sponsored Groups List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Sponsored Groups</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your organization's sponsored groups and track their usage
          </p>
        </div>

        {sponsoredGroups.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Sponsored Groups Yet</h4>
            <p className="text-gray-600 mb-4">
              Sponsored groups will appear here when employees join through group signup links.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sponsoredGroups.map((group) => (
              <div key={group.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{group.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        group.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {group.groupType}
                      </span>
                    </div>
                    
                    {group.description && (
                      <p className="text-gray-600 mb-3">{group.description}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{group.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        <span>{group.remainingSessionCredits} of {group.allocatedSessionCredits} credits remaining</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          {group.allocatedSessionCredits > 0 
                            ? Math.round(((group.allocatedSessionCredits - group.remainingSessionCredits) / group.allocatedSessionCredits) * 100)
                            : 0
                          }% utilized
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                      View Details
                    </button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Manage Credits
                    </button>
                  </div>
                </div>
                
                {/* Progress bar for credits */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Session Credits Usage</span>
                    <span>{group.allocatedSessionCredits - group.remainingSessionCredits} / {group.allocatedSessionCredits} used</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: group.allocatedSessionCredits > 0 
                          ? `${((group.allocatedSessionCredits - group.remainingSessionCredits) / group.allocatedSessionCredits) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 