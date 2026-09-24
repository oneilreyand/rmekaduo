import { NextRequest } from 'next/server';
import { EncounterRepository } from '@/server/repositories/encounter-repository';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';
import type { VitalSigns, SoapNote } from '@/types/rme';

async function saveSoapDraft(
  request: NextRequest,
  _context: unknown,
  params?: Record<string, string | string[]>
) {
  const id = params?.id;
  if (!id || Array.isArray(id)) {
    return errorResponse('ID kunjungan tidak valid', 400, 'VALIDATION_ERROR');
  }

  try {
    const body: { vitals?: VitalSigns; soap?: SoapNote } = await request.json();
    const updated = EncounterRepository.saveDraftSoap(id, body.vitals, body.soap);

    if (!updated) {
      return errorResponse(`Kunjungan '${id}' tidak ditemukan`, 404, 'NOT_FOUND');
    }

    return successResponse(
      {
        encounterId: updated.id,
        savedAt: new Date().toISOString(),
        status: updated.status,
      },
      'Draft SOAP & TTV berhasil disimpan'
    );
  } catch {
    return errorResponse('Gagal menyimpan draft SOAP', 500, 'INTERNAL_SERVER_ERROR');
  }
}

export const PUT = withAuth(saveSoapDraft, { requiredPermissions: ['encounter:write'] });
