import { NextRequest, NextResponse } from 'next/server';
import { PatientRepository } from '@/server/repositories/patient-repository';
import { EncounterRepository } from '@/server/repositories/encounter-repository';
import { withAuth } from '@/server/auth/with-auth';
import type { ResolvedSessionContext } from '@/server/auth/session-service';
import type { BpjsAntrolBookingRequest } from '@/types/antrol';

/**
 * ASSUMPTION-002 (BLOCKER): Endpoint ini juga menjadi callback server-to-server
 * dari BPJS Antrol v2. Mekanisme autentikasi callback eksternal (API key, mTLS,
 * IP whitelist) belum diputuskan dan menunggu ADR tersendiri. Guard session
 * internal di sini hanya melindungi akses dari browser/app internal.
 * Lihat: docs/features/organization-platform/DRD.md
 */
async function handleAntrolAmbil(request: NextRequest, _context: ResolvedSessionContext) {
  try {
    const body: BpjsAntrolBookingRequest = await request.json();

    if (!body.nik || !body.nomorkartu) {
      return NextResponse.json(
        { metadata: { code: 400, message: 'Parameter nik dan nomorkartu wajib ada' } },
        { status: 400 }
      );
    }

    // 1. Auto-Matching / Auto-Provisioning Pasien
    let patient = PatientRepository.findByNik(body.nik);
    if (!patient) {
      patient = PatientRepository.create({
        name: body.namadokter ? `Peserta MJKN (${body.nomorkartu.slice(-4)})` : 'Peserta Mobile JKN',
        nik: body.nik,
        age: 35,
        gender: 'L',
        phone: body.notelp,
        paymentType: 'BPJS',
        bpjsNumber: body.nomorkartu,
        poliCode: body.kodepoli || 'POLI_UMUM',
        poliName: body.namapoli || 'Poli Umum',
        doctorId: body.kodedokter || 'doc-01',
        doctorName: body.namadokter || 'dr. Siti Rahmawati, Sp.PD',
      });
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const bookingCode = `MJKN-${todayStr}-${String(Math.floor(Math.random() * 900) + 100)}`;

    // 2. Buat Encounter Terjadwal
    const encounter = EncounterRepository.create({
      patientId: patient.id,
      poliCode: body.kodepoli || 'POLI_UMUM',
      poliName: body.namapoli || 'Poli Umum',
      doctorId: body.kodedokter || 'doc-01',
      doctorName: body.namadokter || 'dr. Siti Rahmawati, Sp.PD',
      paymentType: 'BPJS',
      bookingSource: 'MOBILE_JKN',
      bookingCode,
    });

    const angkaAntrean = parseInt(encounter.queueNumber.replace(/\D/g, ''), 10) || 1;
    const estimasiDilayani = Date.now() + angkaAntrean * 15 * 60 * 1000;

    // Respon Resmi BPJS Antrol v2
    return NextResponse.json({
      response: {
        nomorantrean: encounter.queueNumber,
        angkaantrean: angkaAntrean,
        kodebooking: bookingCode,
        norm: patient.mrn,
        namapoli: body.namapoli || 'Poli Umum',
        namadokter: body.namadokter || 'dr. Siti Rahmawati, Sp.PD',
        estimasidilayani: estimasiDilayani,
        sisakuotajkn: 15,
        kuotajkn: 20,
        sisakuotanonjkn: 10,
        kuotanonjkn: 15,
        keterangan: 'Peserta harap hadir 15 menit sebelum estimasi waktu layanan.',
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

export const POST = withAuth(handleAntrolAmbil, { requiredPermissions: ['encounter:write'] });
