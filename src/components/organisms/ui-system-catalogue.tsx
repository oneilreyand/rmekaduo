'use client';

import { useState } from 'react';
import { Avatar } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Input } from '@/components/atoms/input';
import { KbdShortcut } from '@/components/atoms/kbd-shortcut';
import { ProgressBar } from '@/components/atoms/progress-bar';
import { Skeleton } from '@/components/atoms/skeleton';
import { Sparkline } from '@/components/atoms/sparkline';
import { Spinner } from '@/components/atoms/spinner';
import { Toggle } from '@/components/atoms/toggle';
import { ComponentPreview } from '@/components/molecules/component-preview';
import { DateRangePicker } from '@/components/molecules/date-range-picker';
import { DiagnosticMacroPills } from '@/components/molecules/diagnostic-macro-pills';
import { InteractivePainSlider } from '@/components/molecules/interactive-pain-slider';
import { PasswordInput } from '@/components/molecules/password-input';
import { PatientSafetyBadge } from '@/components/molecules/patient-safety-badge';
import { SmartDosageChips } from '@/components/molecules/smart-dosage-chips';
import { Tabs } from '@/components/molecules/tabs';
import { Toast, type ToastTone } from '@/components/molecules/toast';
import { TooltipButton } from '@/components/molecules/tooltip-button';
import { AnalyticsPreview, DashboardStats, DataTablePreview, ErrorFallback } from '@/components/organisms/reference-organisms';

