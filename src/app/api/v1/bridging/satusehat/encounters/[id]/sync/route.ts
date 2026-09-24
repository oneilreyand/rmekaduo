import { NextRequest } from 'next/server';
import { EncounterRepository } from '@/server/repositories/encounter-repository';
import { SatuSehatClient } from '@/server/integrations/satusehat/satusehat-client';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';
import type { ResolvedSessionContext } from '@/server/auth/session-service';

async function syncSatuSehatEncounter(
  _request: NextRequest,
  _context: ResolvedSessionContext,
  params?: Record<string, string | string[]>
) {
  const id = params?.id;
  if (!id || Array.isArray(id)) {
    return errorResponse('ID kunjungan tidak valid', 400, 'VALIDATION_ERROR');
  }

  try {
    const encounter = EncounterRepository.findById(id);
    if (!encounter) {
      return errorResponse(`Kunjungan '${id}' tidak ditemukan`, 404, 'NOT_FOUND');
    }

    const syncResult = await SatuSehatClient.syncEncounterBundle(encounter);

    encounter.fhirEncounterId = syncResult.fhirEncounterId;
    encounter.satusehatStatus = 'finished';

    return successResponse(
      {
        encounterId: encounter.id,
        fhirEncounterId: syncResult.fhirEncounterId,
        resourcesSynced: syncResult.resourcesSynced,
        syncedAt: syncResult.syncedAt,
      },
      'Sinkronisasi bundle FHIR R4 ke SATUSEHAT berhasil'
    );
  } catch (err: any) {
    return errorResponse(err.message || 'Gagal sinkronisasi SATUSEHAT', 500, 'BRIDGING_ERROR');
  }
}

export const POST = withAuth(syncSatuSehatEncounter, { requiredPermissions: ['encounter:write'] });
