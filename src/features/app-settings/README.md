# App Settings Feature

## Overview

The App Settings feature provides a comprehensive configuration management system for the application. It follows Clean Architecture principles with clear separation of concerns across domain, data, and presentation layers.

## Architecture

This feature implements Clean Architecture with the following structure:

```
app-settings/
├── domain/           # Business logic and entities
│   ├── entities/     # Core business objects
│   ├── repositories/ # Repository interfaces
│   └── usecases/     # Business use cases
├── data/             # Data access layer
│   └── repositories/ # Concrete repository implementations
└── presentation/     # UI layer
    ├── components/   # React components
    └── providers/    # Context providers
```

## Domain Layer

### Entities

#### AppSettings
Core entity representing application configuration:

```typescript
interface AppSettings {
  appName: string;                    // Required: Application name
  appTagline: string;                 // Optional: Application tagline
  termsAndConditionLink: string;     // Optional: Terms and conditions URL
  email: string;                      // Optional: Contact email
  whatsappNumber: string;            // Optional: WhatsApp contact number
  phoneNumber: string;                // Optional: Phone contact number
  appVersion: string;                 // Optional: Application version
  faqs: FAQ[];                        // Optional: Frequently Asked Questions
}
```

#### FAQ
Sub-entity for managing frequently asked questions:

```typescript
interface FAQ {
  id: string;         // Unique identifier
  question: string;   // FAQ question
  answer: string;     // FAQ answer
}
```

### Use Cases

#### GetSettingsUseCase
- **Purpose**: Retrieves current application settings
- **Behavior**: Returns default settings if no settings exist or on error
- **Error Handling**: Gracefully handles errors by returning default settings

#### SaveSettingsUseCase
- **Purpose**: Saves application settings with validation
- **Validation Rules**:
  - App name is required (non-empty)
  - Email format validation (if provided)
  - URL format validation for terms and conditions link (if provided)
- **Error Handling**: Throws descriptive errors for validation failures

#### ResetSettingsUseCase
- **Purpose**: Resets all settings to default values
- **Behavior**: Deletes current settings and returns default configuration
- **Error Handling**: Throws error if reset operation fails

### Repository Interface

```typescript
interface SettingsRepository {
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  resetSettings(): Promise<void>;
}
```

## Data Layer

### FirebaseSettingsRepository

Concrete implementation using Firebase Firestore:

- **Collection**: `admin_data`
- **Document**: `app_settings`
- **Features**:
  - Automatic timestamp tracking (createdAt, updatedAt)
  - Merge operations for updates
  - Graceful error handling
  - Default value fallbacks

#### Data Mapping
Maps Firestore document fields to AppSettings interface with proper fallbacks for missing fields.

## Presentation Layer

### Components

#### SettingsForm
Main settings configuration component featuring:

- **Form Fields**:
  - App Name (required)
  - App Tagline
  - Terms and Conditions Link
  - Contact Email
  - Phone Number
  - WhatsApp Number
  - App Version
  - FAQs Management

- **Actions**:
  - Save Settings (with validation)
  - Reset to Defaults (with confirmation)
  - Real-time form updates

- **UI Features**:
  - Responsive grid layout
  - Loading states
  - Error display
  - Success notifications

#### FAQsManager
Specialized component for FAQ management:

- **Features**:
  - Add/Remove FAQs
  - Expandable FAQ editing
  - Preview mode for collapsed FAQs
  - Real-time updates

- **UI States**:
  - Empty state with call-to-action
  - Expanded editing mode
  - Collapsed preview mode

### Providers

#### SettingsProvider
React Context provider managing settings state:

- **State Management**:
  - Settings data
  - Loading states
  - Error handling
  - Saving states

- **Methods**:
  - `loadSettings()`: Load settings from repository
  - `saveSettings()`: Save settings with validation
  - `resetSettings()`: Reset to defaults
  - `updateSettings()`: Update local state

- **Lifecycle**: Automatically loads settings on mount

## Usage

### Basic Integration

```tsx
import { SettingsProvider } from './providers/SettingsProvider';
import SettingsForm from './components/SettingsForm';

function App() {
  return (
    <SettingsProvider>
      <SettingsForm />
    </SettingsProvider>
  );
}
```

### Using Settings Context

```tsx
import { useSettings } from './providers/SettingsProvider';

function MyComponent() {
  const { settings, loading, saveSettings } = useSettings();
  
  // Use settings data
  return <div>{settings.appName}</div>;
}
```

## Configuration

### Firebase Setup

Ensure Firebase is properly configured in `src/lib/firebase.ts` with:
- Firestore database
- Proper security rules for `admin_data` collection
- Authentication (if required)

### Default Settings

Default settings are defined in `AppSettings.ts`:

```typescript
export const defaultAppSettings: AppSettings = {
  appName: '',
  appTagline: '',
  termsAndConditionLink: '',
  email: '',
  whatsappNumber: '',
  phoneNumber: '',
  appVersion: '',
  faqs: [],
};
```

## Error Handling

The feature implements comprehensive error handling:

1. **Repository Level**: Graceful fallbacks to default values
2. **Use Case Level**: Validation errors with descriptive messages
3. **Presentation Level**: User-friendly error display and loading states

## Testing Considerations

### Unit Tests
- Test use cases with mock repositories
- Test validation logic
- Test error scenarios

### Integration Tests
- Test Firebase repository operations
- Test provider state management
- Test component interactions

### E2E Tests
- Test complete settings workflow
- Test form validation
- Test save/reset operations

## Future Enhancements

### Potential Improvements
1. **Settings Categories**: Group related settings
2. **Settings History**: Track changes over time
3. **Import/Export**: Backup and restore settings
4. **Validation Rules**: More sophisticated validation
5. **Settings Templates**: Predefined configuration templates
6. **Real-time Sync**: Multi-user settings synchronization

### Technical Debt
1. **Error Messages**: Centralize error message management
2. **Loading States**: Implement skeleton loading
3. **Accessibility**: Improve ARIA labels and keyboard navigation
4. **Performance**: Implement settings caching
5. **Type Safety**: Strengthen TypeScript types

## Dependencies

- React 18+
- Firebase/Firestore
- TypeScript
- Tailwind CSS (for styling)

## File Structure

```
src/features/app-settings/
├── README.md                                    # This documentation
├── domain/
│   ├── entities/
│   │   └── AppSettings.ts                      # Core entities and interfaces
│   ├── repositories/
│   │   └── SettingsRepository.ts               # Repository interface
│   └── usecases/
│       ├── GetSettingsUseCase.ts               # Load settings use case
│       ├── SaveSettingsUseCase.ts              # Save settings use case
│       └── ResetSettingsUseCase.ts             # Reset settings use case
├── data/
│   └── repositories/
│       └── FirebaseSettingsRepository.ts       # Firebase implementation
└── presentation/
    ├── components/
    │   ├── SettingsForm.tsx                     # Main settings form
    │   └── FAQsManager.tsx                      # FAQ management component
    └── providers/
        └── SettingsProvider.tsx                 # React context provider
```

---

*This documentation is automatically generated and should be updated when the feature evolves.*
