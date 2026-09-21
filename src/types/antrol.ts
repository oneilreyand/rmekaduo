export interface BpjsAntrolBookingRequest {
  nomorkartu: string;
  nik: string;
  notelp: string;
  kodepoli: string;
  namapoli: string;
  kodedokter: string;
  namadokter: string;
  tanggalperiksa: string; // YYYY-MM-DD
  jampraktek: string;     // e.g. "08:00-12:00"
  jeniskunjungan: number; // 1: Rujukan FKTP, 2: Rujukan Internal, 3: Kontrol, 4: Rujukan Antar Faskes
  nomorreferensi?: string;
}

export interface BpjsAntrolBookingResponseData {
  nomorantrean: string;
  angkaantrean: number;
  kodebooking: string;
  norm: string;
  namapoli: string;
  namadokter: string;
  estimasidilayani: number; // epoch ms
  sisakuotajkn: number;
  kuotajkn: number;
  sisakuotanonjkn: number;
  kuotanonjkn: number;
  keterangan: string;
}

export interface BpjsAntrolBookingResponse {
  response: BpjsAntrolBookingResponseData;
  metadata: {
    code: number;
    message: string;
  };
}

export type CheckInMethod = 'GEOLOCATION_MJKN' | 'KIOSK_QR_SCAN' | 'MANUAL_ADMISION';

export interface DoctorQuotaConfig {
  totalQuota: number;
  jknPercentage: number; // default 60%
  nonJknPercentage: number; // default 40%
  allocatedJkn: number; // 18
  allocatedNonJkn: number; // 12
  usedJkn: number;
  usedNonJkn: number;
  remainingJkn: number;
  remainingNonJkn: number;
  autoReleaseThresholdHours: number; // e.g. 2 hours before session
  isAutoReleased: boolean;
}

export interface HybridCheckInRequest {
  bookingCode: string;
  method: CheckInMethod;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number; // e.g. 240 m (< 1000m is valid)
  kioskId?: string;
  waktu?: number;
}

export interface BpjsAntrolCheckInRequest {
  kodebooking: string;
  waktu: number; // epoch ms
}

export interface BpjsAntrolCancelRequest {
  kodebooking: string;
  keterangan: string;
}

export interface SyncStatus4Way {
  mjkn: {
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    bookingCode: string;
    queueNumber: string;
    estimatedServiceTime: string;
  };
  rme: {
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    mrn: string;
    patientId: string;
    patientName: string;
    isNewPatient: boolean;
  };
  antrol: {
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    taskId: number;
    quotaRemaining: number;
    message: string;
  };
  satusehat: {
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    ihsNumber: string;
    fhirEncounterId: string;
    fhirStatus: 'planned' | 'arrived' | 'in-progress' | 'finished';
  };
}
