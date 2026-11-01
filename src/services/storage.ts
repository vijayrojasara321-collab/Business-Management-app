/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Business,
  Person,
  DirectoryContact,
  TaskItem,
  TimetableActivity,
  CallRecord,
  MeetingItem,
  FollowUpItem,
  MessageTemplate,
  CredentialItem,
  NoteItem,
  DocumentItem,
  OrderItem,
  BusinessTemplateItem,
  AppSettings,
} from '../types';

export interface AppDatabaseState {
  businesses: Business[];
  people: Person[];
  directory: DirectoryContact[];
  tasks: TaskItem[];
  timetable: TimetableActivity[];
  calls: CallRecord[];
  meetings: MeetingItem[];
  followups: FollowUpItem[];
  messages: MessageTemplate[];
  credentials: CredentialItem[];
  notes: NoteItem[];
  documents: DocumentItem[];
  orders: OrderItem[];
  templates: BusinessTemplateItem[];
  settings: AppSettings;
}

const DB_KEY = 'my_personal_biz_assistant_db_v1';
const DB_VERSION = 1;

// Seed data demonstrating real business multi-enterprise associations
const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz-1',
    name: 'Apex Global Exports Pvt Ltd',
    logoColor: '#0284c7',
    logoIcon: 'Globe',
    category: 'Export & International Trade',
    type: 'Private Limited',
    description: 'Premier merchant and manufacturer exporter of agricultural commodities and textile handicrafts.',
    registrationNumber: 'U51909GJ2018PTC104521',
    website: 'https://apexglobalexports.example.com',
    status: 'Active',
    establishmentDate: '2018-04-12',
    contacts: [
      {
        id: 'cnt-1',
        label: 'Headquarters & Admin Office',
        phone: '+91 98250 12345',
        email: 'info@apexglobal.com',
        address: 'Suite 401, World Trade Center, Ring Road, Surat, Gujarat 395002',
        isPrimary: true,
      },
      {
        id: 'cnt-2',
        label: 'JNPT Port Logistics Hub',
        phone: '+91 98250 12346',
        email: 'shipping@apexglobal.com',
        address: 'Warehouse Complex 4, Sector 7, Nhava Sheva, Navi Mumbai, MH 400707',
        isPrimary: false,
      },
    ],
    bankAccounts: [
      {
        id: 'bank-1',
        bankName: 'HDFC Bank Ltd',
        accountHolder: 'Apex Global Exports Pvt Ltd',
        accountNumber: '50200034891240',
        ifsc: 'HDFC0000084',
        branch: 'Athwa Lines, Surat',
        accountType: 'Current',
        upiId: 'apexglobal@hdfcbank',
        additionalUpiIds: ['9825012345@paytm'],
        isPrimary: true,
      },
      {
        id: 'bank-2',
        bankName: 'State Bank of India (SBI)',
        accountHolder: 'Apex Global Exports Pvt Ltd',
        accountNumber: '38901248100',
        ifsc: 'SBIN0003849',
        branch: 'Overseas Commercial Branch, Ahmedabad',
        accountType: 'OD / CC',
        upiId: 'apexexports@sbi',
        additionalUpiIds: [],
        isPrimary: false,
      },
    ],
    registrations: [
      {
        id: 'reg-1',
        title: 'GSTIN - Gujarat Regular',
        gstin: '24AAACA1234E1Z8',
        registrationType: 'Regular GST',
        state: 'Gujarat (24)',
        expiryDate: '2028-03-31',
        renewalReminderDays: 30,
        notes: 'Monthly GSTR-1 & GSTR-3B filings',
      },
      {
        id: 'reg-2',
        title: 'IEC (Import Export Code) - DGFT',
        gstin: '0308012345',
        registrationType: 'Foreign Trade IEC',
        state: 'National',
        expiryDate: '2029-12-31',
        renewalReminderDays: 60,
        notes: 'Annual IEC online updation due in April',
      },
      {
        id: 'reg-3',
        title: 'APEDA Registration (RCMC)',
        gstin: 'RCMC/APEDA/2021/481',
        registrationType: 'Export Promotion Council',
        state: 'National',
        expiryDate: '2027-06-30',
        renewalReminderDays: 45,
        notes: 'RCMC renewal every 5 years',
      },
    ],
    activities: [
      { id: 'act-1', name: 'Export – Wholesale', isDefault: true },
      { id: 'act-2', name: 'Export – Industrial Bulk', isDefault: true },
      { id: 'act-3', name: 'Documentation & Customs', isDefault: true },
      { id: 'act-4', name: 'Logistics and Shipping', isDefault: true },
      { id: 'act-5', name: 'Accounts and Finance', isDefault: true },
    ],
    createdAt: Date.now() - 365 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'biz-2',
    name: 'Zenith Tech Ventures LLP',
    logoColor: '#6366f1',
    logoIcon: 'Cpu',
    category: 'Information Technology & SaaS',
    type: 'Limited Liability Partnership',
    description: 'Enterprise ERP systems, custom automation pipelines, and B2B SaaS solutions for Indian MSMEs.',
    registrationNumber: 'AAP-8921',
    website: 'https://zenithtech.example.io',
    status: 'Active',
    establishmentDate: '2021-09-15',
    contacts: [
      {
        id: 'cnt-3',
        label: 'Development Studio & Registered Office',
        phone: '+91 97140 88990',
        email: 'contact@zenithtech.example.io',
        address: '5th Floor, Infinity IT Tower, SG Highway, Ahmedabad, Gujarat 380054',
        isPrimary: true,
      },
    ],
    bankAccounts: [
      {
        id: 'bank-3',
        bankName: 'ICICI Bank',
        accountHolder: 'Zenith Tech Ventures LLP',
        accountNumber: '184905001294',
        ifsc: 'ICIC0001849',
        branch: 'SG Highway, Ahmedabad',
        accountType: 'Current',
        upiId: 'zenithtech@icici',
        additionalUpiIds: ['zenith.pay@okaxis'],
        isPrimary: true,
      },
    ],
    registrations: [
      {
        id: 'reg-4',
        title: 'GSTIN - Gujarat Regular',
        gstin: '24AAIFZ9981B1ZG',
        registrationType: 'Regular GST',
        state: 'Gujarat (24)',
        expiryDate: '2030-01-01',
        renewalReminderDays: 30,
        notes: 'Monthly compliance & LUT for zero-rated IT exports',
      },
      {
        id: 'reg-5',
        title: 'MSME Udyam Registration',
        gstin: 'UDYAM-GJ-01-0028471',
        registrationType: 'Micro Enterprise Certificate',
        state: 'Gujarat',
        notes: 'Eligible for MSME credit guarantee subsidies',
      },
    ],
    activities: [
      { id: 'act-6', name: 'Software Development & Architecture' },
      { id: 'act-7', name: 'Sales & Client Demos' },
      { id: 'act-8', name: 'Accounts and Finance' },
      { id: 'act-9', name: 'Support & Maintenance' },
    ],
    createdAt: Date.now() - 200 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'biz-3',
    name: 'Vardhman Agro Industries',
    logoColor: '#10b981',
    logoIcon: 'Sprout',
    category: 'Agri Processing & Domestic Supply',
    type: 'Partnership',
    description: 'Bulk grain processing, pulses sorting, and domestic wholesale distribution across Western India.',
    registrationNumber: 'REG/PT/2019/774',
    website: '',
    status: 'Active',
    establishmentDate: '2019-11-20',
    contacts: [
      {
        id: 'cnt-4',
        label: 'Processing Plant & Yard',
        phone: '+91 94260 55443',
        email: 'vardhmanagro@example.com',
        address: 'Plot 88-92, GIDC Industrial Estate, Unjha, Mehsana, Gujarat 384170',
        isPrimary: true,
      },
    ],
    bankAccounts: [
      {
        id: 'bank-4',
        bankName: 'Kotak Mahindra Bank',
        accountHolder: 'Vardhman Agro Industries',
        accountNumber: '8812390192',
        ifsc: 'KKBK0000881',
        branch: 'Unjha Mandi Branch',
        accountType: 'Current',
        upiId: 'vardhmanagro@kotak',
        additionalUpiIds: [],
        isPrimary: true,
      },
    ],
    registrations: [
      {
        id: 'reg-6',
        title: 'FSSAI Food License',
        gstin: '10721014000382',
        registrationType: 'Central Food Safety License',
        state: 'Gujarat',
        expiryDate: '2027-11-15',
        renewalReminderDays: 45,
        notes: 'Annual audit report required before Oct',
      },
      {
        id: 'reg-7',
        title: 'GSTIN - Gujarat Regular',
        gstin: '24AAEFV4412P1ZL',
        registrationType: 'Regular GST',
        state: 'Gujarat (24)',
        expiryDate: '2029-08-10',
        renewalReminderDays: 30,
      },
    ],
    activities: [
      { id: 'act-10', name: 'Domestic Wholesale' },
      { id: 'act-11', name: 'Industrial Bulk' },
      { id: 'act-12', name: 'Purchase & Procurement' },
      { id: 'act-13', name: 'Operations & Quality Lab' },
    ],
    createdAt: Date.now() - 300 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
  },
];

