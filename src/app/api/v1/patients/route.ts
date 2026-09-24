import { NextRequest } from 'next/server';
import { PatientRepository } from '@/server/repositories/patient-repository';
import { EncounterRepository } from '@/server/repositories/encounter-repository';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';
import type { RegisterPatientPayload } from '@/context/patient-journey-context';

async function registerPatient(request: NextRequest) {
  try {
    const body: RegisterPatientPayload = await request.json();

    // Validasi input wajib
    if (!body.name || !body.name.trim()) {
      return errorResponse('Nama pasien wajib diisi', 400, 'VALIDATION_ERROR', [
        { field: 'name', message: 'Nama pasien tidak boleh kosong' },
      ]);
    }

    if (!body.nik || body.nik.trim().length < 8) {
      return errorResponse('NIK pasien tidak valid', 400, 'VALIDATION_ERROR', [
        { field: 'nik', message: 'NIK wajib diisi minimal 8-16 digit angka' },
      ]);
    }

    // Buat data pasien
    const patient = PatientRepository.create(body);

    // Otomatis buat encounter / nomor antrean
    const encounter = EncounterRepository.create({
      patientId: patient.id,
      poliCode: body.poliCode || 'POLI_UMUM',
      poliName: body.poliName || 'Poli Umum',
      doctorId: body.doctorId || 'doc-01',
      doctorName: body.doctorName || 'dr. Siti Rahmawati, Sp.PD',
      paymentType: body.paymentType || 'UMUM',
      bookingSource: 'ON_SITE',
    });

    return successResponse(
      {
        patientId: patient.id,
        mrn: patient.mrn,
        ihsNumber: patient.ihsNumber,
        queueNumber: encounter.queueNumber,
        bpjsTaskId: encounter.bpjsTaskId,
        encounterId: encounter.id,
        registeredAt: new Date().toISOString(),
      },
      'Pasien baru berhasil didaftarkan',
      201
    );
  } catch {
    return errorResponse('Gagal mendaftarkan pasien', 500, 'INTERNAL_SERVER_ERROR');
  }
}

/**
 * Endpoint legacy masih memakai in-memory repository. Ia tetap diberi guard
 * server-side agar tidak dapat dibaca/ditulis tanpa session dan permission.
 * Migrasi persistence dan transaction pendaftaran berada pada P3.
 */
export const POST = withAuth(registerPatient, { requiredPermissions: ['patient:write'] });
