// Password strength checker
export interface PasswordStrength {
  hasLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface InvitationData {
  _id: string;
  email: string;
  displayName: string;
  role: string;
  invitedBy: string;
  invitedAt: number;
  expiresAt?: number;
  // Business details from server (read-only on client)
  companyName?: string;
  companyGST?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessCity?: string;
  businessState?: string;
  businessCountry?: string;
  businessPostalCode?: string;
  businessType?: string;
}

export interface SignUpFormProps {
  invitation?: InvitationData | null;
  companyInvitationId?: string | null;
}
