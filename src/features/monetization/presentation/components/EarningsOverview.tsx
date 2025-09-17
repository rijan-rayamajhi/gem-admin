'use client';

import { useMonetization } from '../providers/MonetizationProvider';

export default function EarningsOverview() {
  const { earnings, loadingEarnings } = useMonetization();

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.totalEarnings, 0);
  const totalAvailableBalance = earnings.reduce((sum, earning) => sum + earning.availableBalance, 0);
  const totalPendingBalance = earnings.reduce((sum, earning) => sum + earning.pendingBalance, 0);
  const totalWithdrawn = earnings.reduce((sum, earning) => sum + earning.totalWithdrawn, 0);

  if (loadingEarnings) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Earnings Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Earnings</p>
              <p className="text-xl font-bold text-blue-900">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Available Balance</p>
              <p className="text-xl font-bold text-green-900">${totalAvailableBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending Balance</p>
              <p className="text-xl font-bold text-yellow-900">${totalPendingBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Withdrawn</p>
              <p className="text-xl font-bold text-purple-900">${totalWithdrawn.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">User</th>
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">Total Earnings</th>
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">Available</th>
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">Pending</th>
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">Withdrawn</th>
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">Performance</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((earning) => (
              <tr key={earning.id} className="border-b border-border">
                <td className="py-3">
                  <div>
                    <p className="font-medium text-card-foreground">{earning.userDisplayName}</p>
                    <p className="text-sm text-muted-foreground">{earning.userEmail}</p>
                  </div>
                </td>
                <td className="py-3 font-medium text-card-foreground">
                  ${earning.totalEarnings.toFixed(2)}
                </td>
                <td className="py-3 font-medium text-green-600">
                  ${earning.availableBalance.toFixed(2)}
                </td>
                <td className="py-3 font-medium text-yellow-600">
                  ${earning.pendingBalance.toFixed(2)}
                </td>
                <td className="py-3 font-medium text-purple-600">
                  ${earning.totalWithdrawn.toFixed(2)}
                </td>
                <td className="py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {earning.performanceScore.toFixed(1)}/10
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {earnings.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No earnings data available.
        </div>
      )}
    </div>
  );
}