// Seed People demonstrating one person associated with multiple businesses!
const INITIAL_PEOPLE: Person[] = [
  {
    id: 'per-1',
    fullName: 'Rahul Sharma',
    primaryType: 'Partner',
    phoneNumbers: ['+91 98251 44556', '+91 94280 11223'],
    emailAddresses: ['rahul.sharma@apexglobal.com', 'rahul@zenithtech.example.io'],
    address: 'B-602, Royal Palms Heights, Vesu, Surat, Gujarat 395007',
    dateOfBirth: '1987-08-14',
    designation: 'Managing Partner & Director',
    notes: 'Key decision maker for overseas buyer contracts and technological infrastructure.',
    status: 'Active',
    businessAssociations: [
      {
        businessId: 'biz-1', // Apex Global
        role: 'Partner',
        designation: 'Export Director & Head of Sales',
        activities: ['Export – Wholesale', 'Export – Industrial Bulk', 'Documentation & Customs'],
        joiningDate: '2018-04-12',
        status: 'Active',
        notes: 'Leads buyer negotiations in UAE and EU markets.',
      },
      {
        businessId: 'biz-2', // Zenith Tech
        role: 'Employee',
        designation: 'Chief Financial Officer & Accounts Head',
        activities: ['Accounts and Finance', 'Sales & Client Demos'],
        joiningDate: '2021-10-01',
        status: 'Active',
        notes: 'Oversees accounting, taxation, and investor relations for SaaS operations.',
      },
    ],
    createdAt: Date.now() - 120 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'per-2',
    fullName: 'Pooja Patel',
    primaryType: 'Employee',
    phoneNumbers: ['+91 97123 99887'],
    emailAddresses: ['pooja.patel@apexglobal.com'],
    address: '14, Shreenath Park, Pal Gam, Surat, Gujarat 395009',
    dateOfBirth: '1992-03-22',
    designation: 'Sr. Documentation & Customs Specialist',
    notes: 'Handles bills of lading, phytosanitary certificates, bank realization (e-BRC), and duty drawback claims.',
    status: 'Active',
    businessAssociations: [
      {
        businessId: 'biz-1',
        role: 'Employee',
        designation: 'Export Documentation Manager',
        activities: ['Documentation & Customs', 'Logistics and Shipping'],
        joiningDate: '2020-02-15',
        status: 'Active',
        notes: 'Point of contact for Mundra and JNPT CHA.',
      },
    ],
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'per-3',
    fullName: 'Amitabh Verma',
    primaryType: 'Partner',
    phoneNumbers: ['+91 99240 77112'],
    emailAddresses: ['amitabh@zenithtech.example.io'],
    address: 'A-201, Iscon Platinum, Bopal, Ahmedabad 380058',
    dateOfBirth: '1985-11-05',
    designation: 'Technical Partner & Solutions Architect',
    notes: 'Leads engineering, server infrastructure, and security implementations.',
    status: 'Active',
    businessAssociations: [
      {
        businessId: 'biz-2',
        role: 'Partner',
        designation: 'Chief Technology Officer (CTO)',
        activities: ['Software Development & Architecture', 'Support & Maintenance'],
        joiningDate: '2021-09-15',
        status: 'Active',
        notes: 'Full ownership of technical sprint roadmaps.',
      },
    ],
    createdAt: Date.now() - 80 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  },
  {
    id: 'per-4',
    fullName: 'Dinesh Bhai Mehta',
    primaryType: 'Partner',
    phoneNumbers: ['+91 98240 33445'],
    emailAddresses: ['dinesh@vardhmanagro.example.com'],
    address: 'Station Road, Unjha, Mehsana, Gujarat 384170',
    dateOfBirth: '1974-06-19',
    designation: 'Senior Partner - Mandi Operations',
    notes: 'Over 28 years experience in agricultural APMC auctions and physical quality grading.',
    status: 'Active',
    businessAssociations: [
      {
        businessId: 'biz-3',
        role: 'Partner',
        designation: 'Managing Partner - Procurement',
        activities: ['Purchase & Procurement', 'Operations & Quality Lab', 'Domestic Wholesale'],
        joiningDate: '2019-11-20',
        status: 'Active',
      },
    ],
    createdAt: Date.now() - 110 * 86400000,
    updatedAt: Date.now() - 15 * 86400000,
  },
];

