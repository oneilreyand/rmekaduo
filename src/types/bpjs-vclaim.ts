export interface VClaimPeserta {
  noKartu: string;
  nik: string;
  nama: string;
  sex: 'L' | 'P';
  tglLahir: string;
  statusPeserta: {
    kode: string;
    keterangan: string;
  };
  hakKelas: {
    kode: string;
    keterangan: string;
  };
  provUmum: {
    kdProvider: string;
    nmProvider: string;
  };
  tglTAT: string;
  tglTMT: string;
}

export interface VClaimRujukan {
  noKunjungan: string; // Nomor Rujukan
  tglKunjungan: string;
  peserta: VClaimPeserta;
  provPerujuk: {
    kode: string;
    nama: string;
  };
  poliRujukan: {
    kode: string;
    nama: string;
  };
  diagnosa: {
    kode: string;
    nama: string;
  };
  keluhan: string;
  pelayanan: {
    kode: string;
    nama: string;
  };
}

export interface VClaimSepPayload {
  noKartu: string;
  tglSep: string; // YYYY-MM-DD
  ppkPelayanan: string;
  jnsPelayanan: '1' | '2'; // 1: Rawat Inap, 2: Rawat Jalan
  klsRawatHak: string;
  noMR: string;
  rujukan: {
    asalRujukan: '1' | '2'; // 1: FKTP, 2: FKRTL
    tglRujukan: string;
    noRujukan: string;
    ppkRujukan: string;
  };
  catatan: string;
  diagAwal: string; // ICD-10
  poli: {
    tujuan: string;
    eksekutif: '0' | '1';
  };
  cob?: {
    cob: '0' | '1';
  };
  katarak?: {
    katarak: '0' | '1';
  };
  jaminan?: {
    lakaLantas: '0' | '1' | '2' | '3'; // 0 = Bukan KLL
    penjamin?: {
      penjamin?: string;
      tglKejadian?: string;
      keterangan?: string;
    };
  };
  dpjpLayan: string;
  noTelp: string;
  user: string;
}

export interface VClaimSepResponse {
  noSep: string;
  tglSep: string;
  jnsPelayanan: string;
  peserta: {
    noKartu: string;
    nama: string;
    jnsPeserta: string;
    hakKelas: string;
    asuransi?: string;
    kelamin: string;
    tglLahir: string;
  };
  poli: string;
  diagnosa: string;
  catatan: string;
  dpjp: string;
}

export interface VClaimSuratKontrolPayload {
  noSEP: string;
  tglRencanaKontrol: string; // YYYY-MM-DD
  poliKontrol: string;
  kodeDokter: string;
  user: string;
}

export interface VClaimSuratKontrolResponse {
  noSuratKontrol: string;
  tglRencanaKontrol: string;
  namaDokter: string;
  namaPoli: string;
  noSEP: string;
}
