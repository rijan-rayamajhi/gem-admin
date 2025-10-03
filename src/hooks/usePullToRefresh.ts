'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { isMobileDevice } from '@/utils/mobileUPI';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRefresh: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 0.5,
  enabled = true
}: PullToRefreshOptions) {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRefresh: false
  });

  const startY = useRef(0);
  const currentY = useRef(0);
  const isScrolledToTop = useRef(true);
  const containerRef = useRef<HTMLElement | null>(null);

  // Check if we're on mobile and pull-to-refresh should be enabled
  const shouldEnable = enabled && isMobileDevice();

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!shouldEnable || state.isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    // Check if we're at the top of the scrollable area
    isScrolledToTop.current = container.scrollTop === 0;
    
    if (isScrolledToTop.current) {
      startY.current = e.touches[0].clientY;
      currentY.current = e.touches[0].clientY;
    }
  }, [shouldEnable, state.isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!shouldEnable || state.isRefreshing || !isScrolledToTop.current) return;

    currentY.current = e.touches[0].clientY;
    const pullDistance = Math.max(0, currentY.current - startY.current);
    const resistanceDistance = pullDistance * resistance;

    if (pullDistance > 0) {
      e.preventDefault(); // Prevent default scroll behavior
      
      setState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance: resistanceDistance,
        canRefresh: resistanceDistance >= threshold
      }));
    }
  }, [shouldEnable, state.isRefreshing, threshold, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!shouldEnable || state.isRefreshing) return;

    const { canRefresh, pullDistance } = state;

    if (canRefresh && pullDistance > 0) {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false
      }));

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
          canRefresh: false
        }));
      }
    } else {
      // Reset state if not refreshing
      setState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        canRefresh: false
      }));
    }
  }, [shouldEnable, state, onRefresh]);

  const attachListeners = useCallback(() => {
    if (!shouldEnable) return;

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [shouldEnable, handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    const cleanup = attachListeners();
    return cleanup;
  }, [attachListeners]);

  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  return {
    ...state,
    setContainerRef,
    shouldEnable
  };
}