const INITIAL_DIRECTORY: DirectoryContact[] = [
  {
    id: 'dir-1',
    name: 'Al-Mansoor Foodstuff Trading LLC',
    category: 'Customer',
    phone: '+971 4 223 8890',
    alternatePhone: '+971 50 123 4567',
    email: 'purchase@almansoor-uae.example',
    company: 'Al-Mansoor Group Dubai',
    address: 'Al Ras, Deira, P.O. Box 48102, Dubai, UAE',
    isImportant: true,
    notes: 'Key buyer for Cumin Seeds, Fennel and Sesame seeds. Regular 40ft container orders every 45 days.',
    createdAt: Date.now() - 100 * 86400000,
  },
  {
    id: 'dir-2',
    name: 'Vikram Joshi (Customs House Agent)',
    category: 'Transporter',
    phone: '+91 98255 11002',
    email: 'vikram@oceaniclogistics.example',
    company: 'Oceanic Clearing & Forwarding Agency',
    address: 'Office 203, JNPT Port Plaza, Uran, Navi Mumbai',
    isImportant: true,
    notes: 'Our primary CHA for Mundra & JNPT port stuffing, customs clearance and BL releases.',
    createdAt: Date.now() - 95 * 86400000,
  },
  {
    id: 'dir-3',
    name: 'Ketan Shah, Chartered Accountant',
    category: 'Auditor',
    phone: '+91 98250 88221',
    email: 'kshah@kshahassociates.in',
    company: 'K. Shah & Associates Chartered Accountants',
    address: '302 City Centre, Near Majura Gate, Surat',
    isImportant: true,
    notes: 'Statutory auditor for Apex Global Exports and Zenith Tech Ventures. File GST and ROC returns.',
    createdAt: Date.now() - 85 * 86400000,
  },
  {
    id: 'dir-4',
    name: 'Rajesh Singhal (Branch Manager)',
    category: 'Banker',
    phone: '+91 98110 44552',
    email: 'rajesh.singhal@hdfcbank.com',
    company: 'HDFC Bank - Commercial Banking Dept',
    address: 'Athwa Lines Branch, Surat',
    isImportant: true,
    notes: 'Handles export credit letter of credit (LC discounting), forward contracts, and pre-shipment credit.',
    createdAt: Date.now() - 60 * 86400000,
  },
];

const todayStr = new Date().toISOString().split('T')[0];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'Verify Shipping Bill & BL Draft for Dubai Container #284',
    description: 'Check invoice numbers, HS code 09093129, FOB value, and port of discharge before customs clearance.',
    businessId: 'biz-1',
    personId: 'per-2',
    assignedPersonId: 'per-2',
    startDate: todayStr,
    dueDate: todayStr,
    dueTime: '15:30',
    priority: 'Urgent',
    status: 'Pending',
    reminder: true,
    notes: 'Forward copy to Al-Mansoor bank for LC presentation.',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'tsk-2',
    title: 'Review Quarterly GST GSTR-3B Reconciliation',
    description: 'Cross-check 2B ITC mismatch with CA Ketan Shah and approve monthly tax payout.',
    businessId: 'biz-1',
    personId: 'per-1',
    assignedPersonId: 'per-1',
    startDate: todayStr,
    dueDate: todayStr,
    dueTime: '17:00',
    priority: 'High',
    status: 'In Progress',
    reminder: true,
    notes: 'ITC invoice ledger matched up to 98%.',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'tsk-3',
    title: 'Deploy Sprint 42 Patch for Enterprise ERP API',
    description: 'Push PostgreSQL indexing update and OAuth token rotation to production server.',
    businessId: 'biz-2',
    personId: 'per-3',
    assignedPersonId: 'per-3',
    startDate: todayStr,
    dueDate: todayStr,
    dueTime: '20:00',
    priority: 'Medium',
    status: 'Pending',
    reminder: false,
    notes: 'Scheduled for non-business hours after 8 PM.',
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'tsk-4',
    title: 'Inspect New Crop Cumin Arrival at Unjha Yard',
    description: 'Lab test moisture content (<8%) and foreign matter percentage for batch #UJ-992.',
    businessId: 'biz-3',
    personId: 'per-4',
    assignedPersonId: 'per-4',
    startDate: todayStr,
    dueDate: todayStr,
    dueTime: '11:00',
    priority: 'High',
    status: 'Completed',
    reminder: false,
    completedAt: Date.now() - 3600000,
    notes: 'Quality passed with 99.2% purity rating.',
    createdAt: Date.now() - 4 * 86400000,
  },
];

