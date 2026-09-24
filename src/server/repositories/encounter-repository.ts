import { dbStore } from '@/server/db/data-store';
import type { Encounter, VitalSigns, SoapNote, PrescriptionItem } from '@/types/rme';
import { PatientRepository } from './patient-repository';

export class EncounterRepository {
  static findById(id: string): Encounter | null {
    const enc = dbStore.encounters.find((e) => e.id === id);
    if (!enc) return null;
    if (!enc.patient) {
      enc.patient = PatientRepository.findById(enc.patientId) || undefined;
    }
    return enc;
  }

  static list(filter?: { poliCode?: string; status?: string }): Encounter[] {
    return dbStore.encounters.filter((e) => {
      if (filter?.poliCode && e.poliCode !== filter.poliCode) return false;
      if (filter?.status && e.status !== filter.status) return false;
      return true;
    });
  }

  static create(payload: {
    patientId: string;
    poliCode: string;
    poliName: string;
    doctorId: string;
    doctorName: string;
    paymentType: 'BPJS' | 'UMUM';
    bookingSource?: 'MOBILE_JKN' | 'ON_SITE' | 'RUJUKAN';
    bookingCode?: string;
  }): Encounter {
    const patient = PatientRepository.findById(payload.patientId);
    const queueIndex = dbStore.encounters.length + 1;
    const prefix = payload.poliCode === 'POLI_GIGI' ? 'G' : 'A';
    const queueNumber = `${prefix}-${String(queueIndex).padStart(2, '0')}`;
    const newId = `enc-${String(queueIndex + 100)}`;

    const newEncounter: Encounter = {
      id: newId,
      patientId: payload.patientId,
      patient: patient || undefined,
      doctorId: payload.doctorId,
      doctorName: payload.doctorName,
      poliCode: payload.poliCode,
      poliName: payload.poliName,
      queueNumber,
      status: payload.bookingSource === 'MOBILE_JKN' ? 'BOOKED' : 'IN_QUEUE',
      bookingSource: payload.bookingSource || 'ON_SITE',
      bookingCode: payload.bookingCode,
      bpjsTaskId: payload.bookingSource === 'MOBILE_JKN' ? 1 : 2,
      satusehatStatus: payload.bookingSource === 'MOBILE_JKN' ? 'planned' : 'arrived',
      billing: {
        consultationFee: payload.paymentType === 'BPJS' ? 0 : 50000,
        medicationFee: 0,
        procedureFee: 0,
        total: payload.paymentType === 'BPJS' ? 0 : 50000,
        paymentMethod: payload.paymentType,
        isPaid: payload.paymentType === 'BPJS',
        sepNumber:
          payload.paymentType === 'BPJS'
            ? `0123R001${new Date().toISOString().slice(2, 7).replace('-', '')}V${String(queueIndex).padStart(6, '0')}`
            : undefined,
      },
    };

    dbStore.encounters.unshift(newEncounter);

    // Audit Log
    dbStore.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId: 'system-admisi',
      action: 'CREATE',
      entityName: 'encounters',
      entityId: newEncounter.id,
      details: `Encounter dibuat untuk ${patient?.name || payload.patientId} dengan nomor antrean ${queueNumber}`,
      timestamp: new Date().toISOString(),
    });

    return newEncounter;
  }

  static saveDraftSoap(id: string, vitals?: VitalSigns, soap?: SoapNote): Encounter | null {
    const enc = this.findById(id);
    if (!enc) return null;

    if (vitals) enc.vitals = { ...enc.vitals, ...vitals };
    if (soap) enc.soap = soap;
    enc.status = 'IN_CONSULTATION';
    enc.bpjsTaskId = 4;
    enc.satusehatStatus = 'in-progress';

    dbStore.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId: enc.doctorId,
      action: 'UPDATE',
      entityName: 'clinical_notes',
      entityId: enc.id,
      details: `Draft SOAP diperbarui oleh ${enc.doctorName} untuk diagnosa ${soap?.icd10Code || '-'}`,
      timestamp: new Date().toISOString(),
    });

    return enc;
  }

  static completeConsultation(
    id: string,
    prescriptions: PrescriptionItem[],
    allergyOverrideReason?: string | null
  ): Encounter | null {
    const enc = this.findById(id);
    if (!enc) return null;

    enc.prescriptions = prescriptions;
    enc.status = 'COMPLETED';
    enc.completedAt = new Date().toISOString();
    enc.bpjsTaskId = 5; // Resep masuk farmasi / selesai dokter
    enc.satusehatStatus = 'finished';

    dbStore.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId: enc.doctorId,
      action: 'UPDATE',
      entityName: 'encounters',
      entityId: enc.id,
      details: `Pemeriksaan selesai dan terkunci. Resep obat diterbitkan (${prescriptions.length} item)`,
      timestamp: new Date().toISOString(),
    });

    return enc;
  }

  static updateTask(id: string, taskId: number): Encounter | null {
    const enc = this.findById(id);
    if (!enc) return null;
    enc.bpjsTaskId = taskId;
    return enc;
  }
}
