import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/server/db/data-store';
import { withAuth } from '@/server/auth/with-auth';
import type { ResolvedSessionContext } from '@/server/auth/session-service';

/**
 * ASSUMPTION-002 (BLOCKER): Endpoint sisa antrean dipanggil oleh server BPJS
 * untuk memperbarui informasi sisa antrean. Auth server-to-server belum diputuskan.
 */
async function handleAntrolSisa(request: NextRequest, _context: ResolvedSessionContext) {
  try {
    const body: { kodebooking: string } = await request.json();

    const encounter = dbStore.encounters.find((e) => e.bookingCode === body.kodebooking);

    return NextResponse.json({
      response: {
        nomorantrean: encounter?.queueNumber || 'A-07',
        namapoli: encounter?.poliName || 'Poli Umum',
        namadokter: encounter?.doctorName || 'dr. Siti Rahmawati, Sp.PD',
        sisaantrean: 3,
        antreanpanggil: 'A-04',
        waktutunggu: 900,
        keterangan: 'Antrean sedang berjalan lancar.',
      },
      metadata: {
        code: 200,
        message: 'Ok',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { metadata: { code: 500, message: err.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleAntrolSisa, { requiredPermissions: ['encounter:read'] });
