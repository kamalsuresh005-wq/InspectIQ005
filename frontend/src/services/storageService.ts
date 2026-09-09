import { Inspection, ProductCatalogItem, Officer } from '../types';

const STORAGE_KEYS = {
  INSPECTIONS: 'inspectiq_inspections',
  PRODUCTS: 'inspectiq_products',
  OFFICER: 'inspectiq_current_officer',
  AUTH_SESSION: 'inspectiq_auth_session',
  SETTINGS: 'inspectiq_settings',
};

export class StorageService {
  /**
   * Initialize local repository - clean initial state without fake mock inspections
   */
  public static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.INSPECTIONS)) {
      localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify([]));
    }
  }

  public static getInspections(): Inspection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static getInspectionById(id: string): Inspection | undefined {
    const list = this.getInspections();
    return list.find((item) => item.id === id || item.inspectionNumber === id);
  }

  public static saveInspection(inspection: Inspection): void {
    const list = this.getInspections();
    const existingIndex = list.findIndex(
      (item) => item.id === inspection.id || item.inspectionNumber === inspection.inspectionNumber
    );

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...inspection,
        updatedAt: new Date().toISOString(),
      };
    } else {
      list.unshift(inspection);
    }

    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(list));
  }

  public static getProducts(): ProductCatalogItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static getCurrentOfficer(): Officer {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFICER);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return {
      id: 'OFF-DEL-408',
      name: 'R. Sharma',
      designation: 'Enforcement Officer',
      badgeNumber: 'LM-ENF-7821',
      zone: 'North Zone (HQ)',
      state: 'Delhi (NCT)',
      email: 'r.sharma@inspectiq.legalmetrology.gov.in',
      role: 'Enforcement Officer',
    };
  }

  public static setCurrentOfficer(officer: Officer): void {
    localStorage.setItem(STORAGE_KEYS.OFFICER, JSON.stringify(officer));
  }

  public static getAuthSession(): { officerId: string; email: string; token: string } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return null;
  }

  public static setAuthSession(session: { officerId: string; email: string; token: string }): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  }

  public static clearAuthSession(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }
}

// Auto init on load
StorageService.init();
