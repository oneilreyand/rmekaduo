'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Patient, Encounter, VitalSigns, SoapNote, PrescriptionItem, BillingInfo } from '@/types/rme';

export interface RegisterPatientPayload {
  name: string;
  nik: string;
  birthDate?: string;
  age: number;
  gender: 'L' | 'P';
  mrn?: string;
  phone?: string;
  paymentType: 'BPJS' | 'UMUM';
  bpjsNumber?: string;
  bloodType?: string;
  allergySubstance?: string;
  allergySeverity?: 'RINGAN' | 'SEDANG' | 'BERAT';
  allergyReaction?: string;
  fallRisk?: 'RENDAH' | 'SEDANG' | 'TINGGI';
  poliCode: string;
  poliName: string;
  doctorId: string;
  doctorName: string;
}

interface PatientJourneyContextValue {
  encounters: Encounter[];
  activeConsultationId: string | null;
  activeTriageId: string | null;
  registerPatient: (payload: RegisterPatientPayload) => Encounter;
  checkInPatient: (encounterId: string) => void;
  callToTriage: (encounterId: string) => void;
  saveTriage: (
    encounterId: string,
    vitals: VitalSigns,
    fallRisk?: 'RENDAH' | 'SEDANG' | 'TINGGI',
    triageNotes?: string
  ) => void;
  callToDoctor: (encounterId: string) => void;
  completeConsultation: (
    encounterId: string,
    soap: SoapNote,
    prescriptions: PrescriptionItem[]
  ) => void;
  dispenseMedication: (encounterId: string) => void;
  finalizeBilling: (encounterId: string) => void;
  setActiveConsultationId: (id: string | null) => void;
  setActiveTriageId: (id: string | null) => void;
}

