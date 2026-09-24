import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/server/db/data-store';
import { BpjsHttpClient } from '@/server/integrations/bpjs/bpjs-http-client';
import { withAuth } from '@/server/auth/with-auth';
import type { ResolvedSessionContext } from '@/server/auth/session-service';

/**
 * ASSUMPTION-002 (BLOCKER): Endpoint checkin dipanggil oleh server BPJS Antrol
 * saat peserta hadir. Mekanisme auth server-to-server belum diputuskan.
 */
async function handleAntrolCheckin(request: NextRequest, _context: ResolvedSessionContext) {
  try {
    const body: { kodebooking: string; waktu: number } = await request.json();

    const encounter = dbStore.encounters.find((e) => e.bookingCode === body.kodebooking);
    if (encounter) {
      encounter.status = 'IN_QUEUE';
      encounter.checkInStatus = 'CHECKED_IN';
      encounter.checkinTime = new Date(body.waktu || Date.now()).toISOString();
      encounter.bpjsTaskId = 3; // Menunggu poli

      // Laporkan ke BPJS Antrol Task ID 1 & 3
      await BpjsHttpClient.updateWaktuAntrean({
        kodebooking: body.kodebooking,
        taskid: 1,
        waktu: body.waktu || Date.now(),
      });
    }

    return NextResponse.json({
      metadata: {
        code: 200,
        message: 'Check-in kehadiran hari-H berhasil divalidasi.',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { metadata: { code: 500, message: err.message || 'Internal Server Error' } },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleAntrolCheckin, { requiredPermissions: ['encounter:write'] });
