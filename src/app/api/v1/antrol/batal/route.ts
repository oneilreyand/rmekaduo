import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/server/db/data-store';
import { withAuth } from '@/server/auth/with-auth';
import type { ResolvedSessionContext } from '@/server/auth/session-service';

/**
 * ASSUMPTION-002 (BLOCKER): Endpoint ini juga dipanggil oleh server BPJS Antrol
 * untuk membatalkan booking. Mekanisme auth server-to-server belum diputuskan.
 */
async function handleAntrolBatal(request: NextRequest, _context: ResolvedSessionContext) {
  try {
    const body: { kodebooking: string; keterangan?: string } = await request.json();

    const encounter = dbStore.encounters.find((e) => e.bookingCode === body.kodebooking);
    if (encounter) {
      encounter.status = 'CANCELLED';
    }

    return NextResponse.json({
      metadata: {
        code: 200,
        message: 'Pembatalan antrean berhasil diproses.',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { metadata: { code: 500, message: err.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleAntrolBatal, { requiredPermissions: ['encounter:write'] });
