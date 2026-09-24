import { NextRequest } from 'next/server';
import { TerminologyRepository } from '@/server/repositories/terminology-repository';
import { successResponse, errorResponse } from '@/server/utils/response-helper';
import { withAuth } from '@/server/auth/with-auth';
import type { ResolvedSessionContext } from '@/server/auth/session-service';

async function searchKfa(request: NextRequest, _context: ResolvedSessionContext) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const results = TerminologyRepository.searchKfa(q, limit);
    return successResponse(results, 'Pencarian obat KFA berhasil');
  } catch (err: any) {
    return errorResponse(err.message || 'Gagal mencari master obat KFA', 500, 'INTERNAL_SERVER_ERROR');
  }
}

export const GET = withAuth(searchKfa, { requiredPermissions: ['encounter:read'] });