const INITIAL_TIMETABLE: TimetableActivity[] = [
  {
    id: 'time-1',
    title: 'Morning Executive Briefing & Dispatch Check',
    date: todayStr,
    startTime: '09:30',
    endTime: '10:15',
    durationMinutes: 45,
    businessId: 'biz-1',
    personId: 'per-1',
    location: 'Surat Office Boardroom',
    description: 'Review port bookings, vessel schedules, and pending supplier payments.',
    reminder: true,
    isCompleted: true,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'time-2',
    title: 'HDFC Bank Manager Meet - Export Credit Limit Review',
    date: todayStr,
    startTime: '11:30',
    endTime: '12:30',
    durationMinutes: 60,
    businessId: 'biz-1',
    personId: 'per-1',
    location: 'HDFC Bank Commercial Hub, Athwa Lines',
    description: 'Discuss enhancement of packing credit line to ₹3.5 Crore.',
    reminder: true,
    isCompleted: false,
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'time-3',
    title: 'Zenith Tech Architecture & Cloud Cost Audit',
    date: todayStr,
    startTime: '14:30',
    endTime: '15:30',
    durationMinutes: 60,
    businessId: 'biz-2',
    personId: 'per-3',
    location: 'Google Meet / Zoom',
    description: 'Review AWS/GCP monthly consumption and discuss savings with Amitabh.',
    reminder: true,
    isCompleted: false,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'time-4',
    title: 'Vardhman Agro Mandi Stock & Dispatch Review',
    date: todayStr,
    startTime: '16:45',
    endTime: '17:30',
    durationMinutes: 45,
    businessId: 'biz-3',
    personId: 'per-4',
    location: 'Phone Call Conference',
    description: 'Coordinate truck dispatches to Mumbai wholesale traders.',
    reminder: false,
    isCompleted: false,
    createdAt: Date.now() - 86400000,
  },
];

const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'call-1',
    contactName: 'Tariq Al-Mansoor (Dubai)',
    phoneNumber: '+971 50 123 4567',
    businessId: 'biz-1',
    personId: 'per-1',
    dateTime: `${todayStr} 10:45`,
    callPurpose: 'Discuss LC amendment for 40ft container shipment',
    discussionDetails: 'Buyer confirmed extension of latest date of shipment by 7 days. They will issue Swift amendment MT707 by tomorrow noon.',
    status: 'Incoming',
    durationSeconds: 380,
    nextFollowUpDate: todayStr,
    notes: 'Inform Pooja to verify updated LC draft immediately upon arrival.',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'call-2',
    contactName: 'Vikram Joshi (CHA)',
    phoneNumber: '+91 98255 11002',
    businessId: 'biz-1',
    personId: 'per-2',
    dateTime: `${todayStr} 09:15`,
    callPurpose: 'Mundra Port container gate-in status',
    discussionDetails: 'Container MSKU-8192014 successfully gated into Mundra terminal. Vessel ETA on track for 4th November.',
    status: 'Outgoing',
    durationSeconds: 210,
    nextFollowUpDate: '',
    notes: 'Shipping bill assessment complete with zero queries.',
    createdAt: Date.now() - 14400000,
  },
];

const INITIAL_MEETINGS: MeetingItem[] = [
  {
    id: 'meet-1',
    title: 'Foreign Trade LC Discounting & Hedging Strategy',
    purpose: 'Fix EUR/USD forward hedging rates for upcoming Q3 dispatches and finalize interest subvention claims.',
    businessId: 'biz-1',
    participantIds: ['per-1'],
    participantNames: 'Rahul Sharma, Rajesh Singhal (HDFC Bank)',
    date: todayStr,
    startTime: '11:30',
    endTime: '12:30',
    locationOrLink: 'HDFC Bank Regional Commercial Office',
    agenda: '1. Review current Forex exposure.\n2. Forward contract booking rate.\n3. RodTEP export incentive scroll crediting.',
    discussionNotes: 'Bank agreed to 3-month forward cover at favourable spot premium. Packing credit sanctioned.',
    decisions: 'Booked forward cover for $250,000 USD at 84.15 INR/USD.',
    nextActions: 'Submit original shipping bills within 21 days of sailing.',
    followUpDate: todayStr,
    status: 'Upcoming',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'meet-2',
    title: 'Zenith Tech Sprint 42 Review & Enterprise Demo',
    purpose: 'Review sprint deliverables and prepare presentation for German logistics client.',
    businessId: 'biz-2',
    participantIds: ['per-1', 'per-3'],
    participantNames: 'Rahul Sharma, Amitabh Verma',
    date: todayStr,
    startTime: '14:30',
    endTime: '15:30',
    locationOrLink: 'https://meet.google.com/abc-wxyz-biz',
    agenda: 'Demonstrate new multi-currency invoice parser and automated GST reconciler.',
    discussionNotes: 'API latency reduced from 420ms to 95ms with Redis caching.',
    decisions: 'Client pilot kickoff scheduled for 10th November.',
    nextActions: 'Amitabh to prepare user manual and staging credentials.',
    status: 'Upcoming',
    createdAt: Date.now() - 2 * 86400000,
  },
];

const INITIAL_FOLLOWUPS: FollowUpItem[] = [
  {
    id: 'foll-1',
    contactName: 'Al-Mansoor Foodstuff Trading LLC',
    contactCategory: 'Customer',
    businessId: 'biz-1',
    personId: 'per-1',
    source: 'Call',
    sourceId: 'call-1',
    purpose: 'Collect Swift copy of LC amendment MT707 from Dubai bank',
    date: todayStr,
    time: '16:00',
    status: 'Pending',
    nextFollowUpDate: todayStr,
    notes: 'Urgent - vessel cut-off is Thursday evening.',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'foll-2',
    contactName: 'CA Ketan Shah',
    contactCategory: 'Other',
    businessId: 'biz-1',
    personId: 'per-1',
    source: 'Manual',
    purpose: 'Sign GSTR-9 annual return digital signature certificates',
    date: todayStr,
    time: '18:00',
    status: 'Pending',
    nextFollowUpDate: todayStr,
    notes: 'DSC token kept in office safe #2.',
    createdAt: Date.now() - 86400000,
  },
];

