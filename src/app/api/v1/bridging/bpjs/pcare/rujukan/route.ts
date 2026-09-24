import { NextRequest } from 'next/server';
import { PCareService } from '@/lib/bpjs/pcare-service';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';
import type { ResolvedSessionContext } from '@/server/auth/session-service';
import type { PCareRujukanPayload } from '@/types/bpjs-pcare';

async function createPCareRujukan(request: NextRequest, _context: ResolvedSessionContext) {
  try {
    const body: PCareRujukanPayload = await request.json();

    if (!body.kdppk || !body.kdSubSpesialis) {
      return errorResponse('Parameter kdppk dan kdSubSpesialis wajib diisi', 400, 'VALIDATION_ERROR');
    }

    const res = await PCareService.createRujukanVertikal(body);
    return successResponse(res.response, res.metaData?.message || 'Surat rujukan berhasil diterbitkan', 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Gagal menerbitkan rujukan P-Care', 500, 'BRIDGING_ERROR');
  }
}

export const POST = withAuth(createPCareRujukan, { requiredPermissions: ['encounter:write'] });
