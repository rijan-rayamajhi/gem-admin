'use client';

import { useAuth } from '@/features/auth/presentation/providers/AuthProvider';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-semibold text-card-foreground">My Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Welcome, {user?.displayName || user?.email}
              </div>
              <button
                onClick={handleLogout}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-card-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to your admin dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-primary rounded-xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <span className="text-primary font-bold text-lg">📊</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-card-foreground">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-primary rounded-xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mr-4">
                <span className="text-success font-bold text-lg">✅</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold text-card-foreground">89</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-primary rounded-xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mr-4">
                <span className="text-warning font-bold text-lg">⚠️</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold text-card-foreground">12</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-primary rounded-xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mr-4">
                <span className="text-destructive font-bold text-lg">🚨</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alerts</p>
                <p className="text-2xl font-bold text-card-foreground">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-primary rounded-xl p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                <span className="text-card-foreground">User John Doe logged in</span>
              </div>
              <span className="text-muted-foreground text-sm">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-warning rounded-full mr-3"></div>
                <span className="text-card-foreground">New user registration</span>
              </div>
              <span className="text-muted-foreground text-sm">5 minutes ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                <span className="text-card-foreground">System backup completed</span>
              </div>
              <span className="text-muted-foreground text-sm">1 hour ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}