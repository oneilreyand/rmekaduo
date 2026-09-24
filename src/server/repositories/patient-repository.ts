import { dbStore } from '@/server/db/data-store';
import type { Patient } from '@/types/rme';
import type { RegisterPatientPayload } from '@/context/patient-journey-context';

export class PatientRepository {
  static search(query: string, limit = 10): Patient[] {
    const q = query.trim().toLowerCase();
    if (!q) return dbStore.patients.slice(0, limit);

    return dbStore.patients
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.nik.toLowerCase().includes(q) ||
          (p.bpjsNumber && p.bpjsNumber.toLowerCase().includes(q))
        );
      })
      .slice(0, limit);
  }

  static findById(id: string): Patient | null {
    return dbStore.patients.find((p) => p.id === id) || null;
  }

  static findByNik(nik: string): Patient | null {
    return dbStore.patients.find((p) => p.nik === nik) || null;
  }

  static create(payload: RegisterPatientPayload): Patient {
    const existing = this.findByNik(payload.nik);
    if (existing) return existing;

    const newIndex = dbStore.patients.length + 1;
    const newMrn = `00-${String(Math.floor(newIndex / 100)).padStart(2, '0')}-${String(newIndex % 100).padStart(2, '0')}`;
    const newId = `pat-${String(newIndex).padStart(3, '0')}`;
    const newIhs = `P${payload.nik.padStart(11, '0')}`;

    const newPatient: Patient = {
      id: newId,
      name: payload.name,
      age: payload.age,
      gender: payload.gender,
      mrn: payload.mrn || newMrn,
      nik: payload.nik,
      bpjsStatus: payload.paymentType === 'BPJS' ? 'AKTIF' : 'NONAKTIF',
      bpjsNumber: payload.bpjsNumber || '',
      bloodType: payload.bloodType || 'O+',
      allergies: payload.allergySubstance
        ? [
            {
              substance: payload.allergySubstance,
              severity: payload.allergySeverity || 'SEDANG',
              reaction: payload.allergyReaction || 'Reaksi alergi tercatat saat admisi',
            },
          ]
        : [],
      fallRisk: payload.fallRisk || 'RENDAH',
      ihsNumber: newIhs,
    };

    dbStore.patients.push(newPatient);

    // Audit Log
    dbStore.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId: 'system-admisi',
      action: 'CREATE',
      entityName: 'patients',
      entityId: newPatient.id,
      details: `Pasien ${newPatient.name} terdaftar dengan No. RM ${newPatient.mrn}`,
      timestamp: new Date().toISOString(),
    });

    return newPatient;
  }
}
