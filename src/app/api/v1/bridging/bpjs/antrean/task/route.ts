import { NextRequest } from 'next/server';
import { BpjsHttpClient } from '@/server/integrations/bpjs/bpjs-http-client';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';
import type { ResolvedSessionContext } from '@/server/auth/session-service';

async function updateBpjsAntreanTask(request: NextRequest, _context: ResolvedSessionContext) {
  try {
    const body: {
      kodebooking: string;
      taskid: number;
      waktu: number;
      jenisresep?: string;
    } = await request.json();

    if (!body.kodebooking || !body.taskid) {
      return errorResponse('Parameter kodebooking dan taskid wajib diisi', 400, 'VALIDATION_ERROR');
    }

    const res = await BpjsHttpClient.updateWaktuAntrean(body);
    return successResponse(res.response, `Task ID ${body.taskid} berhasil dilaporkan ke BPJS`);
  } catch (err: any) {
    return errorResponse(err.message || 'Gagal update waktu antrean BPJS', 500, 'BRIDGING_ERROR');
  }
}

export const POST = withAuth(updateBpjsAntreanTask, { requiredPermissions: ['encounter:write'] });
