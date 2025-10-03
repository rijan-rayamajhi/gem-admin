'use client';

import React from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
  className?: string;
}

export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  resistance = 0.5,
  enabled = true,
  className = ''
}: PullToRefreshProps) {
  const {
    isPulling,
    isRefreshing,
    pullDistance,
    canRefresh,
    setContainerRef,
    shouldEnable
  } = usePullToRefresh({
    onRefresh,
    threshold,
    resistance,
    enabled
  });

  // Don't render pull-to-refresh functionality if not enabled or not on mobile
  if (!shouldEnable) {
    return <div className={className}>{children}</div>;
  }

  const refreshIndicatorHeight = Math.min(pullDistance, 60);
  const refreshIndicatorOpacity = Math.min(pullDistance / threshold, 1);

  return (
    <div className={`relative ${className}`}>
      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary/5 border-b border-primary/10 transition-all duration-200 ease-out"
          style={{
            height: `${refreshIndicatorHeight}px`,
            opacity: refreshIndicatorOpacity,
            transform: `translateY(${Math.max(0, refreshIndicatorHeight - 60)}px)`
          }}
        >
          <div className="flex items-center space-x-2 text-primary">
            {isRefreshing ? (
              <>
                <div className="animate-spin">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Refreshing...</span>
              </>
            ) : (
              <>
                <div className={`transition-transform duration-200 ${canRefresh ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <span className="text-sm font-medium">
                  {canRefresh ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        ref={setContainerRef}
        className="h-full"
        style={{
          transform: isPulling ? `translateY(${refreshIndicatorHeight}px)` : 'translateY(0)',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
