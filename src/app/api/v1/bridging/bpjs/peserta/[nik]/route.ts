import { NextRequest } from 'next/server';
import { PCareService } from '@/lib/bpjs/pcare-service';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';
import type { ResolvedSessionContext } from '@/server/auth/session-service';

async function getBpjsPeserta(
  _request: NextRequest,
  _context: ResolvedSessionContext,
  params?: Record<string, string | string[]>
) {
  const nik = params?.nik;
  if (!nik || Array.isArray(nik)) {
    return errorResponse('NIK tidak valid', 400, 'VALIDATION_ERROR');
  }

  try {
    const res = await PCareService.checkPeserta(nik);
    return successResponse(res.response, 'Data kepesertaan BPJS ditemukan');
  } catch (err: any) {
    return errorResponse(err.message || 'Gagal mengecek data peserta BPJS', 500, 'BRIDGING_ERROR');
  }
}

export const GET = withAuth(getBpjsPeserta, { requiredPermissions: ['patient:read'] });
