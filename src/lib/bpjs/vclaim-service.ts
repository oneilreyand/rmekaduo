import type { BpjsApiResponse } from '@/types/bpjs-core';
import type {
  VClaimRujukan,
  VClaimSepPayload,
  VClaimSepResponse,
  VClaimSuratKontrolPayload,
  VClaimSuratKontrolResponse,
} from '@/types/bpjs-vclaim';
import { mockVClaimRujukanList, mockCreatedSepList } from './mock-bpjs-data';

export class VClaimService {
  /**
   * Cek data rujukan aktif dari FKTP (Puskesmas / Klinik) berdasarkan No. Kartu BPJS atau NIK
   */
  static async checkRujukan(identifier: string): Promise<BpjsApiResponse<VClaimRujukan | null>> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const cleanId = identifier.trim();

    // Cari dari data mock rujukan
    const found = Object.values(mockVClaimRujukanList).find(
      (r) => r.peserta.noKartu === cleanId || r.peserta.nik === cleanId || r.noKunjungan === cleanId
    );

    if (found) {
      return {
        metaData: { code: 200, message: 'Rujukan Ditemukan' },
        response: found,
      };
    }

    // Buat rujukan synthetic jika peserta tidak ada di daftar spesifik
    const fallbackRujukan: VClaimRujukan = {
      noKunjungan: `0123R001${new Date().toISOString().slice(2, 7).replace('-', '')}P${String(Math.floor(Math.random() * 900000) + 100000)}`,
      tglKunjungan: new Date().toISOString().split('T')[0],
      peserta: {
        noKartu: cleanId.length === 13 ? cleanId : `000${cleanId.slice(0, 10)}`,
        nik: cleanId.length === 16 ? cleanId : `3171${cleanId.padStart(12, '0')}`,
        nama: 'Pasien Berkas Rujukan Valid',
        sex: 'L',
        tglLahir: '1985-04-12',
        statusPeserta: { kode: '0', keterangan: 'AKTIF' },
        hakKelas: { kode: '1', keterangan: 'KELAS 1' },
        provUmum: { kdProvider: '0123R001', nmProvider: 'Klinik Pratama Kaduo Sehat' },
        tglTAT: '2026-12-31',
        tglTMT: '2018-01-01',
      },
      provPerujuk: { kode: '0123R001', nama: 'Klinik Pratama Kaduo Sehat' },
      poliRujukan: { kode: 'INT', nama: 'Penyakit Dalam' },
      diagnosa: { kode: 'J06.9', nama: 'Acute upper respiratory infection, unspecified' },
      keluhan: 'Rujukan dari faskes 1 untuk pemeriksaan lanjutan di RS',
      pelayanan: { kode: '2', nama: 'Rawat Jalan' },
    };

    return {
      metaData: { code: 200, message: 'Rujukan Otomatis Digenerate (Simulasi)' },
      response: fallbackRujukan,
    };
  }

  /**
   * Pembuatan Surat Eligibilitas Peserta (SEP) Rawat Jalan / Rawat Inap / IGD
   */
  static async createSep(payload: VClaimSepPayload): Promise<BpjsApiResponse<VClaimSepResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const generatedNoSep = `${payload.ppkPelayanan}${new Date().toISOString().slice(2, 7).replace('-', '')}V${String(Math.floor(Math.random() * 900000) + 100000)}`;

    const newSep: VClaimSepResponse = {
      noSep: generatedNoSep,
      tglSep: payload.tglSep,
      jnsPelayanan: payload.jnsPelayanan === '1' ? 'Rawat Inap' : 'Rawat Jalan',
      peserta: {
        noKartu: payload.noKartu,
        nama: 'Tn. Budi Santoso',
        jnsPeserta: 'PESERTA MANDIRI',
        hakKelas: `Kelas ${payload.klsRawatHak}`,
        kelamin: 'Laki-laki',
        tglLahir: '1981-08-20',
      },
      poli: payload.poli.tujuan,
      diagnosa: payload.diagAwal,
      catatan: payload.catatan || 'Kunjungan rawat jalan rujukan FKTP',
      dpjp: payload.dpjpLayan || 'dr. Siti Rahmawati, Sp.PD',
    };

    mockCreatedSepList.unshift(newSep);

    return {
      metaData: { code: 200, message: 'Sukses Menerbitkan SEP' },
      response: newSep,
    };
  }

  /**
   * Pembuatan Surat Perintah Kontrol (SK) atau SPRI Rawat Inap
   */
  static async createSuratKontrol(
    payload: VClaimSuratKontrolPayload
  ): Promise<BpjsApiResponse<VClaimSuratKontrolResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const generatedNoSurat = `0123R001${new Date().toISOString().slice(2, 7).replace('-', '')}K${String(Math.floor(Math.random() * 9000) + 1000)}`;

    return {
      metaData: { code: 200, message: 'Surat Kontrol Berhasil Diterbitkan' },
      response: {
        noSuratKontrol: generatedNoSurat,
        tglRencanaKontrol: payload.tglRencanaKontrol,
        namaDokter: 'dr. Siti Rahmawati, Sp.PD',
        namaPoli: 'Poli Penyakit Dalam',
        noSEP: payload.noSEP,
      },
    };
  }

  /**
   * Update Tanggal Pulang SEP Pasien Rawat Inap / Selesai Pelayanan
   */
  static async updateSepPulang(
    noSep: string,
    tglPulang: string
  ): Promise<BpjsApiResponse<{ message: string }>> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    return {
      metaData: { code: 200, message: 'Tanggal Pulang Berhasil Diperbarui' },
      response: {
        message: `SEP ${noSep} berhasil ditutup pada tanggal ${tglPulang}.`,
      },
    };
  }
}
