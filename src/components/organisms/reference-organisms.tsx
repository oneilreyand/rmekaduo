'use client';

import { AlertTriangle, CheckCircle2, ChevronDown, ExternalLink, FileText, LockKeyhole, MoreHorizontal, RefreshCw, ShieldAlert, Upload } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { Tabs } from '@/components/molecules/tabs';

export function AnalyticsPreview() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const passed = [54, 72, 65, 86, 78, 92, 83];
  const failed = [15, 10, 18, 7, 12, 5, 9];
  const points = [[10, 105], [65, 84], [120, 58], [175, 33], [230, 16]];
  return <div className="grid w-full gap-8 md:grid-cols-2"><section><h4 className="text-sm font-bold text-[#313866]">Daily Test Runs (Pass vs Fail)</h4><p className="mt-1 text-xs text-stone-500">Weekly execution outcome breakdown</p><div className="mt-3 flex items-center gap-4 text-[11px] font-semibold text-stone-500"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#964ec2]" />Passed Tests</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-rose-500" />Pengujian Gagal</span></div><div className="mt-4 flex h-40 items-end gap-2 border-b border-stone-200 pb-5">{days.map((day, index) => <div className="flex flex-1 flex-col items-center justify-end gap-1" key={day}><div className="flex w-full items-end justify-center gap-0.5"><span className="w-2/5 rounded-t-sm bg-[#964ec2]" style={{ height: `${passed[index]}px` }} /><span className="w-2/5 rounded-t-sm bg-rose-500" style={{ height: `${failed[index]}px` }} /></div><span className="absolute mt-44 text-[10px] text-stone-400">{day}</span></div>)}</div></section><section><h4 className="text-sm font-bold text-[#313866]">QA Requirements Coverage %</h4><p className="mt-1 text-xs text-stone-500">Historical trend across recent sprints</p><div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-stone-500"><i className="h-2.5 w-2.5 rounded-full bg-[#964ec2]" />QA Coverage %</div><svg aria-label="Grafik tren cakupan QA" className="mt-2 h-36 w-full overflow-visible" role="img" viewBox="0 0 240 130">{[25, 50, 75, 100].map((y) => <line key={y} stroke="#e7e5e4" strokeWidth="1" x1="0" x2="240" y1={y} y2={y} />)}<polyline fill="none" points={points.map((point) => point.join(',')).join(' ')} stroke="#964ec2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />{points.map(([x, y], index) => <g key={x}><circle cx={x} cy={y} fill="#fff" r="6" stroke="#964ec2" strokeWidth="4" /><text fill="#78716c" fontSize="9" textAnchor="middle" x={x} y="126">Sprint {index + 1}</text></g>)}</svg></section></div>;
}

export function DashboardStats() {
  const metrics = [
    { label: 'Total Tasks', value: '24', description: 'Across 4 active sprint folders', icon: <FileText className="h-5 w-5 text-stone-700" />, trend: '+12%', positive: true },
    { label: 'QA Pass Rate', value: '91.6%', description: '22 out of 24 test suites passing', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, trend: '+4.2%', positive: true },
    { label: 'Blocked Defects', value: '2', description: 'Requires dev investigation', icon: <AlertTriangle className="h-5 w-5 text-rose-600" />, trend: '-1', positive: false },
  ];
  return <div className="grid w-full gap-4 sm:grid-cols-3">{metrics.map(({ description, icon, label, positive, trend, value }) => <div className="rounded-xl border border-stone-200 p-4" key={label}><div className="flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-wide text-stone-400">{label}</p>{icon}</div><p className="mt-3 text-2xl font-black text-[#313866]">{value}</p><p className="mt-1 text-xs text-stone-500">{description}</p><p className={`mt-2 text-xs font-semibold ${positive ? 'text-emerald-700' : 'text-rose-600'}`}>{trend}</p></div>)}</div>;
}

export function DataTablePreview() {
  const [page, setPage] = useState(1);
  const rows = [['TASK-101', 'Implement OAuth2 login flow', 'REQ-01', 'Passed', 'JD'], ['TASK-102', 'JWT Refresh Token revocation', 'REQ-04', 'Passed', 'SC'], ['TASK-103', 'Stripe Webhook Signature check', 'REQ-12', 'In Review', 'AS'], ['TASK-104', 'Payment Gateway 502 Retry Policy', 'REQ-14', 'Blocked', 'MR']];
  return <div className="w-full overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-stone-200 text-[11px] uppercase tracking-wide text-stone-400"><tr><th className="pb-2">Task ID</th><th className="pb-2">Task title</th><th className="pb-2">Requirement</th><th className="pb-2">QA readiness</th><th className="pb-2">Owner</th></tr></thead><tbody>{rows.map(([id, title, requirement, status, owner]) => <tr className="border-b border-stone-100" key={id}><td className="py-2 font-mono text-xs font-bold text-[#313866]">{id}</td><td className="py-2 font-medium text-[#313866]">{title}</td><td className="py-2"><span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700"><FileText className="h-3.5 w-3.5 text-stone-500" />{requirement}</span></td><td className="py-2"><Badge tone={status === 'Passed' ? 'success' : status === 'Blocked' ? 'danger' : 'warning'}>{status}</Badge></td><td className="py-2"><Avatar initials={owner} size="sm" /></td></tr>)}</tbody></table><div className="mt-4 flex items-center justify-end gap-2 text-xs"><button aria-label="Halaman sebelumnya" className="rounded-lg border border-stone-200 px-2 py-1 disabled:opacity-50" disabled={page === 1} onClick={() => setPage((value) => value - 1)} type="button">Prev</button><span className="text-stone-500">Page {page} of 3</span><button aria-label="Halaman berikutnya" className="rounded-lg border border-stone-200 px-2 py-1 disabled:opacity-50" disabled={page === 3} onClick={() => setPage((value) => value + 1)} type="button">Next</button></div></div>;
}

export function FileDropzone() {
  const [fileName, setFileName] = useState<string | null>(null);
  return <label className="grid w-full cursor-pointer place-items-center rounded-xl border-2 border-dashed border-stone-200 px-6 py-8 text-center text-sm text-stone-500 hover:border-[#964ec2]"><input className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)} type="file" /><Upload className="mb-2 h-6 w-6 text-stone-400" />{fileName ? <strong className="text-[#313866]">{fileName}</strong> : <><strong className="text-[#313866]">Click to upload or drag & drop files</strong><span className="mt-1 text-xs">PDF, DOCX, PNG up to 10MB (max 3 files)</span></>}</label>;
}

