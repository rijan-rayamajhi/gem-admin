export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface AppSettings {
  appName: string;
  appTagline: string;
  termsAndConditionLink: string;
  email: string;
  whatsappNumber: string;
  phoneNumber: string;
  appVersion: string;
  faqs: FAQ[];
}

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
