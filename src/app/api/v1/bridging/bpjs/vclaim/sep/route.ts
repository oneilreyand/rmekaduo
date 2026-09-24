import { NextRequest } from 'next/server';
import { VClaimService } from '@/lib/bpjs/vclaim-service';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';
import type { ResolvedSessionContext } from '@/server/auth/session-service';
import type { VClaimSepPayload } from '@/types/bpjs-vclaim';

async function createVClaimSep(request: NextRequest, _context: ResolvedSessionContext) {
  try {
    const body: VClaimSepPayload = await request.json();

    if (!body.noKartu || !body.diagAwal) {
      return errorResponse('Parameter noKartu dan diagAwal wajib diisi', 400, 'VALIDATION_ERROR');
    }

    const res = await VClaimService.createSep(body);
    return successResponse(res.response, res.metaData?.message || 'SEP V-Claim berhasil diterbitkan', 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Gagal menerbitkan SEP V-Claim', 500, 'BRIDGING_ERROR');
  }
}

export const POST = withAuth(createVClaimSep, { requiredPermissions: ['encounter:write'] });
