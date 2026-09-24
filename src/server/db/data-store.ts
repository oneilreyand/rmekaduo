import type { Patient, Encounter } from '@/types/rme';

export interface MasterIcd10Item {
  code: string;
  nameId: string;
  nameEn: string;
}

export interface MasterKfaItem {
  kfaCode: string;
  name: string;
  activeSubstance: string;
  form: string;
  defaultSigna: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT';
  entityName: string;
  entityId: string;
  details?: string;
  timestamp: string;
}

// In-Memory Global Singleton Database Store
class ServerDataStore {
  private static instance: ServerDataStore;

  public patients: Patient[] = [];
  public encounters: Encounter[] = [];
  public masterIcd10: MasterIcd10Item[] = [];
  public masterKfa: MasterKfaItem[] = [];
  public auditLogs: AuditLogEntry[] = [];

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): ServerDataStore {
    if (!ServerDataStore.instance) {
      ServerDataStore.instance = new ServerDataStore();
    }
    return ServerDataStore.instance;
  }

  private seedInitialData() {
    this.patients = [
      {
        id: 'pat-001',
        name: 'Tn. Budi Santoso',
        age: 45,
        gender: 'L',
        mrn: '00-12-89',
        nik: '3171012304790002',
        bpjsStatus: 'AKTIF',
        bpjsNumber: '0001234567890',
        bloodType: 'O+',
        allergies: [
          {
            substance: 'Amoksisilin',
            severity: 'BERAT',
            reaction: 'Anafilaksis & Urtikaria Akut',
          },
        ],
        fallRisk: 'SEDANG',
        ihsNumber: 'P01234567890',
      },
      {
        id: 'pat-002',
        name: 'Bpk. Hendra Gunawan',
        age: 47,
        gender: 'L',
        mrn: '00-12-90',
        nik: '3171012304790001',
        bpjsStatus: 'AKTIF',
        bpjsNumber: '0001234567891',
        bloodType: 'O+',
        allergies: [
          {
            substance: 'Penisilin',
            severity: 'BERAT',
            reaction: 'Ruam eritema difus & edema glotis',
          },
        ],
        fallRisk: 'RENDAH',
        ihsNumber: 'P01234567891',
      },
      {
        id: 'pat-003',
        name: 'Ny. Siti Nurhaliza',
        age: 32,
        gender: 'P',
        mrn: '00-13-45',
        nik: '3171019909990001',
        bpjsStatus: 'AKTIF',
        bpjsNumber: '0009876543210',
        bloodType: 'B+',
        allergies: [],
        fallRisk: 'RENDAH',
        ihsNumber: 'P09988776655',
      },
    ];

    this.encounters = [
      {
        id: 'enc-101',
        patientId: 'pat-001',
        patient: this.patients[0],
        doctorId: 'doc-01',
        doctorName: 'dr. Siti Rahmawati, Sp.PD',
        poliCode: 'POLI_UMUM',
        poliName: 'Poli Umum',
        queueNumber: 'A-01',
        status: 'IN_CONSULTATION',
        bookingSource: 'MOBILE_JKN',
        bookingCode: 'MJKN-2026-001',
        checkInStatus: 'CHECKED_IN',
        checkInMethod: 'GEOLOCATION_MJKN',
        bpjsTaskId: 4,
        satusehatStatus: 'in-progress',
        fhirEncounterId: 'c4d5e6f7-1234-5678-90ab-cdef12345678',
        vitals: {
          systolic: 120,
          diastolic: 80,
          heartRate: 82,
          respiratoryRate: 18,
          temperature: 36.8,
          spo2: 98,
          weightKg: 68.0,
          heightCm: 170.0,
          painScale: 2,
        },
        triageNotes: 'Keluhan batuk berdahak 3 hari, demam ringan sumeng.',
        nurseName: 'Ns. Maya Anjani, S.Kep',
        soap: {
          subjective: 'Batuk berdahak sejak 3 hari yang lalu, tenggorokan terasa kering.',
          objective: 'Keadaan umum sedang, compos mentis. Faring hiperemis (+), pembesaran tonsil T1/T1.',
          assessment: 'J06.9 - Infeksi Saluran Pernapasan Atas Akut (ISPA)',
          plan: 'Paracetamol 500mg 3x1 tablet, Cetirizine 10mg 1x1 tablet malam, istirahat cukup.',
          icd10Code: 'J06.9',
          icd10Name: 'Infeksi Saluran Pernapasan Atas Akut (ISPA)',
        },
        prescriptions: [
          {
            id: 'rx-01',
            kfaCode: '93001019',
            name: 'Paracetamol 500 mg Tablet',
            dosage: '3 x 1 tablet sehari',
            signa: 'sesudah makan (bila demam/nyeri)',
            quantity: 10,
            unit: 'Tablet',
          },
        ],
        billing: {
          consultationFee: 0,
          medicationFee: 0,
          procedureFee: 0,
          total: 0,
          paymentMethod: 'BPJS',
          isPaid: true,
          sepNumber: '0123R0010926V000001',
        },
      },
      {
        id: 'enc-102',
        patientId: 'pat-002',
        patient: this.patients[1],
        doctorId: 'doc-01',
        doctorName: 'dr. Siti Rahmawati, Sp.PD',
        poliCode: 'POLI_UMUM',
        poliName: 'Poli Umum',
        queueNumber: 'A-02',
        status: 'IN_QUEUE',
        bookingSource: 'ON_SITE',
        bpjsTaskId: 3,
        satusehatStatus: 'arrived',
        vitals: {
          systolic: 130,
          diastolic: 85,
          heartRate: 78,
          respiratoryRate: 16,
          temperature: 36.5,
          spo2: 99,
          weightKg: 72.0,
          heightCm: 168.0,
          painScale: 1,
        },
        nurseName: 'Ns. Maya Anjani, S.Kep',
      },
    ];

    this.masterIcd10 = [
      {
        code: 'J06.9',
        nameId: 'Infeksi Saluran Pernapasan Atas Akut (ISPA)',
        nameEn: 'Acute upper respiratory infection, unspecified',
      },
      {
        code: 'J00',
        nameId: 'Nasofaringitis Akut (Common Cold)',
        nameEn: 'Acute nasopharyngitis [common cold]',
      },
      {
        code: 'I10',
        nameId: 'Hipertensi Esensial (Primer)',
        nameEn: 'Essential (primary) hypertension',
      },
      {
        code: 'E11.9',
        nameId: 'Diabetes Melitus Tipe 2 Tanpa Komplikasi',
        nameEn: 'Type 2 diabetes mellitus without complications',
      },
      {
        code: 'K30',
        nameId: 'Dispepsia / Sakit Maag',
        nameEn: 'Dyspepsia',
      },
      {
        code: 'A09',
        nameId: 'Gastroenteritis dan Kolitis Infeksius (Diare Akut)',
        nameEn: 'Infectious gastroenteritis and colitis, unspecified',
      },
      {
        code: 'J02.9',
        nameId: 'Faringitis Akut',
        nameEn: 'Acute pharyngitis, unspecified',
      },
    ];

    this.masterKfa = [
      {
        kfaCode: '93001019',
        name: 'Paracetamol 500 mg Tablet',
        activeSubstance: 'Paracetamol',
        form: 'Tablet',
        defaultSigna: '3 x 1 tablet sesudah makan (bila demam/nyeri)',
      },
      {
        kfaCode: '93000841',
        name: 'Cetirizine 10 mg Tablet',
        activeSubstance: 'Cetirizine HCl',
        form: 'Tablet',
        defaultSigna: '1 x 1 tablet malam hari',
      },
      {
        kfaCode: '93000120',
        name: 'Amoxicillin 500 mg Kapsul',
        activeSubstance: 'Amoxicillin',
        form: 'Kapsul',
        defaultSigna: '3 x 1 kapsul per 8 jam (habiskan)',
      },
      {
        kfaCode: '93000511',
        name: 'Amlodipine 5 mg Tablet',
        activeSubstance: 'Amlodipine Besylate',
        form: 'Tablet',
        defaultSigna: '1 x 1 tablet pagi hari sesudah makan',
      },
      {
        kfaCode: '93000622',
        name: 'Metformin HCl 500 mg Tablet',
        activeSubstance: 'Metformin Hydrochloride',
        form: 'Tablet',
        defaultSigna: '2 x 1 tablet bersama / sesudah makan',
      },
      {
        kfaCode: '93000733',
        name: 'Omeprazole 20 mg Kapsul',
        activeSubstance: 'Omeprazole',
        form: 'Kapsul',
        defaultSigna: '1 x 1 kapsul 30 menit sebelum makan pagi',
      },
    ];
  }
}

export const dbStore = ServerDataStore.getInstance();
