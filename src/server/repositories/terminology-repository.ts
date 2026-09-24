import { dbStore, type MasterIcd10Item, type MasterKfaItem } from '@/server/db/data-store';

export class TerminologyRepository {
  static searchIcd10(query: string, limit = 10): MasterIcd10Item[] {
    const q = query.trim().toLowerCase();
    if (!q) return dbStore.masterIcd10.slice(0, limit);

    return dbStore.masterIcd10
      .filter((item) => {
        return (
          item.code.toLowerCase().includes(q) ||
          item.nameId.toLowerCase().includes(q) ||
          item.nameEn.toLowerCase().includes(q)
        );
      })
      .slice(0, limit);
  }

  static searchKfa(query: string, limit = 10): MasterKfaItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return dbStore.masterKfa.slice(0, limit);

    return dbStore.masterKfa
      .filter((item) => {
        return (
          item.kfaCode.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.activeSubstance.toLowerCase().includes(q)
        );
      })
      .slice(0, limit);
  }
}
