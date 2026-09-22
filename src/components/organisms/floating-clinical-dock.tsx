import { Button } from '@/components/atoms/button';
import { KbdShortcut } from '@/components/atoms/kbd-shortcut';

export interface FloatingClinicalDockProps {
  onSave: () => void;
  isSaving?: boolean;
  onResetPrescription?: () => void;
  className?: string;
}

export function FloatingClinicalDock({
  onSave,
  isSaving = false,
  onResetPrescription,
  className = '',
}: FloatingClinicalDockProps) {
  return (
    <footer
      className={`ui-card fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 rounded-2xl p-2.5 px-4 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="ui-status-neutral rounded-full border px-2.5 py-1">
            <span>Mode demonstrasi lokal</span>
          </div>
        </div>

        {/* Shortcuts Hints (Desktop) */}
        <div className="ui-copy hidden items-center gap-3 text-xs md:flex">
          <span className="inline-flex items-center gap-1">
            <KbdShortcut>⌘S</KbdShortcut>
            <span>Simpan SOAP</span>
          </span>
          <span className="ui-copy">•</span>
          <span className="inline-flex items-center gap-1">
            <KbdShortcut>⌥R</KbdShortcut>
            <span>Fokus Resep</span>
          </span>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          {onResetPrescription && (
            <button
              type="button"
              onClick={onResetPrescription}
              className="ui-secondary rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
            >
              Reset Form
            </button>
          )}

          <Button
            onClick={onSave}
            isLoading={isSaving}
            className="font-bold text-sm px-5 py-2.5"
          >
            <span>Selesai & Simpan</span>
          </Button>
        </div>
      </div>
    </footer>
  );
}