const INITIAL_MESSAGES: MessageTemplate[] = [
  {
    id: 'msg-1',
    title: 'Container Dispatch & Tracking Notification (WhatsApp)',
    category: 'WhatsApp',
    content: `Dear [Customer Name],

Greetings from [Business Name]! 🚢
We are pleased to inform you that your consignment under Invoice #[Invoice No] has been stuffed and dispatched to the port.

📦 Container No: [Container No]
🚢 Vessel: [Vessel Name]
📑 Bill of Lading: [BL Number]
📍 Port of Loading: Mundra Port, India
📍 Port of Discharge: [Discharge Port]
⏱️ Expected Departure: [ETD Date]

Shipping documents copy has been sent to your email. Please let us know if you need any further assistance.

Best regards,
[Sender Name]
[Business Name]`,
    language: 'English',
    businessId: 'biz-1',
    notes: 'Standard notification sent to overseas buyers on vessel gate-in.',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'msg-2',
    title: 'Payment Reminder & Bank Account Details (Email / WhatsApp)',
    category: 'Payment Reminder',
    content: `Dear [Client / Customer],

Hope this message finds you well.

This is a gentle reminder regarding our pending Invoice #[Invoice No] dated [Invoice Date] for the amount of [Amount] due on [Due Date].

Please arrange payment to our official banking account:
🏦 Bank Name: [Bank Name]
👤 Account Holder: [Account Holder]
🔢 Account Number: [Account Number]
🏛️ IFSC Code: [IFSC Code]
⚡ UPI ID: [UPI ID]

Kindly share the transaction receipt or UTR number once processed so we can promptly credit your ledger.

Thank you for your business!`,
    language: 'English',
    notes: 'Polite reminder for domestic and export clients.',
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'msg-3',
    title: 'Order Acknowledgment & Processing Update',
    category: 'Customer',
    content: `Dear [Customer Name],

Thank you for placing Order #[Order No] with [Business Name]. We have reviewed your specifications and processing has commenced.

Estimated completion and dispatch date is [Expected Delivery Date]. Our team will notify you with the shipping details as soon as the consignment is dispatched.

For any queries, please reach us at [Phone / Email].`,
    language: 'English',
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'msg-4',
    title: 'Supplier Purchase Order Follow-up (Urgent)',
    category: 'Supplier',
    content: `Dear [Supplier Name],

With reference to our Purchase Order #[PO Number] for [Item Details], please confirm the exact truck dispatch schedule from your factory.

We require delivery at our warehouse by [Required Date] to meet vessel cut-off deadlines. Please share the driver contact and LR copy as soon as loaded.

Warm regards,
[Business Name]`,
    language: 'English',
    createdAt: Date.now() - 15 * 86400000,
  },
];

const INITIAL_CREDENTIALS: CredentialItem[] = [
  {
    id: 'cred-1',
    title: 'DGFT (Directorate General of Foreign Trade) Portal',
    loginUrl: 'https://www.dgft.gov.in',
    username: 'APEX_EXPORT_SURAT',
    email: 'info@apexglobal.com',
    passwordCipher: 'b64:RGdmdEFwZXhAMjAyNiM=', // Protected
    accountNumberOrRef: 'IEC: 0308012345',
    businessId: 'biz-1',
    category: 'Govt Portal',
    notes: 'Linked to DSC Token #Surat24. Required for Advance Authorisation and RoDTEP e-scrip issuance.',
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'cred-2',
    title: 'ICEGATE (Indian Customs EDI Gateway)',
    loginUrl: 'https://www.icegate.gov.in',
    username: 'ICE_APEX_24',
    email: 'shipping@apexglobal.com',
    passwordCipher: 'b64:SWNlR2F0ZUAyMDI2U2hpcA==',
    accountNumberOrRef: 'Customs ID: 89412',
    businessId: 'biz-1',
    category: 'Govt Portal',
    notes: 'Daily tracking of e-Sanchit document uploads and IGST refund scroll numbers.',
    createdAt: Date.now() - 50 * 86400000,
  },
  {
    id: 'cred-3',
    title: 'HDFC Corporate NetBanking (Enet)',
    loginUrl: 'https://corporatebanking.hdfcbank.com',
    username: 'APEXCORP_ADMIN',
    email: 'rahul.sharma@apexglobal.com',
    passwordCipher: 'b64:SERGQ0BFeHBvcnQjOTkyMQ==',
    accountNumberOrRef: 'Customer ID: 49102914',
    businessId: 'biz-1',
    category: 'Banking',
    notes: 'Requires hardware OTP token + SMS OTP. Authorisation limit ₹50,00,000.',
    createdAt: Date.now() - 40 * 86400000,
  },
  {
    id: 'cred-4',
    title: 'GST Common Portal (CBIC)',
    loginUrl: 'https://services.gst.gov.in',
    username: '24AAACA1234E1Z8_USER',
    email: 'accounts@apexglobal.com',
    passwordCipher: 'b64:R1NUQEFwZXgyMDI2IQ==',
    accountNumberOrRef: 'GSTIN: 24AAACA1234E1Z8',
    businessId: 'biz-1',
    category: 'Govt Portal',
    notes: 'Password expiry every 90 days. Next change due Dec 2026.',
    createdAt: Date.now() - 30 * 86400000,
  },
];

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Standard Operating Procedure (SOP) - Agricultural Export Packing',
    content: `1. Moisture check before bagging: Max 7.8% on certified halogen meter.
2. Packaging: 25kg / 50kg Multi-wall paper bags with HDPE inner lining.
3. Silica gel sachets: 2x 500g pouches per pallet corner to prevent sea sweat.
4. Fumigation: Phosphine gas tablet treatment with minimum 72 hours gas retention period.
5. Container inspection: Odourless, light-tight, dry floor, certified floor paper lining.`,
    category: 'Operations',
    businessId: 'biz-1',
    personId: 'per-2',
    isPinned: true,
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'note-2',
    title: 'Zenith Tech SaaS Pricing Architecture 2026-27',
    content: `Tier 1 (Starter MSME): ₹2,499/mo up to 3 users, single GSTIN.
Tier 2 (Growth Enterprise): ₹7,999/mo up to 15 users, 5 GSTIN branches, automated bank feed.
Tier 3 (Export & Multi-Entity): ₹19,999/mo unlimited entities, custom ERP hooks, priority 24/7 SLA.
Add-ons: WhatsApp API connector at ₹0.35 per marketing message, ₹0.15 per utility OTP.`,
    category: 'Strategy & Pricing',
    businessId: 'biz-2',
    personId: 'per-1',
    isPinned: true,
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  },
];

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'DGFT Import Export Code (IEC) Certificate',
    fileName: 'IEC_Certificate_0308012345.pdf',
    fileType: 'application/pdf',
    fileSize: 245000,
    fileDataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCg==', // lightweight valid PDF header
    description: 'Government of India Directorate General of Foreign Trade official IEC allotment letter.',
    uploadDate: '2026-01-10',
    businessId: 'biz-1',
    category: 'Legal & Registration',
    expiryDate: '2029-12-31',
    reminder: true,
    notes: 'Permanent IEC document for all customs declarations.',
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'doc-2',
    title: 'GST Registration Certificate (Form REG-06)',
    fileName: 'GST_Certificate_24AAACA1234E1Z8.pdf',
    fileType: 'application/pdf',
    fileSize: 312000,
    fileDataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCg==',
    description: 'Central Goods and Services Tax 3-page registration certificate including Annexure A & B.',
    uploadDate: '2026-02-14',
    businessId: 'biz-1',
    category: 'Tax & Financial',
    expiryDate: '',
    reminder: false,
    notes: 'Required for bank account opening and trade portal verification.',
    createdAt: Date.now() - 50 * 86400000,
  },
];

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-1',
    orderNumber: 'EXP-2026-089',
    orderTitle: '50 MT Cumin Seeds (Jeera Machine Cleaned 99%)',
    customerOrSupplier: 'Al-Mansoor Foodstuff Trading LLC (Dubai)',
    businessId: 'biz-1',
    orderType: 'Sales',
    orderDate: '2026-10-18',
    expectedDeliveryDate: '2026-11-08',
    amount: 18500000, // INR 1.85 Cr ($220,000 USD approx)
    currency: 'INR',
    description: '2x 40ft FCL container shipment to Jebel Ali Port, Dubai under irrevocable 90-day LC.',
    assignedPersonId: 'per-2',
    status: 'Processing',
    notes: 'Container gated in at Mundra Port. Vessel sailing on Thursday.',
    createdAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'ord-2',
    orderNumber: 'PUR-2026-042',
    orderTitle: '60 MT Raw Cumin Grade A Procurement',
    customerOrSupplier: 'M/s Patel Agri Mandi Traders, Unjha',
    businessId: 'biz-3',
    orderType: 'Purchase',
    orderDate: '2026-10-25',
    expectedDeliveryDate: '2026-11-02',
    amount: 16200000,
    currency: 'INR',
    description: 'Raw agricultural produce directly procured through APMC auction for processing & cleaning.',
    assignedPersonId: 'per-4',
    status: 'Confirmed',
    notes: 'Advance 20% transferred via RTGS. Balance on delivery.',
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'ord-3',
    orderNumber: 'SaaS-2026-015',
    orderTitle: 'Enterprise ERP Implementation Contract - Year 1',
    customerOrSupplier: 'Nexus Logistics Hub Ltd',
    businessId: 'biz-2',
    orderType: 'Sales',
    orderDate: '2026-10-10',
    expectedDeliveryDate: '2026-11-15',
    amount: 850000,
    currency: 'INR',
    description: 'Cloud deployment, 25 user licenses, integration with Tally & GST portal.',
    assignedPersonId: 'per-3',
    status: 'Processing',
    notes: 'Milestone 2 payment received.',
    createdAt: Date.now() - 22 * 86400000,
  },
];

