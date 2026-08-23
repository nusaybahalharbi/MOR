export interface MerchantLead {
  storeName: string;
  businessType: string;
  city: string;
  contactName: string;
  phone: string;
  email: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
}

export interface WaitlistSignup {
  contact: string;
}

export type FormSubmissionResult = {
  success: boolean;
  message?: string;
};
