/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BusinessContact {
  id: string;
  label: string; // Head Office, Branch 1, Warehouse, Factory
  phone: string;
  email: string;
  address: string;
  isPrimary: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  accountType: 'Current' | 'Savings' | 'OD / CC' | 'Escrow';
  upiId: string;
  additionalUpiIds: string[];
  isPrimary: boolean;
}

export interface BusinessRegistration {
  id: string;
  title: string;
  gstin?: string;
  registrationType?: string;
  state?: string;
  expiryDate?: string;
  renewalReminderDays?: number;
  notes?: string;
}

export interface BusinessActivity {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface Business {
  id: string;
  name: string;
  logoColor: string;
  logoIcon: string;
  category: string;
  type: string;
  description: string;
  registrationNumber: string;
  website: string;
  status: 'Active' | 'Inactive' | 'Archived';
  establishmentDate: string;
  contacts: BusinessContact[];
  bankAccounts: BankAccount[];
  registrations: BusinessRegistration[];
  activities: BusinessActivity[];
  createdAt: number;
  updatedAt: number;
}

export interface PersonBusinessAssociation {
  businessId: string;
  role: 'Partner' | 'Employee' | 'Consultant' | 'Director' | 'Advisor' | 'Other';
  designation: string;
  activities: string[];
  joiningDate: string;
  status: 'Active' | 'Inactive';
  notes?: string;
}

export interface Person {
  id: string;
  fullName: string;
  primaryType: 'Partner' | 'Employee' | 'Other';
  phoneNumbers: string[];
  emailAddresses: string[];
  address: string;
  dateOfBirth?: string;
  designation: string;
  notes: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  businessAssociations: PersonBusinessAssociation[];
  createdAt: number;
  updatedAt: number;
}

export interface DirectoryContact {
  id: string;
  name: string;
  category: 'Customer' | 'Supplier' | 'Banker' | 'Auditor' | 'Government' | 'Transporter' | 'Lawyer' | 'Vendor' | 'Investor' | 'Other';
  phone: string;
  alternatePhone?: string;
  email?: string;
  company?: string;
  address?: string;
  isImportant: boolean;
  notes?: string;
  createdAt: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  businessId?: string;
  personId?: string;
  assignedPersonId?: string;
  startDate?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  reminder: boolean;
  notes?: string;
  completedAt?: number;
  createdAt: number;
}

export interface TimetableActivity {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  businessId?: string;
  personId?: string;
  location?: string;
  description?: string;
  reminder: boolean;
  isCompleted: boolean;
  createdAt: number;
}

export interface CallRecord {
  id: string;
  contactName: string;
  phoneNumber: string;
  businessId?: string;
  personId?: string;
  dateTime: string;
  callPurpose: string;
  discussionDetails: string;
  status: 'Incoming' | 'Outgoing' | 'Missed' | 'Scheduled';
  durationSeconds?: number;
  nextFollowUpDate?: string;
  notes?: string;
  createdAt: number;
}

export interface MeetingItem {
  id: string;
  title: string;
  purpose: string;
  businessId?: string;
  participantIds: string[];
  participantNames: string;
  date: string;
  startTime: string;
  endTime: string;
  locationOrLink: string;
  agenda: string;
  discussionNotes: string;
  decisions: string;
  nextActions: string;
  followUpDate?: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  createdAt: number;
}

export interface FollowUpItem {
  id: string;
  contactName: string;
  contactCategory: 'Customer' | 'Supplier' | 'Business Partner' | 'Employee' | 'Other';
  businessId?: string;
  personId?: string;
  source: 'Manual' | 'Call' | 'Meeting' | 'Directory';
  sourceId?: string;
  purpose: string;
  date: string;
  time?: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'Cancelled';
  nextFollowUpDate?: string;
  notes?: string;
  createdAt: number;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: 'WhatsApp' | 'SMS' | 'Email' | 'Business Reply' | 'Customer' | 'Supplier' | 'Payment Reminder' | 'Follow-up' | 'Custom';
  content: string;
  language: string;
  businessId?: string;
  notes?: string;
  createdAt: number;
}

export interface CredentialItem {
  id: string;
  title: string;
  loginUrl: string;
  username: string;
  email: string;
  passwordCipher: string; // encrypted locally
  accountNumberOrRef: string;
  businessId?: string;
  category: 'Banking' | 'Govt Portal' | 'Vendor' | 'Cloud' | 'Social' | 'Internal' | 'Other';
  notes?: string;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  businessId?: string;
  personId?: string;
  taskId?: string;
  meetingId?: string;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileDataUrl: string;
  description: string;
  uploadDate: string;
  businessId?: string;
  personId?: string;
  category: 'Legal & Registration' | 'Tax & Financial' | 'Agreements & Contracts' | 'Identity & KYC' | 'Invoices & Receipts' | 'Certificates' | 'Other';
  expiryDate?: string;
  reminder: boolean;
  notes?: string;
  createdAt: number;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  orderTitle: string;
  customerOrSupplier: string;
  businessId?: string;
  orderType: 'Sales' | 'Purchase';
  orderDate: string;
  expectedDeliveryDate: string;
  amount: number;
  currency: string;
  description: string;
  assignedPersonId?: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  notes?: string;
  createdAt: number;
}

export interface BusinessTemplateItem {
  id: string;
  title: string;
  category: 'Business Letter' | 'Email Format' | 'Quotation Format' | 'Standard Message' | 'Checklist' | 'Contract Outline' | 'Invoice Memo' | 'Custom';
  content: string;
  tags: string[];
  createdAt: number;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  primaryColor: string;
  pinCode?: string;
  isPinEnabled: boolean;
  isBiometricEnabled: boolean;
  timeFormat: '12h' | '24h';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  viewMode: 'android_frame' | 'responsive';
  notificationsEnabled: boolean;
  lastBackupDate?: string;
}

export type AppModule =
  | 'dashboard'
  | 'businesses'
  | 'people'
  | 'directory'
  | 'tasks'
  | 'timetable'
  | 'calls'
  | 'meetings'
  | 'followups'
  | 'messages'
  | 'credentials'
  | 'notes'
  | 'documents'
  | 'orders'
  | 'templates'
  | 'settings';