export function ErrorFallback({ access = false }: { access?: boolean }) {
  const Icon = access ? LockKeyhole : ShieldAlert;
  return <div className="w-full rounded-xl border border-stone-200 bg-stone-50 p-6 text-center"><Icon className="mx-auto h-9 w-9 text-rose-500" /><h3 className="mt-3 text-lg font-bold text-[#313866]">{access ? 'Akses Dibatasi' : 'Penanganan Kesalahan'}</h3><p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{access ? 'Hanya Admin atau Owner yang dapat mengelola pengaturan dan kebijakan workspace.' : 'Preview untuk tampilan ketika sistem mengalami kesalahan yang dapat dipulihkan.'}</p><Button className="mt-4" variant="secondary"><RefreshCw className="h-4 w-4" />Coba Lagi</Button></div>;
}

export function AccordionPreview() {
  const [open, setOpen] = useState(true);
  const [backendOpen, setBackendOpen] = useState(false);
  return <div className="w-full overflow-hidden rounded-xl border border-stone-200"><button aria-expanded={open} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-[#313866]" onClick={() => setOpen(!open)} type="button"><span><Badge className="mr-2" tone="info">FE</Badge>Implement Interactive Subtask Accordion (Sample)</span><ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} /></button>{open && <p className="border-t border-stone-200 px-4 py-3 text-sm text-stone-500">Workspace tersemat untuk catatan, bukti, dan kolaborasi subtugas.</p>}<button aria-expanded={backendOpen} className="flex w-full items-center justify-between border-t border-stone-200 px-4 py-3 text-left text-sm font-bold text-[#313866]" onClick={() => setBackendOpen(!backendOpen)} type="button"><span><Badge className="mr-2" tone="warning">BE</Badge>Verify Subtask Persistence & Attachments (Sample)</span><ChevronDown className={`h-4 w-4 transition-transform ${backendOpen ? 'rotate-180' : ''}`} /></button>{backendOpen && <p className="border-t border-stone-200 px-4 py-3 text-sm text-stone-500">Lampiran subtugas dan catatan diskusi dipetakan ke panel workspace.</p>}</div>;
}

export function AdvancedReferencePreview() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <div className="grid w-full gap-5 lg:grid-cols-2"><div><Tabs labels={['All Tasks', 'Passed', 'Blocked']} /><div className="relative mt-5"><Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="secondary">Task Actions <MoreHorizontal className="h-4 w-4" /></Button>{isMenuOpen && <div className="absolute left-0 top-12 z-10 w-44 rounded-xl border border-stone-200 bg-white p-2 shadow-lg"><button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100" type="button">Edit task</button><button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100" type="button">Archive task</button></div>}</div></div><div className="rounded-xl border border-stone-200 p-4"><p className="text-sm font-bold text-[#313866]">Loading states</p><div className="mt-3 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-3/5" /></div></div></div>;
}

export function EvidenceLinksPreview() {
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const evidence = [
    ['YOUTUBE', 'E2E Checkout Failure Reproduction Video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    ['DIRECT IMAGE', 'Console Error Screenshot', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'],
  ];
  return <div className="w-full space-y-3">{evidence.map(([type, title, url]) => <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 p-3" key={title}><div><Badge tone="info">{type}</Badge><p className="mt-1 text-sm font-bold text-[#313866]">{title}</p><p className="max-w-sm truncate text-xs text-stone-500">{url}</p></div><Button onClick={() => setActiveTitle(title)} size="sm" variant="secondary">Pratinjau <ExternalLink className="h-3.5 w-3.5" /></Button></div>)}{activeTitle && <div className="rounded-xl border border-[#964ec2] bg-[#f7edff] p-3 text-sm text-[#313866]">Pratinjau siap: <strong>{activeTitle}</strong><button className="ml-3 underline" onClick={() => setActiveTitle(null)} type="button">Tutup</button></div>}</div>;
}
