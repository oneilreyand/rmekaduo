'use client';

import { Edit3, Eye, FileText, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Input } from '@/components/atoms/input';
import { ProgressBar } from '@/components/atoms/progress-bar';
import { Skeleton } from '@/components/atoms/skeleton';
import { Spinner } from '@/components/atoms/spinner';
import { Toggle } from '@/components/atoms/toggle';
import { ComponentPreview } from '@/components/molecules/component-preview';
import { DateRangePicker } from '@/components/molecules/date-range-picker';
import { PasswordInput } from '@/components/molecules/password-input';
import { Tabs } from '@/components/molecules/tabs';
import { Toast, type ToastTone } from '@/components/molecules/toast';
import { TooltipButton } from '@/components/molecules/tooltip-button';
import { AccordionPreview, AdvancedReferencePreview, AnalyticsPreview, DashboardStats, DataTablePreview, ErrorFallback, EvidenceLinksPreview, FileDropzone } from '@/components/organisms/reference-organisms';

export function UiSystemCatalogue() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isChecked, setIsChecked] = useState(true);
  const [isDarkPreview, setIsDarkPreview] = useState(true);
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const runOverlayDemo = () => { setIsOverlayVisible(true); window.setTimeout(() => setIsOverlayVisible(false), 2000); };
  const notify = (tone: ToastTone, message: string) => { setToast({ tone, message }); window.setTimeout(() => setToast(null), 3000); };

  return <main className="min-h-[calc(100vh-6rem)] bg-[#f8fafc] px-5 py-10 sm:px-8 lg:px-12"><div className="mx-auto max-w-[1850px]">
    <section className="border-b border-stone-200 pb-8"><div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#39aea9] text-xs">K</span>Atomic Design System</div><h1 className="mt-4 text-4xl font-black tracking-tight text-[#0f172a] sm:text-5xl">Galeri Komponen</h1><p className="mt-3 max-w-3xl text-base leading-7 text-stone-500">Pustaka UI Kaduo dengan palet klinis hangat: ink <strong className="font-bold text-[#0f172a]">#0B0D2C</strong>, action <strong className="font-bold text-[#006bbb]">#FF7A1A</strong>, peach <strong className="font-bold text-[#39aea9]">#FFD9BF</strong>, dan surface <strong className="font-bold text-[#557b83]">#F5E3D6</strong>.</p></section>

    <GallerySection title="1. Atoms">
      <ComponentPreview description="Primary, secondary, destructive, ghost, and icon button variants with loading states." name="Buttons"><Button><Plus className="h-4 w-4" />Primary Action</Button><Button variant="secondary">Secondary</Button><Button className="border border-stone-200 bg-white text-stone-700 hover:bg-stone-50" variant="secondary">Outline</Button><Button variant="danger"><Trash2 className="h-4 w-4" />Delete</Button><Button variant="ghost">Ghost</Button><Button isLoading disabled>Loading</Button></ComponentPreview>
      <ComponentPreview description="Status indicators representing QA states and system metadata tags." name="Badges"><Badge tone="success">● Passed</Badge><Badge tone="warning">● In Review</Badge><Badge tone="danger">● Blocked</Badge><Badge>● Draft</Badge><Badge>● Requirement Mapped</Badge><Badge>● System Token</Badge></ComponentPreview>
      <ComponentPreview description="Animated progress indicators with status color variants and percentage labels." name="Progress Bars"><div className="w-full max-w-xl space-y-4"><ProgressBar label="Test Suite Coverage" value={85} /><ProgressBar label="Sprint Requirement Pass Rate" value={100} /><ProgressBar label="Pending Reviews" tone="warning" value={45} /><ProgressBar label="Critical Defect Resolution" tone="danger" value={20} /></div></ComponentPreview>
      <ComponentPreview description="Circular spinners, pulsing dot loaders, and full-panel loading overlays." name="Loading Indicators & Overlays"><div className="flex w-full flex-wrap items-center gap-5 text-sm font-semibold text-stone-600"><span className="flex items-center gap-2"><Spinner size="sm" />Small</span><span className="flex items-center gap-2"><Spinner />Medium</span><span className="flex items-center gap-2"><Spinner size="lg" />Large</span><span className="flex items-center gap-2"><Spinner size="xl" />Extra Large</span></div><Button className="mt-2 border border-stone-200 bg-white text-stone-700 hover:bg-stone-50" onClick={runOverlayDemo} variant="secondary">Simulate Container Overlay Loading (2s)</Button></ComponentPreview>
      <ComponentPreview description="Form text fields with icons, shortcuts, password visibility, and validation state." name="Inputs & Search"><label className="relative w-full max-w-md"><span className="sr-only">Search Requirements</span><Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><Input className="pl-9" placeholder="Search Requirements" /><kbd className="absolute right-3 top-3 text-[10px] text-stone-400">⌘K</kbd></label><PasswordInput /><label className="w-full max-w-md"><span className="mb-1 block text-sm font-semibold text-stone-700">Task Title</span><Input aria-invalid="true" placeholder="Task title" /><span className="mt-1 block text-xs text-rose-600">Title is required for task creation</span></label></ComponentPreview>
      <ComponentPreview description="Accessible selects, checkboxes, and interactive toggle switches." name="Form Selection Controls"><label className="space-y-1"><span className="block text-sm font-semibold text-stone-700">Task status</span><select className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700"><option>In Progress</option><option>To Do</option><option>Done</option></select></label><Checkbox checked={isChecked} label="Enable automated QA notifications" onChange={setIsChecked} /><Toggle checked={isDarkPreview} label="Dark mode preview" onChange={setIsDarkPreview} /></ComponentPreview>
      <ComponentPreview description="User initials badge with status indicators and size variants." name="Avatars"><Avatar initials="JD" size="sm" /><Avatar initials="SC" /><Avatar initials="AS" size="lg" /></ComponentPreview>
      <ComponentPreview description="Animated placeholders used during API data loading." name="Skeletons"><div className="w-full space-y-3"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div></ComponentPreview>
      <ComponentPreview description="Contextual micro-popovers with directional positioning." name="Tooltips"><TooltipButton direction="Top" /><TooltipButton direction="Bottom" /><TooltipButton direction="Left" /><TooltipButton direction="Right" /></ComponentPreview>
    </GallerySection>

    <GallerySection title="2. Molecules">
      <ComponentPreview category="MOLECULES" description="Standardized search input with icon, clear affordance, shortcut badges, and dark mode support." name="Search Input"><label className="relative w-full max-w-md"><span className="sr-only">Cari</span><Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><Input className="pl-9" placeholder="Cari" /><kbd className="absolute right-3 top-3 text-[10px] text-stone-400">⌘K</kbd></label></ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Range selection control with presets and a clear action." name="Date Range Picker"><DateRangePicker /></ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Compact presentation of backend-evaluated release gate status." name="Release Readiness Signal"><Badge tone="success">● Ready for release</Badge><Badge tone="warning">Access restricted</Badge><Badge tone="danger">Service unavailable</Badge></ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Overlay popups for confirmation actions and detail side inspection panels." name="Modal & Drawer Controls"><Button onClick={() => setIsModalOpen(true)}>Open Modal Demo</Button><Button onClick={() => setIsDrawerOpen(true)} variant="secondary">Open Drawer Demo</Button></ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Underline and pill navigation tab bars with selected state." name="Navigation Tabs"><Tabs labels={['Overview', 'Requirements', 'QA Execution']} /></ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Popover action list trigger for record mutations." name="Dropdown Context Menu"><div className="relative"><Button onClick={() => setIsTaskMenuOpen((value) => !value)} variant="secondary">Task Actions <SlidersHorizontal className="h-4 w-4" /></Button>{isTaskMenuOpen && <div className="absolute left-0 top-12 z-10 w-52 rounded-xl border border-stone-200 bg-white p-2 shadow-lg"><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100" type="button"><Edit3 className="h-4 w-4" />Edit Task Specs</button><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100" type="button"><FileText className="h-4 w-4" />Link Requirement</button><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50" type="button"><Trash2 className="h-4 w-4" />Delete Record</button></div>}</div></ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Illustrative container when search yields no matching items." name="Empty & Error State"><div className="text-center"><Eye className="mx-auto h-7 w-7 text-stone-400" /><p className="mt-2 font-bold text-[#0f172a]">No Requirements Found</p><p className="mt-1 text-sm text-stone-500">There are currently no linked requirements.</p><Button className="mt-3" size="sm">Create Requirement</Button></div></ComponentPreview>
      <ComponentPreview category="MOLECULES" description="Global notification feedback for user actions and API states." name="Global Snackbar & API Response Notifications"><Button onClick={() => notify('success', '200 OK — perubahan berhasil disimpan')} size="sm">🟢 200 OK</Button><Button onClick={() => notify('info', 'Informasi sistem terbaru tersedia')} size="sm" variant="secondary">🔵 Info</Button><Button onClick={() => notify('warning', '422 — mohon periksa data')} size="sm" variant="secondary">🟠 422</Button><Button onClick={() => notify('error', '403 — akses ditolak')} size="sm" variant="danger">🔴 403</Button></ComponentPreview>
    </GallerySection>

    <GallerySection title="3. Organisms">
      <ComponentPreview category="ORGANISMS" description="Bar charts and trend line charts for dashboard test execution metrics." name="Analytics Charts & Visualizations"><AnalyticsPreview /></ComponentPreview>
      <ComponentPreview category="ORGANISMS" description="KPI metric overview cards with trend indicators." name="Dashboard Stat Cards"><DashboardStats /></ComponentPreview>
      <ComponentPreview category="ORGANISMS" description="Structured dashboard table with custom cell rendering and pagination." name="Data Table"><DataTablePreview /></ComponentPreview>
      <ComponentPreview category="ORGANISMS" description="Drag-and-drop file upload container with file list preview." name="File Dropzone Attachment"><FileDropzone /></ComponentPreview>
      <ComponentPreview category="ORGANISMS" description="Production error boundary fallback view with recovery action." name="Error Boundary & 404 Fallback"><ErrorFallback /></ComponentPreview>
      <ComponentPreview category="ORGANISMS" description="Clear and accessible permission restriction view." name="Access Restricted (403 Permission Guard)"><ErrorFallback access /></ComponentPreview>
      <ComponentPreview category="ATOMS & MOLECULES" description="Accessible collapsible panel for hierarchical work breakdown and evidence." name="Accordion & Expandable Subtask Workspace"><AccordionPreview /></ComponentPreview>
      <ComponentPreview category="MOLECULES & ORGANISMS" description="Preview cards and a bounded preview state for linked external evidence." name="Formal QA Evidence Links & Sandboxed Preview"><EvidenceLinksPreview /></ComponentPreview>
      <ComponentPreview category="MOLECULES & ORGANISMS" description="Navigation, contextual actions, and representative loading states." name="Interactive Workspace Patterns"><AdvancedReferencePreview /></ComponentPreview>
    </GallerySection>
  </div>
  {toast && <div className="fixed bottom-5 right-5 z-50"><Toast {...toast} /></div>}
  {isOverlayVisible && <div aria-live="polite" className="fixed inset-0 z-40 grid place-items-center bg-[#0f172a]/30 backdrop-blur-[1px]"><div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-[#0f172a] shadow-xl"><Spinner />Memuat preview…</div></div>}
  {isModalOpen && <div aria-modal="true" className="fixed inset-0 z-40 grid place-items-center bg-[#0f172a]/40 p-4" role="dialog"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold text-[#0f172a]">Modal Demo</h2><p className="mt-2 text-sm text-stone-500">Gunakan modal untuk keputusan yang membutuhkan fokus pengguna.</p><div className="mt-5 flex justify-end gap-2"><Button onClick={() => setIsModalOpen(false)} variant="secondary">Batal</Button><Button onClick={() => setIsModalOpen(false)}>Konfirmasi</Button></div></div></div>}
  {isDrawerOpen && <div className="fixed inset-0 z-40 bg-[#0f172a]/30" onClick={() => setIsDrawerOpen(false)}><aside aria-label="Detail drawer" className="ml-auto h-full w-full max-w-md bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><h2 className="text-xl font-bold text-[#0f172a]">Drawer Demo</h2><p className="mt-2 text-sm text-stone-500">Panel samping untuk inspeksi detail tanpa meninggalkan halaman.</p><Button className="mt-5" onClick={() => setIsDrawerOpen(false)} variant="secondary">Tutup</Button></aside></div>}
  </main>;
}

function GallerySection({ children, title }: { children: React.ReactNode; title: string }) {
  return <section className="border-b border-stone-200 py-9 last:border-b-0"><h2 className="text-sm font-bold uppercase tracking-wide text-stone-400">{title}</h2><div className="mt-6 grid gap-7 lg:grid-cols-2">{children}</div></section>;
}
