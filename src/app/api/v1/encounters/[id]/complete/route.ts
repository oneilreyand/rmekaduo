import { NextRequest } from 'next/server';
import { EncounterRepository } from '@/server/repositories/encounter-repository';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';
import type { PrescriptionItem } from '@/types/rme';

async function completeEncounterDemo(
  request: NextRequest,
  _context: unknown,
  params?: Record<string, string | string[]>
) {
  const id = params?.id;
  if (!id || Array.isArray(id)) {
    return errorResponse('ID kunjungan tidak valid', 400, 'VALIDATION_ERROR');
  }

  try {
    const body: {
      prescriptions?: PrescriptionItem[];
      allergyOverrideReason?: string | null;
    } = await request.json();

    const updated = EncounterRepository.completeConsultation(
      id,
      body.prescriptions || [],
      body.allergyOverrideReason
    );

    if (!updated) {
      return errorResponse(`Kunjungan '${id}' tidak ditemukan`, 404, 'NOT_FOUND');
    }

    return successResponse(
      {
        encounterId: updated.id,
        status: updated.status,
        mode: 'demo-local',
      },
      'Simulasi lokal selesai. Rekam klinis tidak terkunci, tidak persistent, dan tidak dikirim ke provider.'
    );
  } catch {
    return errorResponse('Gagal memfinalisasi kunjungan', 500, 'INTERNAL_SERVER_ERROR');
  }
}

export const POST = withAuth(completeEncounterDemo, { requiredPermissions: ['encounter:write'] });
