import type { BpjsApiResponse } from '@/types/bpjs-core';
import type {
  PCarePeserta,
  PCarePendaftaranPayload,
  PCarePendaftaranResponse,
  PCarePelayananPayload,
  PCareRujukanPayload,
  PCareRujukanResponse,
  PCareFaskesRujukanSubspesialis,
} from '@/types/bpjs-pcare';
import { mockPCarePesertaList, mockRSList } from './mock-bpjs-data';

export class PCareService {
  /**
   * Cek kepesertaan BPJS di FKTP (by NIK atau No. Kartu)
   */
  static async checkPeserta(identifier: string): Promise<BpjsApiResponse<PCarePeserta>> {
    // Simulasi latensi network
    await new Promise((resolve) => setTimeout(resolve, 350));

    const cleanId = identifier.trim();
    // Cari di mock list berdasarkan noKartu atau NIK
    const found = Object.values(mockPCarePesertaList).find(
      (p) => p.noKartu === cleanId || p.nik === cleanId
    );

    if (!found) {
      // Fallback synthetic peserta aktif jika nomor acak dimasukkan
      const fallbackPeserta: PCarePeserta = {
        noKartu: cleanId.length === 13 ? cleanId : `000${cleanId.slice(0, 10)}`,
        nik: cleanId.length === 16 ? cleanId : `3171${cleanId.padStart(12, '0')}`,
        nama: 'Pasien Terverifikasi BPJS (Simulasi)',
        sex: 'L',
        tglLahir: '1988-06-15',
        statusPeserta: { kode: '0', keterangan: 'AKTIF' },
        jnsPeserta: { kode: '1', nama: 'PEKERJA PENERIMA UPAH (PPU)' },
        hakKelas: { kode: '1', keterangan: 'KELAS 1' },
        kdProviderPst: { kdProvider: '0123R001', nmProvider: 'Klinik Pratama Kaduo Sehat' },
        aktif: true,
        ketAktif: 'Peserta Aktif Terdaftar di Faskes Ini',
        noHp: '081234567890',
      };

      return {
        metaData: { code: 200, message: 'OK' },
        response: fallbackPeserta,
      };
    }

    return {
      metaData: { code: 200, message: 'OK' },
      response: found,
    };
  }

  /**
   * Pendaftaran kunjungan baru di P-Care (Poli Umum / Kunjungan Sakit / Sehat)
   */
  static async registerKunjungan(
    payload: PCarePendaftaranPayload
  ): Promise<BpjsApiResponse<PCarePendaftaranResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const randomUrut = String(Math.floor(Math.random() * 80) + 1).padStart(3, '0');
    return {
      metaData: { code: 201, message: 'Created' },
      response: {
        noUrut: `A-${randomUrut}`,
        kdPoli: payload.kdPoli,
        tglDaftar: payload.tglDaftar,
        noKartu: payload.noKartu,
        nama: 'Pasien Terdaftar P-Care',
        statusDaftar: 'TERDAFTAR',
      },
    };
  }

  /**
   * Entri diagnosa primer/sekunder dan tindakan pelayanan dokter ke server P-Care
   */
  static async submitPelayanan(
    payload: PCarePelayananPayload
  ): Promise<BpjsApiResponse<{ noKunjungan: string; message: string }>> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const noKunjungan = payload.noKunjungan || `0123R001${Date.now().toString().slice(-8)}`;
    return {
      metaData: { code: 200, message: 'Data Pelayanan Berhasil Disimpan di BPJS P-Care' },
      response: {
        noKunjungan,
        message: `Pelayanan dengan diagnosa ${payload.kdDiag1} sukses terverifikasi.`,
      },
    };
  }

  /**
   * Buat Rujukan Vertikal dari FKTP ke Rumah Sakit Rujukan (FKRTL)
   */
  static async createRujukanVertikal(
    payload: PCareRujukanPayload
  ): Promise<BpjsApiResponse<PCareRujukanResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const matchedRS = mockRSList.find((rs) => rs.kdppk === payload.kdppk) || mockRSList[0];
    const generatedNoRujukan = `0123R001${new Date().toISOString().slice(2, 7).replace('-', '')}P${String(Math.floor(Math.random() * 900000) + 100000)}`;

    return {
      metaData: { code: 201, message: 'Surat Rujukan Vertikal Berhasil Diterbitkan' },
      response: {
        noRujukan: generatedNoRujukan,
        tglRujuk: new Date().toISOString().split('T')[0],
        ppkRujukan: {
          kdPPK: matchedRS.kdppk,
          nmPPK: matchedRS.nmppk,
        },
        subSpesialis: {
          kdSubSpesialis: payload.kdSubSpesialis,
          nmSubSpesialis: 'Poli Penyakit Dalam / Subspesialis Terkait',
        },
        tglEstRujuk: payload.tglEstRujuk,
        jadwal: 'Senin s.d. Jumat (08:00 - 13:00)',
        catatan: payload.catatan || 'Mohon evaluasi dan penatalaksanaan lanjutan.',
      },
    };
  }

  /**
   * Ambil daftar Rumah Sakit rujukan terdekat berserta sisa kuota
   */
  static async getFaskesRujukanSubspesialis(): Promise<PCareFaskesRujukanSubspesialis[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockRSList;
  }
}
