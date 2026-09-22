'use client';

import { useState } from 'react';
import { AppHeader, type AppMenu } from '@/components/organisms/app-header';
import { ClinicalConsultationWorkspace } from '@/components/organisms/clinical-consultation-workspace';
import { AdmissionWorkspace } from '@/components/organisms/admission-workspace';
import { QueueDisplayWorkspace } from '@/components/organisms/queue-display-workspace';
import { TriageWorkspace } from '@/components/organisms/triage-workspace';
import { PharmacyCashierWorkspace } from '@/components/organisms/pharmacy-cashier-workspace';
import { SettingsWorkspace } from '@/components/organisms/settings-workspace';
import { UiSystemCatalogue } from '@/components/organisms/ui-system-catalogue';
import { PatientJourneyProvider } from '@/context/patient-journey-context';

export function SinglePageShell() {
  const [activeMenu, setActiveMenu] = useState<AppMenu>('admission');

  return (
    <PatientJourneyProvider>
      <div className="ui-page min-h-screen antialiased selection:bg-[var(--action)] selection:text-white">
        <AppHeader activeMenu={activeMenu} onMenuChange={setActiveMenu} />
        {activeMenu === 'admission' && <AdmissionWorkspace />}
        {activeMenu === 'queue-display' && <QueueDisplayWorkspace />}
        {activeMenu === 'triage' && <TriageWorkspace />}
        {activeMenu === 'consultation' && <ClinicalConsultationWorkspace />}
        {activeMenu === 'pharmacy-cashier' && <PharmacyCashierWorkspace />}
        {activeMenu === 'system-ui' && <UiSystemCatalogue />}
        {activeMenu === 'settings' && <SettingsWorkspace />}
      </div>
    </PatientJourneyProvider>
  );
}
