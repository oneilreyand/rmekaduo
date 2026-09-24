import { NextRequest } from 'next/server';
import { EncounterRepository } from '@/server/repositories/encounter-repository';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';

async function getEncounter(
  _request: NextRequest,
  _context: unknown,
  params?: Record<string, string | string[]>
) {
  const id = params?.id;
  if (!id || Array.isArray(id)) {
    return errorResponse('ID kunjungan tidak valid', 400, 'VALIDATION_ERROR');
  }
  const encounter = EncounterRepository.findById(id);

  if (!encounter) {
    return errorResponse(`Kunjungan dengan ID '${id}' tidak ditemukan`, 404, 'NOT_FOUND');
  }

  return successResponse(encounter, 'Data kunjungan berhasil dimuat');
}

export const GET = withAuth(getEncounter, { requiredPermissions: ['encounter:read'] });