const initialMockEncounters: Encounter[] = [
  {
    id: 'enc-001',
    patientId: 'pat-001',
    patient: {
      id: 'pat-001',
      name: 'Bpk. Hendra Gunawan',
      age: 45,
      gender: 'L',
      mrn: 'RM-DEMO-01',
      nik: 'ID-DEMO-01',
      bpjsStatus: 'AKTIF',
      bpjsNumber: '0001234567891',
      bloodType: 'O+',
      allergies: [
        {
          substance: 'Amoksisilin',
          severity: 'BERAT',
          reaction: 'Ruam eritema difus & edema glotis',
        },
      ],
      fallRisk: 'SEDANG',
      ihsNumber: 'IHS-DEMO-01',
    },
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
    triageCompletedAt: '08:15',
    consultationStartedAt: '08:25',
  },
  {
    id: 'enc-002',
    patientId: 'pat-002',
    patient: {
      id: 'pat-002',
      name: 'Ibu Ratna Dewi',
      age: 34,
      gender: 'P',
      mrn: 'RM-DEMO-02',
      nik: 'ID-DEMO-02',
      bpjsStatus: 'AKTIF',
      bpjsNumber: '0001234567892',
      bloodType: 'B+',
      allergies: [],
      fallRisk: 'RENDAH',
      ihsNumber: 'IHS-DEMO-02',
    },
    doctorId: 'doc-01',
    doctorName: 'dr. Siti Rahmawati, Sp.PD',
    poliCode: 'POLI_UMUM',
    poliName: 'Poli Umum',
    queueNumber: 'A-02',
    status: 'IN_QUEUE',
    bookingSource: 'ON_SITE',
    checkInStatus: 'CHECKED_IN',
    checkInMethod: 'KIOSK_QR_SCAN',
    bpjsTaskId: 3,
    satusehatStatus: 'arrived',
    vitals: {
      systolic: 110,
      diastolic: 75,
      heartRate: 78,
      respiratoryRate: 16,
      temperature: 36.5,
      spo2: 99,
      weightKg: 54.0,
      heightCm: 158.0,
      painScale: 0,
    },
    triageNotes: 'Kontrol rutin gastritis, tidak ada keluhan akut.',
    nurseName: 'Ns. Maya Anjani, S.Kep',
    triageCompletedAt: '08:30',
  },
  {
    id: 'enc-003',
    patientId: 'pat-003',
    patient: {
      id: 'pat-003',
      name: 'Sdr. Bagus Pratama',
      age: 26,
      gender: 'L',
      mrn: 'RM-DEMO-03',
      nik: 'ID-DEMO-03',
      bpjsStatus: 'AKTIF',
      bpjsNumber: '0001234567893',
      bloodType: 'A+',
      allergies: [],
      fallRisk: 'RENDAH',
      ihsNumber: 'IHS-DEMO-03',
    },
    doctorId: 'doc-02',
    doctorName: 'drg. Ahmad Fauzi',
    poliCode: 'POLI_GIGI',
    poliName: 'Poli Gigi & Mulut',
    queueNumber: 'B-01',
    status: 'IN_CONSULTATION',
    bookingSource: 'MOBILE_JKN',
    bookingCode: 'MJKN-2026-002',
    checkInStatus: 'CHECKED_IN',
    bpjsTaskId: 4,
    satusehatStatus: 'in-progress',
    consultationStartedAt: '08:35',
  },
  {
    id: 'enc-004',
    patientId: 'pat-004',
    patient: {
      id: 'pat-004',
      name: 'Ibu Siti Nurhaliza',
      age: 41,
      gender: 'P',
      mrn: 'RM-DEMO-04',
      nik: 'ID-DEMO-04',
      bpjsStatus: 'AKTIF',
      bpjsNumber: '0001234567894',
      bloodType: 'O+',
      allergies: [],
      fallRisk: 'RENDAH',
      ihsNumber: 'IHS-DEMO-04',
    },
    doctorId: 'doc-02',
    doctorName: 'drg. Ahmad Fauzi',
    poliCode: 'POLI_GIGI',
    poliName: 'Poli Gigi & Mulut',
    queueNumber: 'B-02',
    status: 'IN_QUEUE',
    bookingSource: 'ON_SITE',
    checkInStatus: 'CHECKED_IN',
    checkInMethod: 'KIOSK_QR_SCAN',
    bpjsTaskId: 3,
    satusehatStatus: 'arrived',
  },
  {
    id: 'enc-005',
    patientId: 'pat-005',
    patient: {
      id: 'pat-005',
      name: 'An. Dimas Saputra',
      age: 6,
      gender: 'L',
      mrn: 'RM-DEMO-05',
      nik: 'ID-DEMO-05',
      bpjsStatus: 'AKTIF',
      bpjsNumber: '0001234567895',
      bloodType: 'B+',
      allergies: [],
      fallRisk: 'RENDAH',
      ihsNumber: 'IHS-DEMO-05',
    },
    doctorId: 'doc-03',
    doctorName: 'dr. Rina Astuti, Sp.A',
    poliCode: 'POLI_KIA',
    poliName: 'Poli KIA & Anak',
    queueNumber: 'C-01',
    status: 'IN_CONSULTATION',
    bookingSource: 'MOBILE_JKN',
    bookingCode: 'MJKN-2026-003',
    checkInStatus: 'CHECKED_IN',
    bpjsTaskId: 4,
    satusehatStatus: 'in-progress',
    consultationStartedAt: '08:40',
  },
  {
    id: 'enc-006',
    patientId: 'pat-006',
    patient: {
      id: 'pat-006',
      name: 'Bpk. Ahmad Sujatmiko',
      age: 58,
      gender: 'L',
      mrn: 'RM-DEMO-06',
      nik: 'ID-DEMO-06',
      bpjsStatus: 'AKTIF',
      bpjsNumber: '0001234567896',
      bloodType: 'AB+',
      allergies: [],
      fallRisk: 'SEDANG',
      ihsNumber: 'IHS-DEMO-06',
    },
    doctorId: 'doc-01',
    doctorName: 'dr. Siti Rahmawati, Sp.PD',
    poliCode: 'POLI_UMUM',
    poliName: 'Poli Umum',
    queueNumber: 'F-01',
    status: 'PHARMACY_QUEUE',
    bookingSource: 'ON_SITE',
    checkInStatus: 'CHECKED_IN',
    checkInMethod: 'MANUAL_ADMISION',
    bpjsTaskId: 5,
    satusehatStatus: 'in-progress',
    vitals: {
      systolic: 140,
      diastolic: 90,
      heartRate: 84,
      respiratoryRate: 18,
      temperature: 36.6,
      spo2: 98,
      weightKg: 72.0,
      heightCm: 168.0,
      painScale: 1,
    },
    soap: {
      subjective: 'Kontrol hipertensi, sakit kepala tengkuk kadang terasa berat.',
      objective: 'TD 140/90 mmHg, Nadi 84 x/m, Cor/Pulmo dalam batas normal.',
      assessment: 'I10 - Essential (primary) hypertension',
      plan: 'Lanjutkan Amlodipine 1x5mg, diet rendah garam, olahraga ringan.',
      icd10Code: 'I10',
      icd10Name: 'Essential (primary) hypertension',
    },
    prescriptions: [
      {
        id: 'rx-01',
        kfaCode: '93000122',
        name: 'Amlodipine 5 mg Tablet',
        dosage: '1 x 1 tablet malam',
        signa: 'sesudah makan malam',
        quantity: 30,
        unit: 'Tablet',
      },
    ],
    consultationStartedAt: '08:00',
    consultationCompletedAt: '08:18',
  },
  {
    id: 'enc-007',
    patientId: 'pat-007',
    patient: {
      id: 'pat-007',
      name: 'Ibu Kartini Susilowati',
      age: 39,
      gender: 'P',
      mrn: 'RM-DEMO-07',
      nik: 'ID-DEMO-07',
      bpjsStatus: 'AKTIF',
      bpjsNumber: '0001234567897',
      bloodType: 'O+',
      allergies: [],
      fallRisk: 'RENDAH',
      ihsNumber: 'IHS-DEMO-07',
    },
    doctorId: 'doc-01',
    doctorName: 'Petugas Pendaftaran',
    poliCode: 'ADMISI',
    poliName: 'Loket Pendaftaran & BPJS',
    queueNumber: 'R-01',
    status: 'BOOKED',
    bookingSource: 'MOBILE_JKN',
    bookingCode: 'MJKN-2026-004',
    checkInStatus: 'NOT_CHECKED_IN',
    bpjsTaskId: 1,
    satusehatStatus: 'planned',
  },
];

