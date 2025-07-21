'use client';

import { useAppName, useAppVersion, useAppSetting } from '@/lib/useAppSettings';

interface AppInfoProps {
  showVersion?: boolean;
  showDescription?: boolean;
  className?: string;
}

export default function AppInfo({ 
  showVersion = true, 
  showDescription = false, 
  className = '' 
}: AppInfoProps) {
  const appName = useAppName();
  const appVersion = useAppVersion();
  const appDescription = useAppSetting('appDescription');
  const appTagline = useAppSetting('appTagline');

  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{appName}</h1>
      {showVersion && (
        <p className="text-sm text-gray-500 mb-2">Version {appVersion}</p>
      )}
      {showDescription && appDescription && (
        <p className="text-gray-600 mb-2">{appDescription}</p>
      )}
      {appTagline && (
        <p className="text-sm text-gray-400 italic">{appTagline}</p>
      )}
    </div>
  );
} 