const INITIAL_TEMPLATES: BusinessTemplateItem[] = [
  {
    id: 'tmpl-1',
    title: 'Formal Export Commercial Invoice & Packing List Template',
    category: 'Quotation Format',
    content: `COMMERCIAL INVOICE
Exporter: [Company Name & Full Address]
Consignee: [Buyer Name, Address & Country]
Buyer (if other than consignee): [Notify Party]
Country of Origin: INDIA
Country of Final Destination: [Destination Country]
Port of Loading: Mundra / JNPT, India
Port of Discharge: [Discharge Port]

Invoice No. & Date: [INV-XXXX] | Dated: [DD/MM/YYYY]
Buyer's Order No. & Date: [PO-XXXX] | Dated: [DD/MM/YYYY]
Terms of Delivery & Payment: CIF [Port] / Irrevocable LC at Sight

Sr | Description of Goods | HS Code | Qty (MT) | Rate (USD/MT) | Total (USD)
1  | [Item Name]          | [XXXX]  | [XX]     | $[XXXX]       | $[XXXXXX]

Total Amount (in words): US Dollars [Amount in Words] Only.
Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.`,
    tags: ['Export', 'Invoice', 'Customs', 'International'],
    createdAt: Date.now() - 40 * 86400000,
  },
  {
    id: 'tmpl-2',
    title: 'Formal Business Letterhead Format',
    category: 'Business Letter',
    content: `[COMPANY NAME PVT LTD / LLP]
CIN/LLPIN: [Registration Number]
Regd Office: [Complete Address, City, State, PIN]
Tel: [Phone] | Email: [Email] | Web: [Website]
--------------------------------------------------------------------------------
Ref No: [REF/YYYY/XXX]                                      Date: [DD/MM/YYYY]

To,
[Recipient Name / Designation]
[Organization Name]
[Address, City, State]

Subject: [Clear & Concise Subject Line]

Dear Sir / Madam,

With reference to our recent communication regarding [Topic/Matter], we are writing to officially convey that [Details of the letter body].

[Key Points or Proposed Terms]:
1. [Point 1]
2. [Point 2]
3. [Point 3]

We look forward to your valuable cooperation and prompt response in this regard.

Yours faithfully,
For [Company Name],

[Authorized Signatory Name]
[Designation]`,
    tags: ['Formal', 'Letterhead', 'Official', 'Corporate'],
    createdAt: Date.now() - 35 * 86400000,
  },
  {
    id: 'tmpl-3',
    title: 'Standard Payment Follow-up Escalation Letter',
    category: 'Email Format',
    content: `Subject: URGENT: Outstanding Payment Overdue for Invoice #[Invoice Number] - [Company Name]

Dear [Finance Head / Accounts Manager],

This letter serves as a formal follow-up to our previous reminders regarding overdue Invoice #[Invoice Number] amounting to ₹[Amount], which fell due on [Due Date].

As our standard credit policy stipulates payment within [30] days of dispatch, this invoice is now overdue by [XX] days.

To ensure uninterrupted supplies and services for your upcoming requirements, kindly confirm the RTGS/NEFT payment schedule or share the transaction UTR number by return email.

Bank Account for Remittance:
Account Name: [Account Holder]
Account No: [Account Number]
IFSC: [IFSC Code]
Bank & Branch: [Bank Name, Branch]

Thank you for your prompt attention to this matter.

Sincerely,
Accounts Department
[Company Name]`,
    tags: ['Payment', 'Accounts', 'Reminder', 'Finance'],
    createdAt: Date.now() - 30 * 86400000,
  },
];

