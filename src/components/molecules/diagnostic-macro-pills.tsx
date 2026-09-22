import type { SoapNote } from '@/types/rme';

export interface DiagnosticMacro {
  id: string;
  label: string;
  tone: string;
  data: SoapNote & { recommendedMed: string };
}

export const diagnosticMacros: DiagnosticMacro[] = [
  {
    id: 'ispa',
    label: 'ISPA',
    tone: 'ui-status-warning',
    data: {
      subjective: 'Batuk pilek sejak 3 hari, tenggorokan terasa sakit saat menelan, demam sumeng-sumeng.',
      objective: 'KU: tampak sakit ringan. Kesadaran: CM. Faring hiperemis (+), tonsil T1/T1 tidak hiperemis. Paru: Vesikuler (+/+), Ronkhi (-/-), Wheezing (-/-).',
      assessment: 'J06.9 - Akut nasofaringitis [common cold]',
      plan: 'Edukasi istirahat cukup, konsumsi air hangat, etika batuk. Terapi simptomatis.',
      icd10Code: 'J06.9',
      icd10Name: 'Akut nasofaringitis [common cold]',
      recommendedMed: 'Paracetamol 500mg (3x1) & Ambroxol 30mg (3x1)',
    },
  },
  {
    id: 'hipertensi',
    label: 'Hipertensi',
    tone: 'ui-status-danger',
    data: {
      subjective: 'Tengkuk terasa tegang dan pusing berputar ringan sejak kemarin. Riwayat darah tinggi terkontrol tidak teratur.',
      objective: 'KU: baik. TD: 150/90 mmHg, HR: 82 bpm, RR: 18 x/m. Cor: S1-S2 reguler, murmur (-). Ekstremitas: Edema pretibial (-/-).',
      assessment: 'I10 - Essential (primary) hypertension',
      plan: 'Modifikasi gaya hidup: diet rendah garam (DASH), olahraga teratur. Terapi antihipertensi lini pertama.',
      icd10Code: 'I10',
      icd10Name: 'Essential (primary) hypertension',
      recommendedMed: 'Amlodipine 5mg (1x1 malam)',
    },
  },
  {
    id: 'dispepsia',
    label: 'Dispepsia',
    tone: 'border-[var(--action)] bg-[var(--action-soft)] text-[var(--action)]',
    data: {
      subjective: 'Nyeri perih di ulu hati terutama terlambat makan, mual (+), kembung (+), begah (+). Muntah (-).',
      objective: 'KU: tenang. Abdomen: Supel, nyeri tekan epigastrium (+), bising usus normal (8-10x/m). Hepar/lien tidak teraba.',
      assessment: 'K30 - Dyspepsia syndrome',
      plan: 'Edukasi jadwal makan teratur, hindari makanan pedas, asam, kopi dan stres fisik.',
      icd10Code: 'K30',
      icd10Name: 'Dyspepsia',
      recommendedMed: 'Omeprazole 20mg (2x1 a.c.) & Antasida Sirup (3x1 cth p.c.)',
    },
  },
];

export interface DiagnosticMacroPillsProps {
  onSelect: (macro: DiagnosticMacro) => void;
  className?: string;
}

export function DiagnosticMacroPills({
  onSelect,
  className = '',
}: DiagnosticMacroPillsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="ui-copy text-xs font-bold">
        Template Makro SOAP:
      </span>
      {diagnosticMacros.map((macro) => (
        <button
          key={macro.id}
          type="button"
          onClick={() => onSelect(macro)}
          className={`rounded-full border px-3 py-1 text-xs font-bold transition-all active:scale-95 ${macro.tone}`}
        >
          {macro.label}
        </button>
      ))}
    </div>
  );
}
