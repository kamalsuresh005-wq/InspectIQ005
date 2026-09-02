export interface CatalogueProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  productType: string;
  variant?: string;
  flavour?: string;
  colour?: string;
  packSize: string;
  unit: string;
  mrp: string;
  barcode: string;
  manufacturer: string;
  countryOfOrigin: string;
  commonVisibleText: string[];
}

export const PRODUCT_CATALOGUE: CatalogueProduct[] = [
  // Food & Beverages - Instant Foods & Noodles
  {
    id: 'CAT-IND-001',
    name: 'Instant Noodles (Masala)',
    brand: 'Maggi',
    category: 'Food & Beverages',
    subCategory: 'Instant Foods',
    productType: 'Noodles',
    variant: '2-Minute',
    flavour: 'Masala',
    packSize: '70',
    unit: 'g',
    mrp: '₹ 14.00',
    barcode: '8901058852379',
    manufacturer: 'Nestle India Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['2-Minute', 'Masala', 'Noodles', 'Taste of India', 'Iron Fortified']
  },
  {
    id: 'CAT-IND-002',
    name: 'Atta Noodles',
    brand: 'Maggi',
    category: 'Food & Beverages',
    subCategory: 'Instant Foods',
    productType: 'Noodles',
    variant: 'Nutri-Licious',
    flavour: 'Masala Veggie',
    packSize: '72.5',
    unit: 'g',
    mrp: '₹ 25.00',
    barcode: '8901058865123',
    manufacturer: 'Nestle India Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Atta Noodles', 'Nutri-licious', 'Whole Wheat']
  },
  {
    id: 'CAT-IND-003',
    name: 'YiPPee! Magic Masala Noodles',
    brand: 'Sunfeast',
    category: 'Food & Beverages',
    subCategory: 'Instant Foods',
    productType: 'Noodles',
    variant: 'Magic Masala',
    flavour: 'Spicy Masala',
    packSize: '65',
    unit: 'g',
    mrp: '₹ 14.00',
    barcode: '8901725013722',
    manufacturer: 'ITC Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['YiPPee', 'Non-Sticky', 'Round Block', 'Magic Masala']
  },

  // Food & Beverages - Dairy & Beverages
  {
    id: 'CAT-IND-004',
    name: 'Malted Chocolate Health Drink',
    brand: 'Boost',
    category: 'Food & Beverages',
    subCategory: 'Health Drinks',
    productType: 'Malt Beverage',
    variant: '3x Stamina',
    flavour: 'Chocolate',
    packSize: '500',
    unit: 'g',
    mrp: '₹ 295.00',
    barcode: '8901030704988',
    manufacturer: 'Hindustan Unilever Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Boost', 'Secret of my energy', '3x Stamina', 'Chocolate']
  },
  {
    id: 'CAT-IND-005',
    name: 'Classic Malt Beverage Jar',
    brand: 'Horlicks',
    category: 'Food & Beverages',
    subCategory: 'Health Drinks',
    productType: 'Malt Drink',
    variant: 'Classic Malt',
    flavour: 'Malt',
    packSize: '500',
    unit: 'g',
    mrp: '₹ 280.00',
    barcode: '8901030705121',
    manufacturer: 'Hindustan Unilever Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Horlicks', 'Taller Stronger Sharper', 'Classic Malt']
  },
  {
    id: 'CAT-IND-006',
    name: 'Taaza Homogenised Toned Milk',
    brand: 'Amul',
    category: 'Food & Beverages',
    subCategory: 'Dairy',
    productType: 'Toned Milk',
    variant: 'Long Life UHT',
    packSize: '1',
    unit: 'L',
    mrp: '₹ 72.00',
    barcode: '8901262010156',
    manufacturer: 'Gujarat Cooperative Milk Marketing Federation Ltd (GCMMF)',
    countryOfOrigin: 'India',
    commonVisibleText: ['Amul', 'Taaza', 'Toned Milk', 'UHT Treated', 'Pure Milk']
  },

  // Food & Beverages - Staples & Edible Oils
  {
    id: 'CAT-IND-007',
    name: 'Vacuum Evaporated Iodised Salt',
    brand: 'Tata Salt',
    category: 'Food & Beverages',
    subCategory: 'Staples & Spices',
    productType: 'Edible Salt',
    variant: 'Vacuum Evaporated',
    packSize: '1',
    unit: 'kg',
    mrp: '₹ 28.00',
    barcode: '8901030800017',
    manufacturer: 'Tata Consumer Products Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Tata Salt', 'Desh Ka Namak', 'Iodised Salt', 'Vacuum Evaporated']
  },
  {
    id: 'CAT-IND-008',
    name: 'Sunlite Refined Sunflower Oil',
    brand: 'Fortune',
    category: 'Food & Beverages',
    subCategory: 'Edible Oils',
    productType: 'Refined Oil',
    variant: 'Sunlite',
    packSize: '1',
    unit: 'L',
    mrp: '₹ 165.00',
    barcode: '8906007280145',
    manufacturer: 'Adani Wilmar Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Fortune', 'Sunlite', 'Refined Sunflower Oil', 'Vitamin A & D']
  },
  {
    id: 'CAT-IND-009',
    name: 'Sharbati Whole Wheat Atta',
    brand: 'Aashirvaad',
    category: 'Food & Beverages',
    subCategory: 'Flours & Grains',
    productType: 'Wheat Flour',
    variant: 'Select Sharbati',
    packSize: '5',
    unit: 'kg',
    mrp: '₹ 320.00',
    barcode: '8901725181148',
    manufacturer: 'ITC Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Aashirvaad', 'Select Atta', '100% MP Sharbati', 'Whole Wheat']
  },

  // Food & Beverages - Snacks & Biscuits
  {
    id: 'CAT-IND-010',
    name: 'Original Glucose Biscuits',
    brand: 'Parle-G',
    category: 'Food & Beverages',
    subCategory: 'Biscuits & Cookies',
    productType: 'Glucose Biscuit',
    variant: 'Original',
    packSize: '130',
    unit: 'g',
    mrp: '₹ 10.00',
    barcode: '8901719101015',
    manufacturer: 'Parle Products Pvt. Ltd.',
    countryOfOrigin: 'India',
    commonVisibleText: ['Parle-G', 'Glucose Biscuits', 'G for Genius']
  },
  {
    id: 'CAT-IND-011',
    name: 'Bhujia Sev Spicy Gram Flour Snack',
    brand: 'Haldiram',
    category: 'Food & Beverages',
    subCategory: 'Namkeen & Snacks',
    productType: 'Namkeen',
    variant: 'Bhujia Sev',
    packSize: '400',
    unit: 'g',
    mrp: '₹ 110.00',
    barcode: '8904004400122',
    manufacturer: 'Haldiram Snacks Pvt. Ltd.',
    countryOfOrigin: 'India',
    commonVisibleText: ['Haldiram', 'Bhujia', 'Tepary Bean', 'Besan Namkeen']
  },
  {
    id: 'CAT-IND-012',
    name: 'Classic Salted Potato Chips',
    brand: 'Lays',
    category: 'Food & Beverages',
    subCategory: 'Namkeen & Snacks',
    productType: 'Potato Chips',
    variant: 'Classic Salted',
    flavour: 'Salted',
    packSize: '50',
    unit: 'g',
    mrp: '₹ 20.00',
    barcode: '8901491101021',
    manufacturer: 'PepsiCo India Holdings Pvt. Ltd.',
    countryOfOrigin: 'India',
    commonVisibleText: ['Lays', 'Classic Salted', 'Crispy', 'Potato Chips']
  },

  // Personal Care & Hygiene
  {
    id: 'CAT-IND-013',
    name: 'Antiseptic Liquid Disinfectant',
    brand: 'Dettol',
    category: 'Personal Care',
    subCategory: 'Hygiene & First Aid',
    productType: 'Antiseptic Liquid',
    variant: 'Original',
    packSize: '500',
    unit: 'ml',
    mrp: '₹ 215.00',
    barcode: '8901396112014',
    manufacturer: 'Reckitt Benckiser (India) Pvt. Ltd.',
    countryOfOrigin: 'India',
    commonVisibleText: ['Dettol', 'Antiseptic', 'First Aid', 'Chloroxylenol']
  },
  {
    id: 'CAT-IND-014',
    name: 'Total Care Toothpaste',
    brand: 'Colgate',
    category: 'Personal Care',
    subCategory: 'Oral Care',
    productType: 'Toothpaste',
    variant: 'Strong Teeth',
    flavour: 'Mint',
    packSize: '150',
    unit: 'g',
    mrp: '₹ 95.00',
    barcode: '8901314010102',
    manufacturer: 'Colgate-Palmolive (India) Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Colgate', 'Strong Teeth', 'Amino Shakti', 'Dental Care']
  },
  {
    id: 'CAT-IND-015',
    name: 'Pure Coconut Hair Oil',
    brand: 'Parachute',
    category: 'Personal Care',
    subCategory: 'Hair Care',
    productType: 'Coconut Oil',
    variant: '100% Pure',
    packSize: '200',
    unit: 'ml',
    mrp: '₹ 85.00',
    barcode: '8901088011245',
    manufacturer: 'Marico Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Parachute', '100% Pure Coconut Oil', 'Marico']
  },
  {
    id: 'CAT-IND-016',
    name: 'Bathing Soap Bar',
    brand: 'Lifebuoy',
    category: 'Personal Care',
    subCategory: 'Soaps & Sanitizers',
    productType: 'Bathing Bar',
    variant: 'Total 10',
    packSize: '125',
    unit: 'g',
    mrp: '₹ 42.00',
    barcode: '8901030010102',
    manufacturer: 'Hindustan Unilever Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Lifebuoy', 'Total 10', 'Germ Protection', 'Silver Shield']
  },

  // Home Care & Cleaning
  {
    id: 'CAT-IND-017',
    name: 'Matic Front Load Detergent Powder',
    brand: 'Surf Excel',
    category: 'Household Care',
    subCategory: 'Fabric Care',
    productType: 'Washing Powder',
    variant: 'Matic Front Load',
    packSize: '2',
    unit: 'kg',
    mrp: '₹ 450.00',
    barcode: '8901030712396',
    manufacturer: 'Hindustan Unilever Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Surf Excel', 'Matic', 'Front Load', 'Tough Stain Removal']
  },
  {
    id: 'CAT-IND-018',
    name: 'Dishwash Bar with Lemon',
    brand: 'Vim',
    category: 'Household Care',
    subCategory: 'Dishwashing',
    productType: 'Dishwash Bar',
    variant: 'Lemon Power',
    flavour: 'Lemon',
    packSize: '300',
    unit: 'g',
    mrp: '₹ 30.00',
    barcode: '8901030045123',
    manufacturer: 'Hindustan Unilever Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Vim', 'Dishwash Bar', '100 Lemons Power', 'Degreasing']
  },
  {
    id: 'CAT-IND-019',
    name: 'Disinfectant Floor Cleaner',
    brand: 'Lizol',
    category: 'Household Care',
    subCategory: 'Surface Cleaners',
    productType: 'Floor Cleaner',
    variant: 'Citrus',
    flavour: 'Citrus',
    colour: 'Yellow',
    packSize: '500',
    unit: 'ml',
    mrp: '₹ 110.00',
    barcode: '8901396340127',
    manufacturer: 'Reckitt Benckiser (India) Pvt. Ltd.',
    countryOfOrigin: 'India',
    commonVisibleText: ['Lizol', 'Disinfectant Floor Cleaner', '10x Better Cleaning', 'Kills 99.9% Germs']
  },
  {
    id: 'CAT-IND-020',
    name: 'All-in-One Air Freshener Pocket',
    brand: 'Godrej aer',
    category: 'Household Care',
    subCategory: 'Air Fresheners',
    productType: 'Fragrance Gel Pocket',
    variant: 'Misty Meadows',
    flavour: 'Meadow',
    packSize: '10',
    unit: 'g',
    mrp: '₹ 55.00',
    barcode: '8901023023456',
    manufacturer: 'Godrej Consumer Products Limited',
    countryOfOrigin: 'India',
    commonVisibleText: ['Godrej aer', 'pocket', 'bathroom fragrance', 'Misty Meadows']
  }
];

export function searchCatalogue(query: string): CatalogueProduct[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  // Exact matching first
  const exact = PRODUCT_CATALOGUE.filter(p => 
    p.name.toLowerCase() === clean ||
    p.brand.toLowerCase() === clean ||
    p.barcode === clean
  );

  // Partial / broad matching
  const partial = PRODUCT_CATALOGUE.filter(p => {
    if (exact.some(e => e.id === p.id)) return false;
    const matchName = p.name.toLowerCase().includes(clean);
    const matchBrand = p.brand.toLowerCase().includes(clean);
    const matchCat = p.category.toLowerCase().includes(clean) || p.subCategory.toLowerCase().includes(clean);
    const matchType = p.productType.toLowerCase().includes(clean);
    const matchVariant = p.variant?.toLowerCase().includes(clean);
    const matchBarcode = p.barcode.includes(clean);
    const matchPack = `${p.packSize} ${p.unit}`.toLowerCase().includes(clean) || `${p.packSize}${p.unit}`.toLowerCase().includes(clean);
    const matchText = p.commonVisibleText.some(t => t.toLowerCase().includes(clean));
    return matchName || matchBrand || matchCat || matchType || matchVariant || matchBarcode || matchPack || matchText;
  });

  return [...exact, ...partial];
}
