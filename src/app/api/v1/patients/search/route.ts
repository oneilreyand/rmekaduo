import { NextRequest } from 'next/server';
import { PatientRepository } from '@/server/repositories/patient-repository';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';

async function searchPatients(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const patients = PatientRepository.search(q, limit);
    return successResponse(patients, 'Pencarian pasien berhasil');
  } catch {
    return errorResponse('Gagal mencari data pasien', 500, 'INTERNAL_SERVER_ERROR');
  }
}

export const GET = withAuth(searchPatients, { requiredPermissions: ['patient:read'] });
