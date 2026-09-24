import { NextRequest } from 'next/server';
import { PatientRepository } from '@/server/repositories/patient-repository';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';

async function getPatient(
  _request: NextRequest,
  _context: unknown,
  params?: Record<string, string | string[]>
) {
  const id = params?.id;
  if (!id || Array.isArray(id)) {
    return errorResponse('ID pasien tidak valid', 400, 'VALIDATION_ERROR');
  }
  const patient = PatientRepository.findById(id);

  if (!patient) {
    return errorResponse(`Pasien dengan ID '${id}' tidak ditemukan`, 404, 'NOT_FOUND');
  }

  return successResponse(patient, 'Detail pasien ditemukan');
}

export const GET = withAuth(getPatient, { requiredPermissions: ['patient:read'] });
