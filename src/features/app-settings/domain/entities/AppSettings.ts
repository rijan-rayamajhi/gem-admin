export interface AppSettings {
  appName: string;
  appTagline: string;
  termsAndConditionLink: string;
  email: string;
  whatsappNumber: string;
  phoneNumber: string;
  appVersion: string;
}

export const defaultAppSettings: AppSettings = {
  appName: '',
  appTagline: '',
  termsAndConditionLink: '',
  email: '',
  whatsappNumber: '',
  phoneNumber: '',
  appVersion: '',
};
