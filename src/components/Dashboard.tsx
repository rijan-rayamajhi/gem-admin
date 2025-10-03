'use client';

import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import ConfirmationDialog from './ConfirmationDialog';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  // Filter and sort feature cards based on search
  const filteredCards = useMemo(() => {
    // Feature cards data
    const featureCards = [
      {
        id: 'settings',
        title: 'App Settings',
        description: 'Configure application settings',
        route: '/settings',
        icon: (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        bgColor: 'bg-purple-100'
      },
      {
        id: 'monetization',
        title: 'Monetization',
        description: 'Manage revenue and subscriptions',
        route: '/monetization',
        icon: (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'bg-green-100'
      },
      {
        id: 'driving-license',
        title: 'Driving License',
        description: 'Manage driving license records',
        route: '/driving-license',
        icon: (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        bgColor: 'bg-blue-100'
      },
      {
        id: 'bug-reports',
        title: 'Bug Reports',
        description: 'Report and track application bugs',
        route: '/bug-reports',
        icon: (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        bgColor: 'bg-red-100'
      },
      {
        id: 'carousel-ads',
        title: 'Carousel Ads',
        description: 'Manage carousel advertisements',
        route: '/carousel-ads',
        icon: (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        bgColor: 'bg-orange-100'
      },
      {
        id: 'ride-verification',
        title: 'Ride Verification',
        description: 'Verify and manage ride requests',
        route: '/ride-verification',
        icon: (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'bg-indigo-100'
      },
      {
        id: 'vehicle-verification',
        title: 'Vehicle Verification',
        description: 'Verify and manage vehicle records',
        route: '/vehicle-verification',
        icon: (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        ),
        bgColor: 'bg-teal-100'
      },
      {
        id: 'vehicle-brands',
        title: 'Vehicle Brands',
        description: 'Manage vehicle brand information',
        route: '/vehicle-brands',
        icon: (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
        bgColor: 'bg-cyan-100'
      }
    ];

    let cards = featureCards;
    
    if (searchFilter.trim()) {
      const filter = searchFilter.toLowerCase();
      cards = featureCards.filter(card => 
        card.title.toLowerCase().includes(filter) ||
        card.description.toLowerCase().includes(filter)
      );
    }
    
    // Always sort in ascending order by title
    return cards.sort((a, b) => a.title.localeCompare(b.title));
  }, [searchFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">A</span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-card-foreground truncate">My Admin</h1>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
              <div className="text-xs sm:text-sm text-muted-foreground hidden md:block truncate max-w-32 lg:max-w-48">
                Welcome, {user?.displayName || user?.email}
              </div>
              <button
                onClick={handleLogoutClick}
                className="bg-primary text-primary-foreground px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-card-foreground mb-1 sm:mb-2">Dashboard</h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">Manage your application and access key features</p>
        </div>

        {/* Filter Section */}
        <div className="mb-4 sm:mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search features..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-border rounded-lg bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-card-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchFilter && (
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
              {filteredCards.length === 0 ? (
                <span>No features found matching &quot;{searchFilter}&quot;</span>
              ) : (
                <span>{filteredCards.length} feature{filteredCards.length !== 1 ? 's' : ''} found</span>
              )}
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {filteredCards.map((card) => (
            <div 
              key={card.id}
              className="bg-card border border-border rounded-lg p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 active:scale-95 touch-manipulation"
              onClick={() => {
                router.push(card.route);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(card.route);
                }
              }}
            >
              <div className="flex flex-col items-start mb-2 sm:mb-3 md:mb-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${card.bgColor} rounded-lg flex items-center justify-center mb-2 sm:mb-3 flex-shrink-0`}>
                  {card.icon}
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-card-foreground mb-1">{card.title}</h3>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}