const PatientJourneyContext = createContext<PatientJourneyContextValue | undefined>(undefined);

export function PatientJourneyProvider({ children }: { children: React.ReactNode }) {
  const [encounters, setEncounters] = useState<Encounter[]>(initialMockEncounters);
  const [activeConsultationId, setActiveConsultationId] = useState<string | null>('enc-001');
  const [activeTriageId, setActiveTriageId] = useState<string | null>(null);

  const registerPatient = (payload: RegisterPatientPayload): Encounter => {
    const queueIndex = encounters.length + 1;
    const prefix = payload.poliCode === 'POLI_GIGI' ? 'B' : payload.poliCode === 'POLI_KIA' ? 'C' : 'A';
    const queueNumber = `${prefix}-${String(queueIndex).padStart(2, '0')}`;
    const patientId = `pat-${Date.now()}`;
    const encounterId = `enc-${Date.now()}`;
    const mrn = payload.mrn || `RM-DEMO-${String(queueIndex).padStart(2, '0')}`;

    const newPatient: Patient = {
      id: patientId,
      name: payload.name,
      age: payload.age,
      gender: payload.gender,
      mrn,
      nik: payload.nik,
      bpjsStatus: payload.paymentType === 'BPJS' ? 'AKTIF' : 'NONAKTIF',
      bpjsNumber: payload.bpjsNumber || '',
      bloodType: payload.bloodType || 'O+',
      allergies: payload.allergySubstance
        ? [
            {
              substance: payload.allergySubstance,
              severity: payload.allergySeverity || 'SEDANG',
              reaction: payload.allergyReaction || 'Reaksi hipersensitivitas',
            },
          ]
        : [],
      fallRisk: payload.fallRisk || 'RENDAH',
      ihsNumber: `IHS-DEMO-${String(queueIndex).padStart(2, '0')}`,
    };

    const newEncounter: Encounter = {
      id: encounterId,
      patientId,
      patient: newPatient,
      doctorId: payload.doctorId,
      doctorName: payload.doctorName,
      poliCode: payload.poliCode,
      poliName: payload.poliName,
      queueNumber,
      status: 'IN_QUEUE',
      bookingSource: 'ON_SITE',
      bookingCode: `LOC-${Date.now().toString().slice(-6)}`,
      checkInStatus: 'CHECKED_IN',
      checkInMethod: 'MANUAL_ADMISION',
      bpjsTaskId: 3,
      satusehatStatus: 'arrived',
      billing: {
        consultationFee: payload.paymentType === 'BPJS' ? 0 : 50000,
        medicationFee: 0,
        procedureFee: 0,
        total: payload.paymentType === 'BPJS' ? 0 : 50000,
        paymentMethod: payload.paymentType,
        isPaid: false,
        sepNumber: payload.paymentType === 'BPJS' ? `SEP-DEMO-${String(queueIndex).padStart(2, '0')}` : undefined,
      },
    };

    setEncounters((prev) => [newEncounter, ...prev]);
    return newEncounter;
  };

  const checkInPatient = (encounterId: string) => {
    setEncounters((prev) =>
      prev.map((enc) =>
        enc.id === encounterId
          ? {
              ...enc,
              status: 'IN_QUEUE',
              checkInStatus: 'CHECKED_IN',
              checkInMethod: 'KIOSK_QR_SCAN',
              bpjsTaskId: 3,
              satusehatStatus: 'arrived',
            }
          : enc
      )
    );
  };

  const callToTriage = (encounterId: string) => {
    setActiveTriageId(encounterId);
  };

  const saveTriage = (
    encounterId: string,
    vitals: VitalSigns,
    fallRisk?: 'RENDAH' | 'SEDANG' | 'TINGGI',
    triageNotes?: string
  ) => {
    setEncounters((prev) =>
      prev.map((enc) => {
        if (enc.id !== encounterId) return enc;
        const updatedPatient = enc.patient
          ? { ...enc.patient, fallRisk: fallRisk || enc.patient.fallRisk }
          : undefined;
        return {
          ...enc,
          patient: updatedPatient,
          vitals,
          triageNotes: triageNotes || enc.triageNotes,
          nurseName: 'Ns. Maya Anjani, S.Kep',
          triageCompletedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );
    if (activeTriageId === encounterId) {
      setActiveTriageId(null);
    }
  };

  const callToDoctor = (encounterId: string) => {
    setEncounters((prev) =>
      prev.map((enc) =>
        enc.id === encounterId
          ? {
              ...enc,
              status: 'IN_CONSULTATION',
              bpjsTaskId: 4,
              satusehatStatus: 'in-progress',
              consultationStartedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            }
          : enc
      )
    );
    setActiveConsultationId(encounterId);
  };

  const completeConsultation = (
    encounterId: string,
    soap: SoapNote,
    prescriptions: PrescriptionItem[]
  ) => {
    setEncounters((prev) =>
      prev.map((enc) => {
        if (enc.id !== encounterId) return enc;
        const medFee = enc.billing?.paymentMethod === 'BPJS' ? 0 : prescriptions.length * 25000;
        const currentConsult = enc.billing?.consultationFee || 0;
        return {
          ...enc,
          status: 'PHARMACY_QUEUE',
          bpjsTaskId: 5,
          soap,
          prescriptions,
          consultationCompletedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          billing: {
            consultationFee: currentConsult,
            medicationFee: medFee,
            procedureFee: 0,
            total: currentConsult + medFee,
            paymentMethod: enc.billing?.paymentMethod || 'BPJS',
            isPaid: false,
            sepNumber: enc.billing?.sepNumber,
          },
        };
      })
    );
  };

  const dispenseMedication = (encounterId: string) => {
    setEncounters((prev) =>
      prev.map((enc) =>
        enc.id === encounterId
          ? {
              ...enc,
              bpjsTaskId: 6,
              dispensedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            }
          : enc
      )
    );
  };

  const finalizeBilling = (encounterId: string) => {
    setEncounters((prev) =>
      prev.map((enc) =>
        enc.id === encounterId
          ? {
              ...enc,
              status: 'COMPLETED',
              bpjsTaskId: 7,
              satusehatStatus: 'finished',
              completedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              billing: enc.billing
                ? {
                    ...enc.billing,
                    isPaid: true,
                    paidAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                  }
                : undefined,
            }
          : enc
      )
    );
  };

  return (
    <PatientJourneyContext.Provider
      value={{
        encounters,
        activeConsultationId,
        activeTriageId,
        registerPatient,
        checkInPatient,
        callToTriage,
        saveTriage,
        callToDoctor,
        completeConsultation,
        dispenseMedication,
        finalizeBilling,
        setActiveConsultationId,
        setActiveTriageId,
      }}
    >
      {children}
    </PatientJourneyContext.Provider>
  );
}

export function usePatientJourney() {
  const context = useContext(PatientJourneyContext);
  if (!context) {
    throw new Error('usePatientJourney must be used within a PatientJourneyProvider');
  }
  return context;
}
