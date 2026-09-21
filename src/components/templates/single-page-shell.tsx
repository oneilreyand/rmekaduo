'use client';

import { useState } from 'react';
import { AppHeader, type AppMenu } from '@/components/organisms/app-header';
import { RmeModuleWorkspace } from '@/components/organisms/rme-module-workspace';
import { SettingsWorkspace } from '@/components/organisms/settings-workspace';
import { UiSystemCatalogue } from '@/components/organisms/ui-system-catalogue';

export function SinglePageShell() {
  const [activeMenu, setActiveMenu] = useState<AppMenu>('system-ui');
  return <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]"><AppHeader activeMenu={activeMenu} onMenuChange={setActiveMenu} />{activeMenu === 'system-ui' ? <UiSystemCatalogue /> : activeMenu === 'settings' ? <SettingsWorkspace /> : <RmeModuleWorkspace module={activeMenu} />}</div>;
}