const INITIAL_SETTINGS: AppSettings = {
  theme: 'dark',
  primaryColor: '#0284c7', // Material 3 deep blue
  isPinEnabled: false,
  isBiometricEnabled: false,
  timeFormat: '12h',
  dateFormat: 'DD/MM/YYYY',
  viewMode: 'android_frame', // default to authentic Android Phone Frame mode
  notificationsEnabled: true,
  lastBackupDate: new Date().toISOString(),
};

class StorageService {
  private state: AppDatabaseState;
  private listeners: Set<() => void> = new Set();
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    this.state = this.loadFromStorage();
    this.initIndexedDB();
  }

  private initIndexedDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.resolve(null);
    }
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_KEY, DB_VERSION);
        request.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('app_data')) {
            db.createObjectStore('app_data', { keyPath: 'key' });
          }
        };
        request.onsuccess = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          // check if we have persisted state in IndexedDB
          const tx = db.transaction('app_data', 'readonly');
          const store = tx.objectStore('app_data');
          const getReq = store.get('root_state');
          getReq.onsuccess = () => {
            if (getReq.result && getReq.result.data) {
              this.state = getReq.result.data;
              this.notify();
            } else {
              // write current initial state to IndexedDB
              this.persistToIndexedDB(this.state);
            }
          };
          resolve(db);
        };
        request.onerror = () => {
          console.warn('IndexedDB open error, falling back to localStorage');
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB unavailable', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  private async persistToIndexedDB(state: AppDatabaseState) {
    try {
      const db = await this.initIndexedDB();
      if (!db) return;
      const tx = db.transaction('app_data', 'readwrite');
      const store = tx.objectStore('app_data');
      store.put({ key: 'root_state', data: state, updatedAt: Date.now() });
    } catch (err) {
      console.warn('Failed to persist to IndexedDB', err);
    }
  }

  private loadFromStorage(): AppDatabaseState {
    if (typeof window === 'undefined') {
      return this.getDefaultState();
    }
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...this.getDefaultState(),
          ...parsed,
        };
      }
    } catch (err) {
      console.error('Failed to read from localStorage', err);
    }
    return this.getDefaultState();
  }

  private getDefaultState(): AppDatabaseState {
    return {
      businesses: INITIAL_BUSINESSES,
      people: INITIAL_PEOPLE,
      directory: INITIAL_DIRECTORY,
      tasks: INITIAL_TASKS,
      timetable: INITIAL_TIMETABLE,
      calls: INITIAL_CALLS,
      meetings: INITIAL_MEETINGS,
      followups: INITIAL_FOLLOWUPS,
      messages: INITIAL_MESSAGES,
      credentials: INITIAL_CREDENTIALS,
      notes: INITIAL_NOTES,
      documents: INITIAL_DOCUMENTS,
      orders: INITIAL_ORDERS,
      templates: INITIAL_TEMPLATES,
      settings: INITIAL_SETTINGS,
    };
  }

  private saveState() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.error('LocalStorage write error (quota exceeded?)', err);
    }
    this.persistToIndexedDB(this.state);
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Listener notify error', err);
      }
    });
  }

  public getState(): AppDatabaseState {
    return this.state;
  }

  // --- BUSINESS OPERATIONS ---
  public saveBusiness(business: Business) {
    const exists = this.state.businesses.findIndex((b) => b.id === business.id);
    if (exists >= 0) {
      this.state.businesses[exists] = { ...business, updatedAt: Date.now() };
    } else {
      this.state.businesses.unshift({ ...business, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.saveState();
  }

  public deleteBusiness(id: string) {
    this.state.businesses = this.state.businesses.filter((b) => b.id !== id);
    // remove associations in people
    this.state.people = this.state.people.map((p) => ({
      ...p,
      businessAssociations: p.businessAssociations.filter((a) => a.businessId !== id),
    }));
    this.saveState();
  }

  // --- PEOPLE OPERATIONS ---
  public savePerson(person: Person) {
    const exists = this.state.people.findIndex((p) => p.id === person.id);
    if (exists >= 0) {
      this.state.people[exists] = { ...person, updatedAt: Date.now() };
    } else {
      this.state.people.unshift({ ...person, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.saveState();
  }

  public deletePerson(id: string) {
    this.state.people = this.state.people.filter((p) => p.id !== id);
    this.saveState();
  }

  // --- DIRECTORY CONTACTS ---
  public saveDirectoryContact(contact: DirectoryContact) {
    const exists = this.state.directory.findIndex((c) => c.id === contact.id);
    if (exists >= 0) {
      this.state.directory[exists] = contact;
    } else {
      this.state.directory.unshift({ ...contact, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteDirectoryContact(id: string) {
    this.state.directory = this.state.directory.filter((c) => c.id !== id);
    this.saveState();
  }

  // --- TASKS ---
  public saveTask(task: TaskItem) {
    const exists = this.state.tasks.findIndex((t) => t.id === task.id);
    if (exists >= 0) {
      this.state.tasks[exists] = task;
    } else {
      this.state.tasks.unshift({ ...task, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteTask(id: string) {
    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
    this.saveState();
  }

  public toggleTaskComplete(id: string) {
    this.state.tasks = this.state.tasks.map((t) => {
      if (t.id === id) {
        const isCompleted = t.status === 'Completed';
        return {
          ...t,
          status: isCompleted ? 'Pending' : 'Completed',
          completedAt: isCompleted ? undefined : Date.now(),
        };
      }
      return t;
    });
    this.saveState();
  }

  // --- TIMETABLE ---
  public saveTimetableActivity(act: TimetableActivity) {
    const exists = this.state.timetable.findIndex((a) => a.id === act.id);
    if (exists >= 0) {
      this.state.timetable[exists] = act;
    } else {
      this.state.timetable.unshift({ ...act, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteTimetableActivity(id: string) {
    this.state.timetable = this.state.timetable.filter((a) => a.id !== id);
    this.saveState();
  }

  // --- CALLS ---
  public saveCall(call: CallRecord) {
    const exists = this.state.calls.findIndex((c) => c.id === call.id);
    if (exists >= 0) {
      this.state.calls[exists] = call;
    } else {
      this.state.calls.unshift({ ...call, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteCall(id: string) {
    this.state.calls = this.state.calls.filter((c) => c.id !== id);
    this.saveState();
  }

  // --- MEETINGS ---
  public saveMeeting(meeting: MeetingItem) {
    const exists = this.state.meetings.findIndex((m) => m.id === meeting.id);
    if (exists >= 0) {
      this.state.meetings[exists] = meeting;
    } else {
      this.state.meetings.unshift({ ...meeting, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteMeeting(id: string) {
    this.state.meetings = this.state.meetings.filter((m) => m.id !== id);
    this.saveState();
  }

  // --- FOLLOW UPS ---
  public saveFollowUp(followUp: FollowUpItem) {
    const exists = this.state.followups.findIndex((f) => f.id === followUp.id);
    if (exists >= 0) {
      this.state.followups[exists] = followUp;
    } else {
      this.state.followups.unshift({ ...followUp, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteFollowUp(id: string) {
    this.state.followups = this.state.followups.filter((f) => f.id !== id);
    this.saveState();
  }

  // --- MESSAGE TEMPLATES ---
  public saveMessageTemplate(tmpl: MessageTemplate) {
    const exists = this.state.messages.findIndex((m) => m.id === tmpl.id);
    if (exists >= 0) {
      this.state.messages[exists] = tmpl;
    } else {
      this.state.messages.unshift({ ...tmpl, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteMessageTemplate(id: string) {
    this.state.messages = this.state.messages.filter((m) => m.id !== id);
    this.saveState();
  }

  // --- CREDENTIALS ---
  public saveCredential(cred: CredentialItem) {
    const exists = this.state.credentials.findIndex((c) => c.id === cred.id);
    if (exists >= 0) {
      this.state.credentials[exists] = cred;
    } else {
      this.state.credentials.unshift({ ...cred, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteCredential(id: string) {
    this.state.credentials = this.state.credentials.filter((c) => c.id !== id);
    this.saveState();
  }

  // --- NOTES ---
  public saveNote(note: NoteItem) {
    const exists = this.state.notes.findIndex((n) => n.id === note.id);
    if (exists >= 0) {
      this.state.notes[exists] = { ...note, updatedAt: Date.now() };
    } else {
      this.state.notes.unshift({ ...note, createdAt: Date.now(), updatedAt: Date.now() });
    }
    this.saveState();
  }

  public deleteNote(id: string) {
    this.state.notes = this.state.notes.filter((n) => n.id !== id);
    this.saveState();
  }

  // --- DOCUMENTS ---
  public saveDocument(doc: DocumentItem) {
    const exists = this.state.documents.findIndex((d) => d.id === doc.id);
    if (exists >= 0) {
      this.state.documents[exists] = doc;
    } else {
      this.state.documents.unshift({ ...doc, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteDocument(id: string) {
    this.state.documents = this.state.documents.filter((d) => d.id !== id);
    this.saveState();
  }

  // --- ORDERS ---
  public saveOrder(order: OrderItem) {
    const exists = this.state.orders.findIndex((o) => o.id === order.id);
    if (exists >= 0) {
      this.state.orders[exists] = order;
    } else {
      this.state.orders.unshift({ ...order, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteOrder(id: string) {
    this.state.orders = this.state.orders.filter((o) => o.id !== id);
    this.saveState();
  }

  // --- BUSINESS TEMPLATES ---
  public saveBusinessTemplate(tmpl: BusinessTemplateItem) {
    const exists = this.state.templates.findIndex((t) => t.id === tmpl.id);
    if (exists >= 0) {
      this.state.templates[exists] = tmpl;
    } else {
      this.state.templates.unshift({ ...tmpl, createdAt: Date.now() });
    }
    this.saveState();
  }

  public deleteBusinessTemplate(id: string) {
    this.state.templates = this.state.templates.filter((t) => t.id !== id);
    this.saveState();
  }

  // --- SETTINGS ---
  public updateSettings(partial: Partial<AppSettings>) {
    this.state.settings = { ...this.state.settings, ...partial };
    this.saveState();
  }

  // --- BACKUP & RESTORE ---
  public exportBackupJSON(): string {
    const backupPayload = {
      app: 'My Personal Business Assistant',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      timestamp: Date.now(),
      data: this.state,
    };
    return JSON.stringify(backupPayload, null, 2);
  }

  public importBackupJSON(jsonStr: string): { success: boolean; message: string; stats?: Record<string, number> } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !parsed.data) {
        return { success: false, message: 'Invalid backup file format: missing data payload.' };
      }
      const data = parsed.data as AppDatabaseState;
      if (!Array.isArray(data.businesses) || !Array.isArray(data.people)) {
        return { success: false, message: 'Corrupted backup file: businesses or people arrays missing.' };
      }

      this.state = {
        businesses: data.businesses || [],
        people: data.people || [],
        directory: data.directory || [],
        tasks: data.tasks || [],
        timetable: data.timetable || [],
        calls: data.calls || [],
        meetings: data.meetings || [],
        followups: data.followups || [],
        messages: data.messages || [],
        credentials: data.credentials || [],
        notes: data.notes || [],
        documents: data.documents || [],
        orders: data.orders || [],
        templates: data.templates || [],
        settings: { ...INITIAL_SETTINGS, ...(data.settings || {}) },
      };

      this.state.settings.lastBackupDate = new Date().toISOString();
      this.saveState();

      return {
        success: true,
        message: 'Backup successfully restored!',
        stats: {
          businesses: this.state.businesses.length,
          people: this.state.people.length,
          directory: this.state.directory.length,
          tasks: this.state.tasks.length,
          timetable: this.state.timetable.length,
          calls: this.state.calls.length,
          meetings: this.state.meetings.length,
          followups: this.state.followups.length,
          credentials: this.state.credentials.length,
          documents: this.state.documents.length,
          orders: this.state.orders.length,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Failed to parse backup JSON: ${msg}` };
    }
  }

  public resetToDefault() {
    this.state = this.getDefaultState();
    this.saveState();
  }
}

export const storageService = new StorageService();
