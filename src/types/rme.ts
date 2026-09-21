export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'L' | 'P';
  mrn: string;
  nik: string;
  bpjsStatus: 'AKTIF' | 'NONAKTIF' | 'PENANGGUHAN';
  bpjsNumber: string;
  bloodType: string;
  allergies: Array<{
    substance: string;
    severity: 'RINGAN' | 'SEDANG' | 'BERAT';
    reaction: string;
  }>;
  fallRisk: 'RENDAH' | 'SEDANG' | 'TINGGI';
  avatarUrl?: string;
  isRegisteredViaMjkn?: boolean;
  ihsNumber?: string;
}

export type BookingSource = 'MOBILE_JKN' | 'ON_SITE' | 'RUJUKAN';
export type CheckInStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'EXPIRED';
export type CheckInMethod = 'GEOLOCATION_MJKN' | 'KIOSK_QR_SCAN' | 'MANUAL_ADMISION';
export type SatusehatEncounterStatus = 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';

export interface Encounter {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  poliCode: string;
  poliName: string;
  queueNumber: string;
  status: 'BOOKED' | 'ARRIVED' | 'IN_QUEUE' | 'IN_CONSULTATION' | 'PHARMACY_QUEUE' | 'COMPLETED' | 'CANCELLED';
  bookingSource: BookingSource;
  bookingCode?: string;
  estimatedServiceTime?: number;
  checkInStatus?: CheckInStatus;
  checkInMethod?: CheckInMethod;
  checkinTime?: string;
  bpjsTaskId: number;
  satusehatStatus: SatusehatEncounterStatus;
  fhirEncounterId?: string;
}

export interface VitalSigns {
  systolic: number;
  diastolic: number;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  spo2: number;
  weightKg: number;
  heightCm: number;
  painScale: number; // 0-10
}

export interface PrescriptionItem {
  id: string;
  kfaCode: string;
  name: string;
  dosage: string;
  signa: string;
  quantity: number;
  unit: string;
  isRacikan?: boolean;
}

export interface PastVisit {
  date: string;
  diagnosis: string;
  doctor: string;
  medications: string[];
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10Code: string;
  icd10Name: string;
  icd9Code?: string;
  icd9Name?: string;
}