export function UiSystemCatalogue() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [isNotificationOn, setIsNotificationOn] = useState(true);
  const [painValue, setPainValue] = useState(3);
  const [selectedDosage, setSelectedDosage] = useState('3 x 1 tablet sehari');
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);

  const runOverlayDemo = () => {
    setIsOverlayVisible(true);
    window.setTimeout(() => setIsOverlayVisible(false), 2000);
  };
  const notify = (tone: ToastTone, message: string) => {
    setToast({ tone, message });
    window.setTimeout(() => setToast(null), 3000);
  };

  return <main className="ui-workspace"><div className="ui-workspace-inner">
    <section className="border-b pb-8">
      <p className="ui-eyebrow text-xs font-bold uppercase tracking-[0.12em]">Sistem UI Kaduo</p>
      <h1 className="ui-heading mt-2 text-4xl font-black tracking-tight sm:text-5xl">Galeri Komponen</h1>
      <p className="ui-copy mt-3 max-w-3xl text-base leading-7">Referensi komponen yang digunakan ulang di RME. Kaduo memakai kanvas putih, navy sebagai teks utama, oranye untuk aksi, serta peach untuk penekanan ringan. Merah, amber, dan hijau hanya dipakai sebagai status keselamatan yang selalu disertai teks.</p>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Token warna Kaduo"><TokenSwatch label="Navy" value="#0B0D2C" className="bg-[#0b0d2c]" /><TokenSwatch label="Oranye" value="#FF7A1A" className="bg-[#ff7a1a]" /><TokenSwatch label="Peach" value="#FFD9BF" className="bg-[#ffd9bf]" /><TokenSwatch label="Surface" value="#F5E3D6" className="bg-[#f5e3d6]" /></div>
    </section>

    <GallerySection title="1. Atoms">
      <ComponentPreview description="Aksi utama, sekunder, netral, dan destruktif memakai state fokus serta disabled yang konsisten." name="Tombol">
        <Button>Simpan</Button><Button variant="secondary">Batal</Button><Button variant="ghost">Bantuan</Button><Button variant="danger">Hapus</Button><Button isLoading disabled>Menyimpan</Button>
      </ComponentPreview>
      <ComponentPreview description="Status selalu memakai warna dan teks. Status keselamatan juga memakai ikon agar tidak bergantung pada warna." name="Badge status">
        <Badge tone="neutral">Draf</Badge><Badge tone="info">Perlu perhatian</Badge><Badge tone="success">Terverifikasi</Badge><Badge tone="warning">Menunggu tinjauan</Badge><Badge tone="danger">Dibatasi</Badge><PatientSafetyBadge type="allergy" label="ALERGI: CONTOH" severity="BERAT" />
      </ComponentPreview>
      <ComponentPreview description="Checkbox dan toggle memiliki state aktif/nonaktif yang terlihat jelas di light maupun dark mode." name="Kontrol pilihan">
        <div className="space-y-4"><Checkbox checked={isChecked} label="Tandai contoh sebagai terverifikasi" onChange={setIsChecked} /><div className="flex flex-wrap items-center gap-3"><Toggle checked={isNotificationOn} label="Aktifkan notifikasi contoh" onChange={setIsNotificationOn} /><Badge tone={isNotificationOn ? 'success' : 'neutral'}>{isNotificationOn ? 'Aktif' : 'Nonaktif'}</Badge></div></div>
      </ComponentPreview>
      <ComponentPreview description="Progress, skeleton, dan spinner menggunakan token yang sama sehingga tetap terbaca pada semua mode." name="Status pemuatan">
        <div className="w-full max-w-md space-y-4"><ProgressBar label="Kelengkapan contoh" value={72} /><div className="flex items-center gap-3"><Spinner size="sm" /><Spinner /><Skeleton className="h-8 w-36" /></div><Button onClick={runOverlayDemo} size="sm" variant="secondary">Simulasikan pemuatan</Button></div>
      </ComponentPreview>
      <ComponentPreview description="Grafik memakai oranye untuk seri utama, hijau untuk rentang normal, dan label teks yang selalu terlihat." name="Grafik mini">
        <div className="flex flex-wrap items-center gap-6"><div><p className="ui-copy mb-2 text-xs font-semibold">Tren kunjungan</p><Sparkline data={[42, 55, 48, 64, 61]} /></div><div><p className="ui-copy mb-2 text-xs font-semibold">Rentang normal</p><Sparkline data={[120, 126, 121, 123]} normalRange={[110, 130]} /></div></div>
      </ComponentPreview>
      <ComponentPreview description="Avatar dan shortcut mempertahankan kontras yang cukup di atas surface terang ataupun gelap." name="Avatar dan shortcut">
        <Avatar initials="KD" size="sm" /><Avatar initials="RM" /><Avatar initials="UI" size="lg" /><span className="ui-copy text-sm">Simpan <KbdShortcut>⌘S</KbdShortcut></span>
      </ComponentPreview>
    </GallerySection>

    <GallerySection title="2. Molecules">
      <ComponentPreview category="MOLECULES" description="Field masukan, kata sandi, dan filter tanggal menggunakan kontrol dasar yang sama." name="Field dan filter">
        <div className="w-full max-w-md space-y-3"><label className="block"><span className="sr-only">Cari komponen</span><Input placeholder="Cari komponen" /></label><PasswordInput /><DateRangePicker /></div>
      </ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Tab dan tooltip adalah pola navigasi ringan yang mengikuti surface, border, dan fokus Kaduo." name="Navigasi terfokus">
        <Tabs labels={['Ringkasan', 'Riwayat', 'Lampiran']} /><TooltipButton direction="Top" />
      </ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Skala nyeri memakai label dan angka; gradasi hanya mendukung, bukan menggantikan informasi." name="Skala nyeri">
        <div className="w-full max-w-md"><InteractivePainSlider value={painValue} onChange={setPainValue} /></div>
      </ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Contoh chip memperlihatkan state hover dan fokus tanpa mencampurkan palet utama dengan status keselamatan." name="Chip tindakan cepat">
        <div className="w-full space-y-3"><SmartDosageChips onSelect={setSelectedDosage} /><p className="ui-copy text-xs">Pilihan contoh: <strong className="ui-heading">{selectedDosage}</strong></p><DiagnosticMacroPills onSelect={(macro) => notify('info', `Template ${macro.label} dipilih`)} /></div>
      </ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Toast memakai ikon, teks, dan warna agar pesan tetap jelas pada kedua mode." name="Umpan balik">
        <div className="flex flex-wrap gap-2"><Button onClick={() => notify('success', 'Contoh berhasil disimpan')} size="sm">Sukses</Button><Button onClick={() => notify('info', 'Informasi contoh tersedia')} size="sm" variant="secondary">Informasi</Button><Button onClick={() => notify('warning', 'Tinjau kembali pilihan contoh')} size="sm" variant="secondary">Peringatan</Button><Button onClick={() => notify('error', 'Contoh gagal dimuat')} size="sm" variant="danger">Kesalahan</Button></div>
      </ComponentPreview>
    </GallerySection>

    <GallerySection title="3. Organisms">
      <ComponentPreview category="ORGANISMS" description="Visualisasi ringkas dengan data contoh non-pasien untuk memeriksa hierarchy, label, dan warna." name="Ringkasan dan grafik"><AnalyticsPreview /></ComponentPreview>
      <ComponentPreview category="ORGANISMS" description="Kartu ringkasan memakai struktur dan jarak yang sama agar mudah dipindai." name="Kartu ringkasan"><DashboardStats /></ComponentPreview>
      <ComponentPreview category="ORGANISMS" description="Tabel contoh memperlihatkan kepadatan, badge status, avatar, dan pagination." name="Tabel status"><DataTablePreview /></ComponentPreview>
      <ComponentPreview category="ORGANISMS" description="State pemulihan menggunakan copy yang spesifik dan tindakan yang jelas." name="State kosong dan pemulihan"><ErrorFallback /></ComponentPreview>
    </GallerySection>
  </div>{toast && <div className="fixed bottom-5 right-5 z-50"><Toast {...toast} /></div>}{isOverlayVisible && <div aria-live="polite" className="fixed inset-0 z-40 grid place-items-center bg-black/35 backdrop-blur-sm"><div className="ui-card flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-semibold"><Spinner />Memuat contoh komponen…</div></div>}</main>;
}

function TokenSwatch({ className, label, value }: { className: string; label: string; value: string }) {
  return <span className="ui-surface inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-semibold"><i aria-hidden="true" className={`h-5 w-5 rounded-full ${className}`} /><span className="ui-heading">{label}</span><span className="ui-copy font-mono text-[10px]">{value}</span></span>;
}

function GallerySection({ children, title }: { children: React.ReactNode; title: string }) {
  return <section className="border-b py-9 last:border-b-0"><h2 className="ui-copy text-sm font-bold uppercase tracking-[0.1em]">{title}</h2><div className="mt-6 grid gap-6 lg:grid-cols-2">{children}</div></section>;
}
