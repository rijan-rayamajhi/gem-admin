'use client';

import { Event } from '@/lib/eventService';

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export default function ViewEventModal({ isOpen, onClose, event }: ViewEventModalProps) {
  if (!isOpen) return null;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Not set';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      ride_and_earn: 'bg-green-100 text-green-800',
      club_battle: 'bg-red-100 text-red-800',
      bike_show: 'bg-blue-100 text-blue-800',
      other: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(event.type)}`}>
                  {event.type.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
            </div>
            {event.mainImage && (
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={event.mainImage}
                  alt="Event"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzNUg2NVY2NUgzNVYzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQwIDQwSDYwVjYwSDQwVjQwWiIgZmlsbD0iI0QxRDVEMyIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Event Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Start Date:</span>
                  <p className="text-gray-900">{formatDate(event.startDate)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">End Date:</span>
                  <p className="text-gray-900">{formatDate(event.endDate)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Max Attendees:</span>
                  <p className="text-gray-900">{event.maxAttendees}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Current Attendees:</span>
                  <p className="text-gray-900">{event.attendees}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
              <div className="space-y-2">
                <p className="text-gray-900">{event.location.address}</p>
                <p className="text-gray-900">{event.location.city}, {event.location.state}</p>
                <p className="text-sm text-gray-600">
                  Coordinates: {event.location.latitude}, {event.location.longitude}
                </p>
                <p className="text-sm text-gray-600">Radius: {event.location.radius} km</p>
              </div>
            </div>
          </div>

          {/* Organizer */}
          {event.organizer && event.organizer.name && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Organizer</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  {event.organizer.logo && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img
                        src={event.organizer.logo}
                        alt={`${event.organizer.name} logo`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzNUg2NVY2NUgzNVYzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQwIDQwSDYwVjYwSDQwVjQwWiIgZmlsbD0iI0QxRDVEMyIvPgo8L3N2Zz4K';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{event.organizer.name}</h4>
                    {event.organizer.website && (
                      <a
                        href={event.organizer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {event.organizer.website}
                      </a>
                    )}
                    {event.organizer.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.organizer.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tickets */}
          {event.tickets && event.tickets.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Tickets</h3>
              <div className="space-y-3">
                {event.tickets.map((ticket, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{ticket.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{ticket.price}</p>
                        <p className="text-sm text-gray-600">
                          {ticket.availableSlots}/{ticket.slots} available
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sponsors */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Sponsors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.sponsors.map((sponsor, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {sponsor.logo && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          <img
                            src={sponsor.logo}
                            alt={`${sponsor.name} logo`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzNUg2NVY2NUgzNVYzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQwIDQwSDYwVjYwSDQwVjQwWiIgZmlsbD0iI0QxRDVEMyIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{sponsor.name}</h4>
                        {sponsor.website && (
                          <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {sponsor.website}
                          </a>
                        )}
                        <p className="text-sm text-gray-600 mt-1">{sponsor.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guests */}
          {event.guests && event.guests.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Guests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.guests.map((guest, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {guest.photo && (
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                          <img
                            src={guest.photo}
                            alt={`${guest.name} photo`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzNUg2NVY2NUgzNVYzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQwIDQwSDYwVjYwSDQwVjQwWiIgZmlsbD0iI0QxRDVEMyIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{guest.name}</h4>
                        <p className="text-sm text-blue-600 font-medium">{guest.role}</p>
                        {guest.bio && (
                          <p className="text-sm text-gray-600 mt-1">{guest.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {event.faqs && event.faqs.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {event.faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Q: {faq.question}</h4>
                    <p className="text-gray-700">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          {event.termsAndConditions && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Terms and Conditions</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">{event.termsAndConditions}</p>
              </div>
            </div>
          )}

          {/* Insights */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Event Insights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{event.insights?.views || 0}</p>
                <p className="text-sm text-blue-600">Views</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{event.insights?.visited || 0}</p>
                <p className="text-sm text-green-600">Visited</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{event.insights?.shared || 0}</p>
                <p className="text-sm text-purple-600">Shared</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{event.insights?.liked || 0}</p>
                <p className="text-sm text-red-600">Liked</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 