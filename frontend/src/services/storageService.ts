import { Inspection, ProductCatalogItem, Officer } from '../types';
import { INITIAL_INSPECTIONS_DATABASE, PRODUCT_CATALOG_ITEMS } from '../data/mockProducts';

const STORAGE_KEYS = {
  INSPECTIONS: 'sih26034_inspections',
  PRODUCTS: 'sih26034_products',
  OFFICER: 'sih26034_current_officer',
  SETTINGS: 'sih26034_settings',
  FIREBASE_CONFIG: 'sih26034_firebase_config',
};

export class StorageService {
  /**
   * Initialize local repository if empty
   */
  public static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.INSPECTIONS)) {
      localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(INITIAL_INSPECTIONS_DATABASE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(PRODUCT_CATALOG_ITEMS));
    }
  }

  public static getInspections(): Inspection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
      if (!data) return INITIAL_INSPECTIONS_DATABASE;
      return JSON.parse(data);
    } catch {
      return INITIAL_INSPECTIONS_DATABASE;
    }
  }

  public static getInspectionById(id: string): Inspection | undefined {
    const list = this.getInspections();
    return list.find((item) => item.id === id || item.inspectionNumber === id);
  }

  public static saveInspection(inspection: Inspection): void {
    const list = this.getInspections();
    const existingIndex = list.findIndex((item) => item.id === inspection.id || item.inspectionNumber === inspection.inspectionNumber);

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...inspection,
        updatedAt: new Date().toISOString(),
      };
    } else {
      list.unshift(inspection);
    }

    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(list));
    this.updateProductFromInspection(inspection);
  }

  public static getProducts(): ProductCatalogItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) return PRODUCT_CATALOG_ITEMS;
      return JSON.parse(data);
    } catch {
      return PRODUCT_CATALOG_ITEMS;
    }
  }

  public static updateProductFromInspection(inspection: Inspection): void {
    const products = this.getProducts();
    const prod = products.find(
      (p) => p.productName.toLowerCase().includes(inspection.brand.toLowerCase()) ||
             inspection.productName.toLowerCase().includes(p.brand.toLowerCase())
    );

    if (prod) {
      prod.lastInspectionDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      prod.lastInspectionId = inspection.inspectionNumber;
      prod.complianceStatus = inspection.status;
      prod.inspectionCount += 1;
      if (inspection.violations.length > 0) {
        prod.violationsCount += inspection.violations.length;
      }
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
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
      email: 'r.sharma@legalmetrology.gov.in',
      role: 'Enforcement Officer',
    };
  }

  public static setCurrentOfficer(officer: Officer): void {
    localStorage.setItem(STORAGE_KEYS.OFFICER, JSON.stringify(officer));
  }
}

// Auto init on load
StorageService.init();
