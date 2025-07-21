'use client';

import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import Notification from './Notification';
import { Event, EventUpdateData, eventService } from '@/lib/eventService';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => Promise<void>;
  event?: Event;
  isEditing?: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    radius: number;
  };
  organizer: {
    name: string;
    logo: File | null;
    website: string;
    description: string;
  };
  type: 'ride_and_earn' | 'club_battle' | 'bike_show' | 'other';
  maxAttendees: number;
  mainImage: File | null;
  gallery: File[];
  videoUrl: string;
  tickets: Array<{
    name: string;
    description: string;
    price: number;
    slots: number;
    availableSlots: number;
  }>;
  sponsors: Array<{
    name: string;
    logo: File | null;
    website: string;
    description: string;
  }>;
  guests: Array<{
    name: string;
    role: string;
    bio: string;
    photo: File | null;
    socialMedia: {
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  termsAndConditions: string;
}

export default function AddEventModal({
  isOpen,
  onClose,
  onSave,
  event,
  isEditing = false,
}: AddEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: {
      address: '',
      city: '',
      state: '',
      latitude: 0,
      longitude: 0,
      radius: 5,
    },
    organizer: {
      name: '',
      logo: null,
      website: '',
      description: '',
    },
    type: 'ride_and_earn',
    maxAttendees: 50,
    mainImage: null,
    gallery: [],
    videoUrl: '',
    tickets: [],
    sponsors: [],
    guests: [],
    faqs: [],
    termsAndConditions: '',
  });

  const [guestName, setGuestName] = useState('');
  const [guestRole, setGuestRole] = useState('');
  const [guestBio, setGuestBio] = useState('');
  const [guestPhoto, setGuestPhoto] = useState<File | null>(null);
  const [guestTwitter, setGuestTwitter] = useState('');
  const [guestInstagram, setGuestInstagram] = useState('');
  const [guestLinkedin, setGuestLinkedin] = useState('');

  const [sponsorName, setSponsorName] = useState('');
  const [sponsorWebsite, setSponsorWebsite] = useState('');
  const [sponsorDescription, setSponsorDescription] = useState('');
  const [sponsorLogo, setSponsorLogo] = useState<File | null>(null);

  const [organizerName, setOrganizerName] = useState('');
  const [organizerWebsite, setOrganizerWebsite] = useState('');
  const [organizerDescription, setOrganizerDescription] = useState('');
  const [organizerLogo, setOrganizerLogo] = useState<File | null>(null);

  const [ticketName, setTicketName] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPrice, setTicketPrice] = useState(0);
  const [ticketSlots, setTicketSlots] = useState(1);

  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  // Initialize form data with existing event if editing
  const getInitialFormData = (): EventFormData => {
    if (event && isEditing) {
      // Convert Timestamp to string for datetime-local inputs
      const formatTimestampForInput = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
      };

      return {
        title: event.title || '',
        description: event.description || '',
        startDate: formatTimestampForInput(event.startDate),
        endDate: formatTimestampForInput(event.endDate),
        location: {
          address: event.location?.address || '',
          city: event.location?.city || '',
          state: event.location?.state || '',
          latitude: event.location?.latitude || 0,
          longitude: event.location?.longitude || 0,
          radius: event.location?.radius || 5,
        },
        organizer: {
          name: event.organizer?.name || '',
          logo: null, // Will need to handle file conversion
          website: event.organizer?.website || '',
          description: event.organizer?.description || '',
        },
        type: event.type || 'ride_and_earn',
        maxAttendees: event.maxAttendees || 50,
        mainImage: null, // Will need to handle file conversion
        gallery: [], // Will need to handle file conversion
        videoUrl: event.videoUrl || '',
        tickets: event.tickets || [],
        sponsors: event.sponsors?.map(sponsor => ({
          ...sponsor,
          logo: null, // Will need to handle file conversion
        })) || [],
        guests: event.guests?.map(guest => ({
          ...guest,
          photo: null, // Will need to handle file conversion
        })) || [],
        faqs: event.faqs || [],
        termsAndConditions: event.termsAndConditions || '',
      };
    }

    return {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: {
        address: '',
        city: '',
        state: '',
        latitude: 0,
        longitude: 0,
        radius: 5,
      },
      organizer: {
        name: '',
        logo: null,
        website: '',
        description: '',
      },
      type: 'ride_and_earn',
      maxAttendees: 50,
      mainImage: null,
      gallery: [],
      videoUrl: '',
      tickets: [],
      sponsors: [],
      guests: [],
      faqs: [],
      termsAndConditions: '',
    };
  };

  // Reset form when modal opens/closes or event changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
      setNotification(null);
    }
  }, [isOpen, event, isEditing]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
    
    // Clear error when user starts typing
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: '',
      }));
    }
  };

  const handleGalleryAdd = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/') && 
        !formData.gallery.some(existingFile => existingFile.name === file.name)
      );
      
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...newFiles],
      }));
    }
  };

  const handleGalleryRemove = (fileToRemove: File) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter(file => file !== fileToRemove),
    }));
  };

  const handleGalleryReorder = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newGallery = [...prev.gallery];
      const [removed] = newGallery.splice(fromIndex, 1);
      newGallery.splice(toIndex, 0, removed);
      return {
        ...prev,
        gallery: newGallery,
      };
    });
  };

  const handleSetMainImage = (file: File) => {
    setFormData(prev => ({
      ...prev,
      mainImage: file,
    }));
  };

  const handleFaqAdd = () => {
    if (faqQuestion.trim() && faqAnswer.trim()) {
      setFormData(prev => ({
        ...prev,
        faqs: [...prev.faqs, { question: faqQuestion.trim(), answer: faqAnswer.trim() }],
      }));
      setFaqQuestion('');
      setFaqAnswer('');
    }
  };

  const handleFaqRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleTicketAdd = () => {
    if (ticketName.trim() && ticketDescription.trim() && ticketSlots > 0) {
      setFormData(prev => ({
        ...prev,
        tickets: [...prev.tickets, {
          name: ticketName.trim(),
          description: ticketDescription.trim(),
          price: ticketPrice,
          slots: ticketSlots,
          availableSlots: ticketSlots,
        }],
      }));
      setTicketName('');
      setTicketDescription('');
      setTicketPrice(0);
      setTicketSlots(1);
    }
  };

  const handleTicketRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index),
    }));
  };

  const handleSponsorAdd = () => {
    if (sponsorName.trim() && sponsorDescription.trim()) {
      setFormData(prev => ({
        ...prev,
        sponsors: [...prev.sponsors, {
          name: sponsorName.trim(),
          logo: sponsorLogo,
          website: sponsorWebsite.trim(),
          description: sponsorDescription.trim(),
        }],
      }));
      setSponsorName('');
      setSponsorWebsite('');
      setSponsorDescription('');
      setSponsorLogo(null);
    }
  };

  const handleSponsorRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter((_, i) => i !== index),
    }));
  };

  const handleOrganizerUpdate = () => {
    if (organizerName.trim()) {
      setFormData(prev => ({
        ...prev,
        organizer: {
          name: organizerName.trim(),
          logo: organizerLogo,
          website: organizerWebsite.trim(),
          description: organizerDescription.trim(),
        },
      }));
    }
  };

  const handleGuestAdd = () => {
    if (guestName.trim() && guestRole.trim()) {
      setFormData(prev => ({
        ...prev,
        guests: [...prev.guests, {
          name: guestName.trim(),
          role: guestRole.trim(),
          bio: guestBio.trim(),
          photo: guestPhoto,
          socialMedia: {
            twitter: guestTwitter.trim() || undefined,
            instagram: guestInstagram.trim() || undefined,
            linkedin: guestLinkedin.trim() || undefined,
          },
        }],
      }));
      setGuestName('');
      setGuestRole('');
      setGuestBio('');
      setGuestPhoto(null);
      setGuestTwitter('');
      setGuestInstagram('');
      setGuestLinkedin('');
    }
  };

  const handleGuestRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const errorMessages: string[] = [];

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
      errorMessages.push('Event title is required');
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
      errorMessages.push('Event description is required');
    }

    // Organizer: all-or-nothing validation
    const org = formData.organizer;
    const anyOrganizerFieldFilled = org.name.trim() || org.website.trim() || org.description.trim() || org.logo;
    if (anyOrganizerFieldFilled) {
      if (!org.name.trim() || !org.website.trim() || !org.description.trim() || !org.logo) {
        newErrors.organizer = 'All organizer fields (name, website, description, logo) are required if adding an organizer.';
        errorMessages.push('All organizer fields are required if adding an organizer');
      }
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
      errorMessages.push('Start date is required');
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
      errorMessages.push('End date is required');
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
      errorMessages.push('End date must be after start date');
    }

    if (!formData.location.address.trim() || !formData.location.city.trim() || !formData.location.state.trim()) {
      newErrors.location = 'Address, city, and state are required';
      errorMessages.push('Address, city, and state are required');
    }

    if (formData.location.latitude === 0 && formData.location.longitude === 0) {
      newErrors.location = (newErrors.location ? newErrors.location + ' ' : '') + 'Latitude and longitude are required';
      errorMessages.push('Latitude and longitude are required');
    }

    if (!formData.location.radius || formData.location.radius <= 0) {
      newErrors.location = (newErrors.location ? newErrors.location + ' ' : '') + 'Radius is required and must be greater than 0';
      errorMessages.push('Radius is required and must be greater than 0');
    }

    if (formData.maxAttendees <= 0) {
      newErrors.maxAttendees = 'Maximum attendees must be greater than 0';
      errorMessages.push('Maximum attendees must be greater than 0');
    }

    if (!formData.mainImage) {
      newErrors.mainImage = 'Main image is required';
      errorMessages.push('Main image is required');
    }

    if (!formData.tickets || formData.tickets.length === 0) {
      newErrors.tickets = 'At least one ticket type is required';
      errorMessages.push('At least one ticket type is required');
    }

    if (formData.tickets && formData.tickets.length > 0) {
      formData.tickets.forEach((ticket, idx) => {
        if (ticket.price === undefined || ticket.price === null || isNaN(ticket.price) || ticket.price <= 0) {
          newErrors[`ticket_price_${idx}`] = 'Ticket price is required and must be greater than 0';
          errorMessages.push(`Ticket "${ticket.name}" price is required and must be greater than 0`);
        }
      });
    }

    if (!formData.faqs || formData.faqs.length === 0) {
      newErrors.faqs = 'At least one FAQ is required';
      errorMessages.push('At least one FAQ is required');
    }

    if (!formData.termsAndConditions.trim()) {
      newErrors.termsAndConditions = 'Terms and conditions are required';
      errorMessages.push('Terms and conditions are required');
    }

    // Sponsors: all-or-nothing validation for each sponsor
    if (formData.sponsors && formData.sponsors.length > 0) {
      formData.sponsors.forEach((sponsor, idx) => {
        const anySponsorFieldFilled = sponsor.name.trim() || sponsor.website.trim() || sponsor.description.trim() || sponsor.logo;
        if (anySponsorFieldFilled) {
          if (!sponsor.name.trim() || !sponsor.website.trim() || !sponsor.description.trim() || !sponsor.logo) {
            newErrors[`sponsor_${idx}`] = 'All sponsor fields (name, website, description, logo) are required if adding a sponsor.';
            errorMessages.push(`Sponsor "${sponsor.name || 'Unnamed'}" has incomplete information`);
          }
        }
      });
    }

    // Guests: all-or-nothing validation for each guest
    if (formData.guests && formData.guests.length > 0) {
      formData.guests.forEach((guest, idx) => {
        const anyGuestFieldFilled = guest.name.trim() || guest.role.trim() || guest.bio.trim() || guest.photo || guest.socialMedia.twitter || guest.socialMedia.instagram || guest.socialMedia.linkedin;
        if (anyGuestFieldFilled) {
          if (!guest.name.trim() || !guest.role.trim() || !guest.bio.trim() || !guest.photo || (!guest.socialMedia.twitter && !guest.socialMedia.instagram && !guest.socialMedia.linkedin)) {
            newErrors[`guest_${idx}`] = 'All guest fields (name, role, bio, photo, and at least one social media link) are required if adding a guest.';
            errorMessages.push(`Guest "${guest.name || 'Unnamed'}" has incomplete information`);
          }
        }
      });
    }

    setErrors(newErrors);
    
    // Show popup notification if there are validation errors
    if (errorMessages.length > 0) {
      const errorMessage = errorMessages.length === 1 
        ? errorMessages[0] 
        : `Please fix the following ${errorMessages.length} errors:\n• ${errorMessages.join('\n• ')}`;
      
      setNotification({
        type: 'error',
        message: errorMessage,
        isVisible: true,
      });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing && event) {
        // Handle editing - prepare update data with proper type handling
        const updateData = {
          title: formData.title,
          description: formData.description,
          startDate: Timestamp.fromDate(new Date(formData.startDate)),
          endDate: Timestamp.fromDate(new Date(formData.endDate)),
          location: formData.location,
          type: formData.type,
          maxAttendees: formData.maxAttendees,
          videoUrl: formData.videoUrl,
          tickets: formData.tickets,
          faqs: formData.faqs,
          termsAndConditions: formData.termsAndConditions,
          // Handle file fields with proper type conversion
          mainImage: formData.mainImage || (event.mainImage as string | undefined),
          gallery: formData.gallery.length > 0 ? formData.gallery : (event.gallery as (string | File)[] | undefined),
          organizer: {
            name: formData.organizer.name,
            website: formData.organizer.website,
            description: formData.organizer.description,
            logo: formData.organizer.logo || (event.organizer.logo as string | undefined),
          },
          sponsors: formData.sponsors.map((sponsor, index) => ({
            name: sponsor.name,
            website: sponsor.website,
            description: sponsor.description,
            logo: sponsor.logo || (event.sponsors?.[index]?.logo as string | undefined),
          })),
          guests: formData.guests.map((guest, index) => ({
            name: guest.name,
            role: guest.role,
            bio: guest.bio,
            socialMedia: guest.socialMedia,
            photo: guest.photo || (event.guests?.[index]?.photo as string | undefined),
          })),
        } as Partial<EventUpdateData>;

        await onSave(updateData);
      } else {
        // Handle creating new event - upload files to Firebase Storage and get URLs
        const uploadPromises: Promise<any>[] = [];
        
        // Upload main image
        let mainImageUrl: string | null = null;
        if (formData.mainImage) {
          const mainImagePromise = eventService.uploadFile(
            formData.mainImage, 
            `events/main-images/${Date.now()}_${formData.mainImage.name}`
          ).then(url => { mainImageUrl = url; });
          uploadPromises.push(mainImagePromise);
        }

        // Upload gallery images
        let galleryUrls: string[] = [];
        if (formData.gallery.length > 0) {
          const galleryPromise = eventService.uploadFiles(
            formData.gallery,
            `events/gallery/${Date.now()}`
          ).then(urls => { galleryUrls = urls; });
          uploadPromises.push(galleryPromise);
        }

        // Upload organizer logo
        let organizerLogoUrl: string | null = null;
        if (formData.organizer.logo) {
          const organizerLogoPromise = eventService.uploadFile(
            formData.organizer.logo,
            `events/organizers/${Date.now()}_${formData.organizer.logo.name}`
          ).then(url => { organizerLogoUrl = url; });
          uploadPromises.push(organizerLogoPromise);
        }

        // Upload sponsor logos
        const sponsorLogoResults: { index: number; url: string }[] = [];
        const sponsorLogoPromises = formData.sponsors
          .map((sponsor, index) => {
            if (sponsor.logo) {
              return eventService.uploadFile(
                sponsor.logo,
                `events/sponsors/${Date.now()}_${index}_${sponsor.logo.name}`
              ).then(url => sponsorLogoResults.push({ index, url }));
            }
            return Promise.resolve();
          });
        uploadPromises.push(...sponsorLogoPromises);

        // Upload guest photos
        const guestPhotoResults: { index: number; url: string }[] = [];
        const guestPhotoPromises = formData.guests
          .map((guest, index) => {
            if (guest.photo) {
              return eventService.uploadFile(
                guest.photo,
                `events/guests/${Date.now()}_${index}_${guest.photo.name}`
              ).then(url => guestPhotoResults.push({ index, url }));
            }
            return Promise.resolve();
          });
        uploadPromises.push(...guestPhotoPromises);

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        // Prepare event data with actual URLs
        const eventDataForFirebase = {
          ...formData,
          mainImage: mainImageUrl,
          gallery: galleryUrls,
          organizer: {
            ...formData.organizer,
            logo: organizerLogoUrl,
          },
          sponsors: formData.sponsors.map((sponsor, index) => {
            const uploadedSponsor = sponsorLogoResults.find(r => r.index === index);
            return {
              ...sponsor,
              logo: uploadedSponsor?.url || null,
            };
          }),
          guests: formData.guests.map((guest, index) => {
            const uploadedGuest = guestPhotoResults.find(r => r.index === index);
            return {
              ...guest,
              photo: uploadedGuest?.url || null,
            };
          }),
        };

        await onSave(eventDataForFirebase);
      }
      
      onClose();
      // Reset form
      setFormData(getInitialFormData());
      setErrors({});
    } catch (error) {
      console.error('Error creating event:', error);
      setNotification({
        type: 'error',
        message: 'Failed to upload files. Please try again.',
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter event title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ride_and_earn">Ride & Earn</option>
                  <option value="club_battle">Club Battle</option>
                  <option value="bike_show">Bike Show</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your event..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Organizer */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Organizer <span className="text-gray-500 text-sm">(Optional)</span></h3>
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Organizer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter organizer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={organizerWebsite}
                    onChange={(e) => setOrganizerWebsite(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={organizerDescription}
                  onChange={(e) => setOrganizerDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description about the organizer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Logo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setOrganizerLogo(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <button
                type="button"
                onClick={handleOrganizerUpdate}
                disabled={!organizerName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Update Organizer
              </button>
            </div>
            
            {/* Organizer Display */}
            {formData.organizer.name && (
              <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-white">
                <div className="flex items-start space-x-3">
                  {formData.organizer.logo && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img
                        src={URL.createObjectURL(formData.organizer.logo)}
                        alt={`${formData.organizer.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{formData.organizer.name}</h5>
                    {formData.organizer.website && (
                      <a
                        href={formData.organizer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {formData.organizer.website}
                      </a>
                    )}
                    {formData.organizer.description && (
                      <p className="text-sm text-gray-600 mt-1">{formData.organizer.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {errors.organizer && (
              <p className="text-red-500 text-sm mt-1">{errors.organizer}</p>
            )}
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Attendees *
                </label>
                <input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value) || 0)}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.maxAttendees ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.maxAttendees && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxAttendees}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address *
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => handleLocationChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.latitude}
                    onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border ${(errors.location && formData.location.latitude === 0) ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="0.000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.longitude}
                    onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border ${(errors.location && formData.location.longitude === 0) ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="0.000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Radius (km) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.location.radius}
                    onChange={(e) => handleLocationChange('radius', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border ${(errors.location && (!formData.location.radius || formData.location.radius <= 0)) ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="5"
                  />
                </div>
              </div>

              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Tickets */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Tickets</h3>
            <div className="space-y-4">
              {/* Add Ticket Form */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Name *
                    </label>
                    <input
                      type="text"
                      value={ticketName}
                      onChange={(e) => setTicketName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Early Bird, VIP, General Admission"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (INR) *
                    </label>
                    <input
                      type="number"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border ${(errors.ticket_price_0 ? 'border-red-500' : 'border-gray-300')} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="0.00"
                    />
                    {errors.ticket_price_0 && (
                      <p className="text-red-500 text-sm mt-1">{errors.ticket_price_0}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what's included with this ticket type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Slots *
                  </label>
                  <input
                    type="number"
                    value={ticketSlots}
                    onChange={(e) => setTicketSlots(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTicketAdd}
                  disabled={!ticketName.trim() || !ticketDescription.trim() || ticketSlots < 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Ticket Type
                </button>
              </div>

              {/* Ticket List */}
              {formData.tickets.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Ticket Types ({formData.tickets.length})
                  </h4>
                  <div className="space-y-3">
                    {formData.tickets.map((ticket, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{ticket.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTicketRemove(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            <span className="font-medium">Price:</span> ${ticket.price.toFixed(2)}
                          </span>
                          <span className="text-gray-600">
                            <span className="font-medium">Slots:</span> {ticket.slots}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {formData.tickets.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No ticket types added yet</p>
                  <p className="text-xs text-gray-400">Add different ticket types with pricing and availability</p>
                </div>
              )}
            </div>
          </div>

          {/* Sponsors */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Sponsors <span className="text-gray-500 text-sm">(Optional)</span></h3>
            <div className="space-y-4">
              {/* Add Sponsor Form */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sponsor Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter sponsor name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={sponsorWebsite}
                      onChange={(e) => setSponsorWebsite(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={sponsorDescription}
                    onChange={(e) => setSponsorDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the sponsor's contribution or partnership"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSponsorLogo(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSponsorAdd}
                  disabled={!sponsorName.trim() || !sponsorDescription.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Sponsor
                </button>
              </div>

              {/* Sponsor List */}
              {formData.sponsors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Added Sponsors ({formData.sponsors.length})
                  </h4>
                  <div className="space-y-3">
                    {formData.sponsors.map((sponsor, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start space-x-3 flex-1">
                            {sponsor.logo && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                <img
                                  src={URL.createObjectURL(sponsor.logo)}
                                  alt={`${sponsor.name} logo`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{sponsor.name}</h5>
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
                          <button
                            type="button"
                            onClick={() => handleSponsorRemove(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        {errors[`sponsor_${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`sponsor_${index}`]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {formData.sponsors.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No sponsors added yet</p>
                  <p className="text-xs text-gray-400">Add sponsors to showcase their support for your event</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Guests */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Guests <span className="text-gray-500 text-sm">(Optional)</span></h3>
            <div className="space-y-4">
              {/* Add Guest Form */}
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter guest name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role/Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={guestRole}
                      onChange={(e) => setGuestRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Keynote Speaker, Panelist, Host"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={guestBio}
                    onChange={(e) => setGuestBio(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief biography or description of the guest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setGuestPhoto(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Social Media Links (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="url"
                      value={guestTwitter}
                      onChange={(e) => setGuestTwitter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Twitter URL"
                    />
                    <input
                      type="url"
                      value={guestInstagram}
                      onChange={(e) => setGuestInstagram(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Instagram URL"
                    />
                    <input
                      type="url"
                      value={guestLinkedin}
                      onChange={(e) => setGuestLinkedin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGuestAdd}
                  disabled={!guestName.trim() || !guestRole.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Guest
                </button>
              </div>

              {/* Guest List */}
              {formData.guests.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Event Guests ({formData.guests.length})
                  </h4>
                  <div className="space-y-3">
                    {formData.guests.map((guest, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-start space-x-3 flex-1">
                            {guest.photo && (
                              <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                <img
                                  src={URL.createObjectURL(guest.photo)}
                                  alt={`${guest.name} photo`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{guest.name}</h5>
                              <p className="text-sm text-blue-600 font-medium">{guest.role}</p>
                              {guest.bio && (
                                <p className="text-sm text-gray-600 mt-1">{guest.bio}</p>
                              )}
                              {(guest.socialMedia.twitter || guest.socialMedia.instagram || guest.socialMedia.linkedin) && (
                                <div className="flex space-x-2 mt-2">
                                  {guest.socialMedia.twitter && (
                                    <a
                                      href={guest.socialMedia.twitter}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-600"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                      </svg>
                                    </a>
                                  )}
                                  {guest.socialMedia.instagram && (
                                    <a
                                      href={guest.socialMedia.instagram}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-pink-400 hover:text-pink-600"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243 0-.49.122-.928.49-1.243.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.368.315.49.753.49 1.243 0 .49-.122.928-.49 1.243-.369.315-.807.49-1.297.49z"/>
                                      </svg>
                                    </a>
                                  )}
                                  {guest.socialMedia.linkedin && (
                                    <a
                                      href={guest.socialMedia.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGuestRemove(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {formData.guests.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No guests added yet</p>
                  <p className="text-xs text-gray-400">Add speakers, panelists, or special guests for your event</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Image */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Image</h3>
            <div className="space-y-3">
              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData(prev => ({
                        ...prev,
                        mainImage: file,
                      }));
                    }
                  }}
                  className={`w-full px-3 py-2 border ${errors.mainImage ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                />
                {errors.mainImage && (
                  <p className="text-red-500 text-sm mt-1">{errors.mainImage}</p>
                )}
              </div>
              
              {/* Select from Gallery */}
              {formData.gallery.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Or select from gallery:
                  </label>
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                    {formData.gallery.map((file, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                          formData.mainImage === file ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => handleSetMainImage(file)}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                        {formData.mainImage === file && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Main Image Preview */}
              {formData.mainImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Main Image Preview:
                  </label>
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(formData.mainImage)}
                      alt="Main"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, mainImage: null }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {/* Add FAQ Form */}
              <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleFaqAdd())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a frequently asked question"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer
                  </label>
                  <textarea
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the answer to the question"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFaqAdd}
                  disabled={!faqQuestion.trim() || !faqAnswer.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add FAQ
                </button>
              </div>

              {/* FAQ List */}
              {formData.faqs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Added FAQs ({formData.faqs.length})
                  </h4>
                  <div className="space-y-3">
                    {formData.faqs.map((faq, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">Q: {faq.question}</h5>
                          <button
                            type="button"
                            onClick={() => handleFaqRemove(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-600">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {formData.faqs.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3.3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No FAQs added yet</p>
                  <p className="text-xs text-gray-400">Add common questions and answers for your event</p>
                </div>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Terms and Conditions</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Terms and Conditions *
              </label>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the terms and conditions for your event. This will be displayed to attendees before they register."
              />
              <p className="text-sm text-gray-500 mt-1">
                Specify any rules, policies, or terms that attendees must agree to when registering for your event.
              </p>
            </div>
          </div>

          {/* YouTube Video URL */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Video</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL *
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter a valid YouTube video URL to showcase your event
              </p>
            </div>
          </div>

          {/* Event Gallery */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Gallery</h3>
            <div className="space-y-4">
              {/* File Upload */}
              <div className="flex gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleGalleryAdd(e.target.files)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* Gallery Display */}
              {formData.gallery.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Gallery Images ({formData.gallery.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {formData.gallery.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzNUg2NVY2NUgzNVYzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTQwIDQwSDYwVjYwSDQwVjQwWiIgZmlsbD0iI0QxRDVEMyIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleGalleryRemove(file)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>

                        {/* Reorder Buttons */}
                        <div className="absolute bottom-1 left-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleGalleryReorder(index, index - 1)}
                              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs"
                            >
                              ↑
                            </button>
                          )}
                          {index < formData.gallery.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleGalleryReorder(index, index + 1)}
                              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs"
                            >
                              ↓
                            </button>
                          )}
                        </div>

                        {/* File Name Display */}
                        <div className="mt-1 text-xs text-gray-500 truncate">
                          {file.name.length > 30 ? `${file.name.substring(0, 30)}...` : file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {formData.gallery.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No images added yet</p>
                  <p className="text-xs text-gray-400">Upload images to create a gallery</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
      
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
} 