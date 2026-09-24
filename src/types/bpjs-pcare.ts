export interface PCarePeserta {
  noKartu: string;
  nik: string;
  nama: string;
  sex: 'L' | 'P';
  tglLahir: string;
  statusPeserta: {
    kode: string;
    keterangan: string;
  };
  jnsPeserta: {
    kode: string;
    nama: string;
  };
  hakKelas: {
    kode: string;
    keterangan: string;
  };
  kdProviderPst: {
    kdProvider: string;
    nmProvider: string;
  };
  aktif: boolean;
  ketAktif: string;
  noHp?: string;
}

export interface PCarePendaftaranPayload {
  kdProviderPeserta: string;
  tglDaftar: string; // DD-MM-YYYY
  noKartu: string;
  kdPoli: string;
  keluhan?: string;
  kunjSakit: boolean; // true = Sakit, false = Sehat/Promotif
  sistole: number;
  diastole: number;
  beratBadan: number;
  tinggiBadan: number;
  respRate: number;
  heartRate: number;
}

export interface PCarePendaftaranResponse {
  noUrut: string;
  kdPoli: string;
  tglDaftar: string;
  noKartu: string;
  nama: string;
  statusDaftar: 'TERDAFTAR' | 'DILAYANI' | 'BATAL';
}

export interface PCarePelayananPayload {
  noKunjungan?: string;
  noKartu: string;
  tglDaftar: string;
  kdPoli: string;
  keluhan: string;
  kdSadar: string; // '01' = Compos Mentis
  sistole: number;
  diastole: number;
  beratBadan: number;
  tinggiBadan: number;
  respRate: number;
  heartRate: number;
  lingkarPerut?: number;
  kdStatusPulang: string; // '3' = Berobat Jalan, '4' = Rujuk Vertikal
  tglPulang: string;
  kdDokter: string;
  kdDiag1: string; // ICD-10 primer
  kdDiag2?: string;
  kdDiag3?: string;
  anamnesa: string;
  terapi?: string;
}

export interface PCareRujukanPayload {
  noKunjungan: string;
  tglEstRujuk: string; // DD-MM-YYYY
  kdppk: string; // Kode RS Tujuan
  kdSubSpesialis: string;
  kdSarana?: string;
  tacc: {
    kdTacc: number; // 1: Time, 2: Age, 3: Complication, 4: Comorbidity
    alasanTacc: string;
  };
  catatan: string;
}

export interface PCareRujukanResponse {
  noRujukan: string;
  tglRujuk: string;
  ppkRujukan: {
    kdPPK: string;
    nmPPK: string;
  };
  subSpesialis: {
    kdSubSpesialis: string;
    nmSubSpesialis: string;
  };
  tglEstRujuk: string;
  jadwal: string;
  catatan: string;
}

export interface PCareFaskesRujukanSubspesialis {
  kdppk: string;
  nmppk: string;
  kelas: string;
  alamat: string;
  telp: string;
  jarakKm?: number;
  kuotaTersedia: number;
}
