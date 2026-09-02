import { Inspection, ProductCatalogItem, ExtractedDeclaration, PackageImage, ComplianceCheck, Violation, EvidenceItem } from '../types';

export interface SampleProductTemplate {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  manufacturer: string;
  packer?: string;
  importer?: string;
  address: string;
  netQuantity: string;
  mrp: string;
  unitSalePrice: string;
  mfgDate: string;
  expiryDate: string;
  batch: string;
  consumerCare: string;
  countryOfOrigin: string;
  imageSide1: string;
  imageSide2: string;
  inspectionScenario: 'fully_compliant' | 'violation_font_size' | 'ecommerce_missing_origin' | 'review_usp_ambiguity' | 'potential_nc_consumer_care';
  description: string;
}

export const SAMPLE_PRODUCTS: SampleProductTemplate[] = [
  {
    id: 'PROD-BOOST',
    name: 'Boost Health & Energy Drink (Chocolate)',
    brand: 'Boost',
    category: 'Health & Nutrition',
    subCategory: 'Malt Beverages',
    manufacturer: 'Hindustan Unilever Limited (GSK Consumer Healthcare)',
    address: 'Unilever House, B.D. Sawant Marg, Chakala, Andheri (E), Mumbai - 400099, Maharashtra. Unit: Nabha, Punjab',
    netQuantity: '500 g',
    mrp: '₹ 295.00 (incl. of all taxes)',
    unitSalePrice: '₹ 0.59 / g',
    mfgDate: '10/05/2026',
    expiryDate: '09/05/2027 (12 months from mfg)',
    batch: 'BST-2026-N09',
    consumerCare: 'Consumer Care Cell, Tel: 1800-10-22-221, Email: lever.care@unilever.com, PO Box 14760, Mumbai 400099',
    countryOfOrigin: 'India',
    imageSide1: 'Front Side (PDP)',
    imageSide2: 'Back Side (Statutory Box)',
    inspectionScenario: 'fully_compliant',
    description: 'Nourishing chocolate flavoured malt based beverage jar with mandatory declarations and FSSAI mark.'
  },
  {
    id: 'PROD-001',
    name: 'Maggi 2-Minute Noodles (Masala)',
    brand: 'Maggi',
    category: 'Food',
    subCategory: 'Instant Noodles',
    manufacturer: 'Nestle India Limited',
    address: '100/101, World Trade Centre, Barakhamba Lane, New Delhi - 110001',
    netQuantity: '70 g',
    mrp: '₹ 14.00 (incl. of all taxes)',
    unitSalePrice: '₹ 0.20 / g',
    mfgDate: '12/04/2026',
    expiryDate: '11/01/2027 (9 months from mfg)',
    batch: 'B240598-A',
    consumerCare: 'Toll Free: 1800 103 1947 | Email: wecare@in.nestle.com',
    countryOfOrigin: 'India',
    imageSide1: 'Front Side',
    imageSide2: 'Back Side',
    inspectionScenario: 'violation_font_size',
    description: 'Popular instant noodle pouch with nutritional table and mandatory declarations on reverse.'
  },
  {
    id: 'PROD-002',
    name: 'Tata Salt Vacuum Evaporated Iodised Salt',
    brand: 'Tata Salt',
    category: 'Food',
    subCategory: 'Iodised Salt',
    manufacturer: 'Tata Consumer Products Limited',
    address: '1, Bishop Lefroy Road, Kolkata, West Bengal - 700020',
    netQuantity: '1 kg',
    mrp: '₹ 28.00 (incl. of all taxes)',
    unitSalePrice: '₹ 28.00 / kg',
    mfgDate: '15/03/2026',
    expiryDate: '14/03/2028 (24 months from mfg)',
    batch: 'TS-DEL-984',
    consumerCare: 'Grievance Officer: Tata Consumer Care, Tel: 1800-108-4488, Email: care@tataconsumer.com',
    countryOfOrigin: 'India',
    imageSide1: 'Front Side',
    imageSide2: 'Back Side',
    inspectionScenario: 'fully_compliant',
    description: '1kg laminated pouch with full compliance markings and clear FSSAI / Legal Metrology layout.'
  },
  {
    id: 'PROD-003',
    name: 'Surf Excel Matic Front Load Detergent Powder',
    brand: 'Surf Excel',
    category: 'Household',
    subCategory: 'Laundry Detergent',
    manufacturer: 'Hindustan Unilever Limited (HUL)',
    address: 'Unilever House, B. D. Sawant Marg, Chakala, Andheri (E), Mumbai - 400099',
    netQuantity: '2 kg',
    mrp: '₹ 450.00 (incl. of all taxes)',
    unitSalePrice: '₹ 0.225 / g',
    mfgDate: '01/05/2026',
    expiryDate: '30/04/2028',
    batch: 'HUL-2026-X11',
    consumerCare: 'Toll Free: 1800-10-22-221 | lever.care@unilever.com',
    countryOfOrigin: 'India',
    imageSide1: 'Product Listing PDP',
    imageSide2: 'Specifications Tab',
    inspectionScenario: 'ecommerce_missing_origin',
    description: 'E-commerce listing inspection on major quick commerce platform missing Country of Origin on digital PDP.'
  },
  {
    id: 'PROD-004',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    brand: 'Fortune',
    category: 'Food',
    subCategory: 'Edible Oils',
    manufacturer: 'Adani Wilmar Limited',
    address: 'Fortune House, Near Navrangpura Railway Crossing, Ahmedabad - 380009, Gujarat',
    netQuantity: '1 L (910 g)',
    mrp: '₹ 155.00 (incl. of all taxes)',
    unitSalePrice: '₹ 0.155 / ml',
    mfgDate: '18/04/2026',
    expiryDate: '17/10/2026 (6 months from mfg)',
    batch: 'AWL-OIL-842',
    consumerCare: 'Customer Care Cell: 1800 233 9999 | care@adaniwilmar.in',
    countryOfOrigin: 'India',
    imageSide1: 'Pouch Front',
    imageSide2: 'Pouch Back',
    inspectionScenario: 'review_usp_ambiguity',
    description: 'Refined sunflower edible oil pouch under review for dual volume-to-weight net quantity clarity.'
  },
  {
    id: 'PROD-005',
    name: 'Amul Taaza Homogenised Toned Milk',
    brand: 'Amul',
    category: 'Beverages',
    subCategory: 'Dairy Products',
    manufacturer: 'Gujarat Co-operative Milk Marketing Federation Ltd. (GCMMF)',
    address: 'Amul Dairy Road, Anand - 388001, Gujarat',
    netQuantity: '500 ml',
    mrp: '₹ 27.00 (incl. of all taxes)',
    unitSalePrice: '₹ 0.054 / ml',
    mfgDate: '26/05/2026',
    expiryDate: '25/11/2026 (180 days from mfg)',
    batch: 'AMUL-TZ-041',
    consumerCare: 'Toll Free: 1800 258 3333 | customercare@amul.coop',
    countryOfOrigin: 'India',
    imageSide1: 'Carton Front',
    imageSide2: 'Carton Back',
    inspectionScenario: 'potential_nc_consumer_care',
    description: 'Aseptic milk pack with missing physical postal address in consumer grievances section.'
  }
];

// Helper to generate SVG package illustrations for demo
export function generatePackageSvg(productName: string, brand: string, netQty: string, mrp: string, side: string): string {
  const isBack = side.toLowerCase().includes('back') || side.toLowerCase().includes('spec');
  const isBoost = brand.toLowerCase().includes('boost') || productName.toLowerCase().includes('boost');
  const isSalt = brand.toLowerCase().includes('salt') || productName.toLowerCase().includes('salt');
  const isMilk = brand.toLowerCase().includes('amul') || productName.toLowerCase().includes('milk');

  if (isBack) {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
      <rect width="100%" height="100%" fill="%23fffdf9" stroke="%23cbd5e1" stroke-width="2" rx="4"/>
      <rect x="15" y="15" width="370" height="35" fill="%231e293b" rx="2"/>
      <text x="200" y="38" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff" text-anchor="middle">${brand.toUpperCase()} - STATUTORY DECLARATIONS</text>
      
      <!-- Nutrition Box -->
      <rect x="20" y="60" width="360" height="85" fill="%23f8fafc" stroke="%23e2e8f0" stroke-width="1" rx="2"/>
      <text x="30" y="78" font-family="sans-serif" font-size="10" font-weight="bold" fill="%231e293b">NUTRITIONAL SPECIFICATIONS (Per 100g approx):</text>
      <text x="30" y="98" font-family="sans-serif" font-size="9" fill="%23475569">Energy: 390 kcal | Protein: 7.5 g | Carbohydrate: 76 g | Added Minerals: Iron, Zinc, Vit D</text>
      <text x="30" y="118" font-family="sans-serif" font-size="8.5" fill="%23475569">Ingredients: Cereal Extract, Malted Barley, Milk Solids, Cocoa Powder, Minerals, Vitamins.</text>
      <text x="30" y="134" font-family="sans-serif" font-size="8.5" fill="%2315803d" font-weight="bold">100% VEGETARIAN COMMODITY</text>
      
      <!-- Principal Legal Metrology Declaration Panel -->
      <rect x="20" y="155" width="360" height="265" fill="%23ffffff" stroke="%23334155" stroke-width="1" rx="2"/>
      <rect x="20" y="155" width="360" height="22" fill="%23f1f5f9" rx="2 2 0 0"/>
      <text x="30" y="170" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="%230f172a">STATUTORY DECLARATION PANEL (LEGAL METROLOGY PCR 2011)</text>
      
      <!-- Declarations Lines -->
      <text x="30" y="196" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="%230f172a">Generic Name:</text>
      <text x="135" y="196" font-family="sans-serif" font-size="9.5" fill="%23334155">${productName}</text>

      <text x="30" y="218" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="%230f172a">Net Quantity:</text>
      <text x="135" y="218" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="%231e3a8a">${netQty}</text>
      
      <text x="30" y="240" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="%230f172a">MRP (₹):</text>
      <text x="135" y="240" font-family="sans-serif" font-size="9.5" fill="%23b91c1c" font-weight="bold">${mrp}</text>
      
      <text x="30" y="262" font-family="sans-serif" font-size="9" font-weight="bold" fill="%230f172a">Unit Sale Price:</text>
      <text x="135" y="262" font-family="sans-serif" font-size="9" fill="%23475569">Declared on package</text>
      
      <text x="30" y="284" font-family="sans-serif" font-size="9" font-weight="bold" fill="%230f172a">Mfg Date:</text>
      <text x="135" y="284" font-family="sans-serif" font-size="9" fill="%23475569">10/05/2026</text>
      <text x="230" y="284" font-family="sans-serif" font-size="9" font-weight="bold" fill="%230f172a">Expiry:</text>
      <text x="275" y="284" font-family="sans-serif" font-size="9" fill="%23475569">09/05/2027</text>
      
      <text x="30" y="306" font-family="sans-serif" font-size="9" font-weight="bold" fill="%230f172a">Batch No:</text>
      <text x="135" y="306" font-family="sans-serif" font-size="9" fill="%23475569">BST-2026-N09</text>
      
      <text x="30" y="328" font-family="sans-serif" font-size="9" font-weight="bold" fill="%230f172a">Manufactured By:</text>
      <text x="135" y="328" font-family="sans-serif" font-size="8" fill="%23334155">${brand} Manufacturing Facility,</text>
      <text x="135" y="340" font-family="sans-serif" font-size="8" fill="%23334155">Industrial Area, Registered Entity, India</text>
      
      <text x="30" y="362" font-family="sans-serif" font-size="9" font-weight="bold" fill="%230f172a">Consumer Care:</text>
      <text x="135" y="362" font-family="sans-serif" font-size="8" fill="%23334155">Care Officer: care@${brand.toLowerCase().replace(/\\s+/g, '')}.in | Toll Free: 1800-100-200</text>
      
      <text x="30" y="384" font-family="sans-serif" font-size="9" font-weight="bold" fill="%230f172a">Country of Origin:</text>
      <text x="135" y="384" font-family="sans-serif" font-size="9" font-weight="bold" fill="%2315803d">INDIA</text>
      
      <!-- Barcode area -->
      <rect x="30" y="435" width="170" height="65" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1" rx="2"/>
      <line x1="45" y1="445" x2="45" y2="482" stroke="%23000" stroke-width="2"/>
      <line x1="52" y1="445" x2="52" y2="482" stroke="%23000" stroke-width="1"/>
      <line x1="60" y1="445" x2="60" y2="482" stroke="%23000" stroke-width="3"/>
      <line x1="72" y1="445" x2="72" y2="482" stroke="%23000" stroke-width="2"/>
      <line x1="85" y1="445" x2="85" y2="482" stroke="%23000" stroke-width="4"/>
      <line x1="100" y1="445" x2="100" y2="482" stroke="%23000" stroke-width="1"/>
      <line x1="115" y1="445" x2="115" y2="482" stroke="%23000" stroke-width="3"/>
      <line x1="130" y1="445" x2="130" y2="482" stroke="%23000" stroke-width="2"/>
      <line x1="145" y1="445" x2="145" y2="482" stroke="%23000" stroke-width="3.5"/>
      <line x1="160" y1="445" x2="160" y2="482" stroke="%23000" stroke-width="1.5"/>
      <text x="115" y="492" font-family="monospace" font-size="8.5" text-anchor="middle">8 901030 784512</text>
      
      <!-- FSSAI Emblem -->
      <rect x="220" y="435" width="160" height="65" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1" rx="2"/>
      <text x="300" y="458" font-family="sans-serif" font-size="12" font-weight="bold" fill="%231e3a8a" text-anchor="middle">fssai</text>
      <text x="300" y="476" font-family="sans-serif" font-size="8" fill="%23475569" text-anchor="middle">Lic. No. 10014022003189</text>
      
      <text x="200" y="535" font-family="sans-serif" font-size="8" fill="%2394a3b8" text-anchor="middle">Store in a cool, dry and hygienic place.</text>
    </svg>`;
  }

  // Front Side SVG
  const primaryBg = isBoost ? '%23c2410c' : isSalt ? '%230284c7' : isMilk ? '%232563eb' : '%23eab308';
  const secondaryBg = isBoost ? '%239a3412' : isSalt ? '%230369a1' : isMilk ? '%231d4ed8' : '%23ca8a04';
  const textColor = isBoost || isSalt || isMilk ? '%23ffffff' : '%230f172a';

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
    <rect width="100%" height="100%" fill="${primaryBg}" rx="4" stroke="%23475569" stroke-width="1"/>
    
    <!-- Top Brand Header -->
    <rect x="0" y="0" width="400" height="90" fill="${secondaryBg}"/>
    <text x="200" y="55" font-family="sans-serif" font-size="28" font-weight="bold" fill="%23ffffff" text-anchor="middle" letter-spacing="2">${brand.toUpperCase()}</text>
    
    <!-- Product Graphic Banner -->
    <circle cx="200" cy="220" r="85" fill="%23ffffff" opacity="0.15"/>
    <text x="200" y="215" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23ffffff" text-anchor="middle">${productName.toUpperCase()}</text>
    <text x="200" y="240" font-family="sans-serif" font-size="11" fill="%23fef08a" text-anchor="middle">PREMIUM QUALITY COMMODITY</text>
    
    <!-- Mandatory Green Veg Mark -->
    <rect x="30" y="320" width="26" height="26" fill="%23fff" stroke="%2315803d" stroke-width="1.5" rx="2"/>
    <circle cx="43" cy="333" r="6" fill="%2315803d"/>
    
    <!-- Front Declaration Box -->
    <rect x="20" y="380" width="360" height="150" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1" rx="4"/>
    
    <text x="35" y="415" font-family="sans-serif" font-size="13" font-weight="bold" fill="%230f172a">Net Quantity: <tspan fill="%231e3a8a">${netQty}</tspan></text>
    <text x="35" y="445" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23b91c1c">MRP: ${mrp}</text>
    
    <text x="35" y="475" font-family="sans-serif" font-size="9.5" fill="%23475569">Generic Name: ${productName}</text>
    <text x="35" y="495" font-family="sans-serif" font-size="9" fill="%2364748b">Complies with Legal Metrology (Packaged Commodities) Rules, 2011</text>
    <text x="35" y="515" font-family="sans-serif" font-size="8.5" fill="%2394a3b8">See reverse panel for full manufacturer address, batch code & date.</text>
  </svg>`;
}

export const INITIAL_INSPECTIONS_DATABASE: Inspection[] = [
  {
    id: 'insp-2026-129',
    inspectionNumber: 'INSP-2026-129',
    createdAt: '2026-08-27T10:45:00.000Z',
    updatedAt: '2026-08-27T11:15:00.000Z',
    inspectionType: 'physical',
    productName: 'Maggi 2-Minute Noodles (Masala)',
    brand: 'Maggi',
    category: 'Food',
    subCategory: 'Instant Noodles',
    mrp: '₹ 14.00 (incl. of all taxes)',
    netQuantity: '70 g',
    batchNumber: 'B240598-A',
    manufacturerName: 'Nestle India Limited, New Delhi',
    retailerName: 'Modern Bazaar Supermarket',
    location: 'Connaught Place, New Delhi',
    officerId: 'OFF-DEL-408',
    officerName: 'R. Sharma',
    officerDesignation: 'Enforcement Officer',
    status: 'Potential Non-Compliance',
    overallConfidence: 87,
    images: [
      {
        id: 'img-129-front',
        side: 'front',
        label: 'Front Side (Principal Display Panel)',
        url: generatePackageSvg('Maggi 2-Minute Noodles (Masala)', 'Maggi', '70 g', '₹ 14.00', 'front'),
        capturedAt: '2026-08-27T10:46:12.000Z',
        qualityScore: 94,
        blurScore: 'Low',
        glareScore: 'None',
        lightingScore: 'Optimal',
        textVisibilityScore: 'Crisp',
        boundingBoxes: [
          {
            id: 'box-f-1',
            label: 'Brand Name',
            fieldKey: 'brand_name',
            x: 12,
            y: 22,
            width: 76,
            height: 15,
            confidence: 99,
            detectedText: 'MAGGI 2-MINUTE NOODLES',
            ruleRef: 'Rule 6(1)(b)',
            status: 'pass'
          },
          {
            id: 'box-f-2',
            label: 'Net Quantity',
            fieldKey: 'net_quantity',
            x: 8,
            y: 78,
            width: 42,
            height: 7,
            confidence: 96,
            detectedText: 'Net Qty: 70 g',
            ruleRef: 'Rule 6(1)(c)',
            status: 'pass'
          },
          {
            id: 'box-f-3',
            label: 'MRP Declaration',
            fieldKey: 'mrp',
            x: 52,
            y: 78,
            width: 40,
            height: 7,
            confidence: 88,
            detectedText: 'MRP: ₹ 14.00',
            ruleRef: 'Rule 6(1)(e)',
            status: 'review'
          }
        ]
      },
      {
        id: 'img-129-back',
        side: 'back',
        label: 'Back Side (Statutory Declarations)',
        url: generatePackageSvg('Maggi 2-Minute Noodles (Masala)', 'Maggi', '70 g', '₹ 14.00', 'back'),
        capturedAt: '2026-08-27T10:47:04.000Z',
        qualityScore: 91,
        blurScore: 'Low',
        glareScore: 'Minor',
        lightingScore: 'Optimal',
        textVisibilityScore: 'Crisp',
        boundingBoxes: [
          {
            id: 'box-b-1',
            label: 'Manufacturer Details',
            fieldKey: 'manufacturer_name_address',
            x: 8,
            y: 58,
            width: 84,
            height: 7,
            confidence: 94,
            detectedText: 'Nestle India Ltd, 100/101, World Trade Centre, Barakhamba Lane, New Delhi - 110001',
            ruleRef: 'Rule 6(1)(a)',
            status: 'pass'
          },
          {
            id: 'box-b-2',
            label: 'MRP Font Area',
            fieldKey: 'mrp_font_size',
            x: 8,
            y: 43,
            width: 84,
            height: 6,
            confidence: 86,
            detectedText: 'MRP: ₹ 14.00 (incl. of all taxes)',
            ruleRef: 'Rule 5 & Table I',
            status: 'violation'
          },
          {
            id: 'box-b-3',
            label: 'Consumer Care',
            fieldKey: 'consumer_care',
            x: 8,
            y: 65,
            width: 84,
            height: 5,
            confidence: 90,
            detectedText: 'Email: wecare@in.nestle.com | Toll Free: 1800 103 1947',
            ruleRef: 'Rule 9',
            status: 'review'
          },
          {
            id: 'box-b-4',
            label: 'Country of Origin',
            fieldKey: 'country_of_origin',
            x: 8,
            y: 69,
            width: 45,
            height: 5,
            confidence: 98,
            detectedText: 'Country of Origin: INDIA',
            ruleRef: 'Rule 14',
            status: 'pass'
          }
        ]
      }
    ],
    declarations: [
      {
        id: 'decl-1',
        fieldKey: 'product_name',
        fieldName: 'Product Name',
        detectedValue: 'Maggi 2-Minute Noodles',
        confidence: 98,
        status: 'detected',
        isMandatory: true,
        sideFound: 'front',
        ruleRef: 'Rule 6(1)(b)'
      },
      {
        id: 'decl-2',
        fieldKey: 'manufacturer_name',
        fieldName: 'Manufacturer Name',
        detectedValue: 'Nestle India Limited',
        confidence: 96,
        status: 'detected',
        isMandatory: true,
        sideFound: 'back',
        ruleRef: 'Rule 6(1)(a)'
      },
      {
        id: 'decl-3',
        fieldKey: 'address',
        fieldName: 'Address',
        detectedValue: '100 / 101, World Trade Centre, Barakhamba Lane, New Delhi - 110001',
        confidence: 90,
        status: 'detected',
        isMandatory: true,
        sideFound: 'back',
        ruleRef: 'Rule 6(1)(a)'
      },
      {
        id: 'decl-4',
        fieldKey: 'net_quantity',
        fieldName: 'Net Quantity',
        detectedValue: '70 g',
        confidence: 96,
        status: 'detected',
        isMandatory: true,
        sideFound: 'front',
        ruleRef: 'Rule 6(1)(c)'
      },
      {
        id: 'decl-5',
        fieldKey: 'mrp',
        fieldName: 'MRP',
        detectedValue: '₹ 14.00 (incl. of all taxes)',
        confidence: 95,
        status: 'detected',
        isMandatory: true,
        sideFound: 'back',
        ruleRef: 'Rule 6(1)(e)'
      },
      {
        id: 'decl-6',
        fieldKey: 'date_of_manufacture',
        fieldName: 'Date of Manufacture',
        detectedValue: '12/04/2026',
        confidence: 92,
        status: 'detected',
        isMandatory: true,
        sideFound: 'back',
        ruleRef: 'Rule 6(1)(d)'
      },
      {
        id: 'decl-7',
        fieldKey: 'use_by_date',
        fieldName: 'Use by / Best Before',
        detectedValue: '11/01/2027',
        confidence: 90,
        status: 'detected',
        isMandatory: true,
        sideFound: 'back',
        ruleRef: 'Rule 6(1)(d)'
      },
      {
        id: 'decl-8',
        fieldKey: 'consumer_care',
        fieldName: 'Consumer Care',
        detectedValue: '1800 103 1947 | wecare@in.nestle.com',
        confidence: 89,
        status: 'review',
        isMandatory: true,
        sideFound: 'back',
        ruleRef: 'Rule 9'
      },
      {
        id: 'decl-9',
        fieldKey: 'country_of_origin',
        fieldName: 'Country of Origin',
        detectedValue: 'India',
        confidence: 98,
        status: 'detected',
        isMandatory: true,
        sideFound: 'back',
        ruleRef: 'Rule 14'
      }
    ],
    complianceChecks: [
      {
        checkId: 'chk-1',
        inspectionId: 'insp-2026-129',
        ruleId: 'RULE-6-1-B',
        ruleNumber: 'Rule 6(1)(b)',
        ruleTitle: 'Generic Name Declaration',
        fieldChecked: 'Product Name',
        detectedValue: 'Maggi 2-Minute Noodles',
        expectedCondition: 'Must declare generic name prominently on PDP',
        result: 'COMPLIANT',
        confidence: 98,
        explanation: 'Generic product category is clearly visible in bold lettering on front panel.',
        legalGround: 'Satisfies Rule 6(1)(b) of Legal Metrology (Packaged Commodities) Rules, 2011.',
        recommendation: 'No action required.'
      },
      {
        checkId: 'chk-2',
        inspectionId: 'insp-2026-129',
        ruleId: 'RULE-5',
        ruleNumber: 'Rule 5 & Table I',
        ruleTitle: 'Font Size & Height of Numerals (MRP)',
        fieldChecked: 'MRP Font Height',
        detectedValue: 'Observed font height: 1.4 mm',
        expectedCondition: 'As per Rule 5 & Table I (PDP > 100 cm²), minimum numeral height must be ≥ 2.0 mm',
        result: 'POTENTIAL_NON_COMPLIANCE',
        confidence: 87,
        evidenceId: 'evid-2026-087-01',
        explanation: 'The MRP text numeral height measured via scale is 1.4 mm, which falls below the statutory requirement of 2.0 mm for package area 224 cm².',
        legalGround: 'Contravention of Rule 5 and Rule 7 read with Table I of Legal Metrology (Packaged Commodities) Rules, 2011.',
        recommendation: 'Issue notice under Section 36(1) or flag for compounding under Section 48.'
      },
      {
        checkId: 'chk-3',
        inspectionId: 'insp-2026-129',
        ruleId: 'RULE-9',
        ruleNumber: 'Rule 9',
        ruleTitle: 'Consumer Grievance Physical Address',
        fieldChecked: 'Consumer Care Postal Address',
        detectedValue: 'Email & Toll Free phone detected, postal address omitted',
        expectedCondition: 'Must declare name, address, telephone and email of consumer care cell',
        result: 'REVIEW_REQUIRED',
        confidence: 82,
        evidenceId: 'evid-2026-087-02',
        explanation: 'Consumer care email and phone number are present, but dedicated grievance officer postal address is ambiguous on reverse side.',
        legalGround: 'Rule 9 specifies postal address requirement unless company registered office is explicitly linked.',
        recommendation: 'Officer review required to confirm if registered office address applies.'
      },
      {
        checkId: 'chk-4',
        inspectionId: 'insp-2026-129',
        ruleId: 'RULE-14',
        ruleNumber: 'Rule 14',
        ruleTitle: 'Country of Origin',
        fieldChecked: 'Country of Origin',
        detectedValue: 'India',
        expectedCondition: 'Country of Origin must be explicitly declared',
        result: 'COMPLIANT',
        confidence: 98,
        explanation: 'Country of Origin is clearly stated on back statutory panel.',
        legalGround: 'Complies with Rule 14 and 2020 e-commerce/packaging notifications.',
        recommendation: 'No action required.'
      }
    ],
    violations: [
      {
        violationId: 'VIO-2026-087',
        inspectionId: 'insp-2026-129',
        ruleNumber: 'Rule 5 & Rule 6(1)(e)',
        ruleTitle: 'MRP Font Height Deficit',
        category: 'Font & Numerals',
        severity: 'High',
        finding: 'MRP declaration numeral font size is less than statutory minimum standard (Observed: 1.4mm vs Required: 2.0mm).',
        observedValue: '1.4 mm',
        requiredStandard: 'As per Rule 5 (Table I) - Minimum font size 2.0mm for package area > 100 cm²',
        confidence: 87,
        status: 'Officer Review Required',
        evidenceId: 'evid-2026-087-01',
        sectionReference: 'Section 18 & Section 36(1) of Legal Metrology Act, 2009',
        timestamp: '2026-08-27T10:48:00.000Z'
      }
    ],
    evidenceList: [
      {
        evidenceId: 'evid-2026-087-01',
        inspectionId: 'insp-2026-129',
        violationId: 'VIO-2026-087',
        imageId: 'img-129-back',
        imageUrl: generatePackageSvg('Maggi 2-Minute Noodles (Masala)', 'Maggi', '70 g', '₹ 14.00', 'back'),
        side: 'back',
        label: 'MRP Numeral Region',
        detectedText: 'MRP: ₹ 14.00 (incl. of all taxes)',
        ruleRef: 'Rule 5 & Rule 6(1)(e)',
        confidence: 87,
        pdpAreaCm2: 224,
        measuredFontHeightMm: 1.4,
        requiredFontHeightMm: 2.0,
        contrastRatio: '4.2:1 (Adequate)',
        boundingBox: {
          id: 'box-b-2',
          label: 'MRP Font Area',
          fieldKey: 'mrp_font_size',
          x: 8,
          y: 43,
          width: 84,
          height: 6,
          confidence: 86,
          detectedText: 'MRP: ₹ 14.00 (incl. of all taxes)',
          ruleRef: 'Rule 5 & Table I',
          status: 'violation'
        },
        officerComments: 'Measured under digital optical grid. Font height confirmed at 1.4mm on secondary statutory block.',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'insp-2026-130',
    inspectionNumber: 'INSP-2026-130',
    createdAt: '2026-08-27T14:30:00.000Z',
    updatedAt: '2026-08-27T14:50:00.000Z',
    inspectionType: 'physical',
    productName: 'Boost Health & Energy Drink (Chocolate)',
    brand: 'Boost',
    category: 'Health & Nutrition',
    subCategory: 'Malt Beverages',
    mrp: '₹ 295.00 (incl. of all taxes)',
    netQuantity: '500 g',
    batchNumber: 'BST-2026-N09',
    manufacturerName: 'Hindustan Unilever Limited (GSK Consumer Healthcare), Mumbai',
    retailerName: 'Apollo Pharmacy & Wellness',
    location: 'Lajpat Nagar, New Delhi',
    officerId: 'OFF-DEL-408',
    officerName: 'R. Sharma',
    officerDesignation: 'Enforcement Officer',
    status: 'Compliant',
    overallConfidence: 96,
    images: [
      {
        id: 'img-130-front',
        side: 'front',
        label: 'Front Side (PDP)',
        url: generatePackageSvg('Boost Health & Energy Drink', 'Boost', '500 g', '₹ 295.00', 'front'),
        capturedAt: '2026-08-27T14:31:00.000Z',
        qualityScore: 97,
        blurScore: 'Low',
        glareScore: 'None',
        lightingScore: 'Optimal',
        textVisibilityScore: 'Crisp',
        boundingBoxes: []
      }
    ],
    declarations: [
      {
        id: 'decl-b-1',
        fieldKey: 'product_name',
        fieldName: 'Product Name',
        detectedValue: 'Boost Health & Energy Drink',
        confidence: 99,
        status: 'detected',
        isMandatory: true,
        sideFound: 'front',
        ruleRef: 'Rule 6(1)(b)'
      },
      {
        id: 'decl-b-2',
        fieldKey: 'manufacturer_name',
        fieldName: 'Manufacturer Name',
        detectedValue: 'Hindustan Unilever Limited (GSK Consumer Healthcare)',
        confidence: 98,
        status: 'detected',
        isMandatory: true,
        sideFound: 'back',
        ruleRef: 'Rule 6(1)(a)'
      },
      {
        id: 'decl-b-3',
        fieldKey: 'net_quantity',
        fieldName: 'Net Quantity',
        detectedValue: '500 g',
        confidence: 99,
        status: 'detected',
        isMandatory: true,
        sideFound: 'front',
        ruleRef: 'Rule 6(1)(c)'
      },
      {
        id: 'decl-b-4',
        fieldKey: 'mrp',
        fieldName: 'MRP',
        detectedValue: '₹ 295.00 (incl. of all taxes)',
        confidence: 97,
        status: 'detected',
        isMandatory: true,
        sideFound: 'front',
        ruleRef: 'Rule 6(1)(e)'
      }
    ],
    complianceChecks: [],
    violations: [],
    evidenceList: []
  },
  {
    id: 'insp-2026-128',
    inspectionNumber: 'INSP-2026-128',
    createdAt: '2026-08-27T09:10:00.000Z',
    updatedAt: '2026-08-27T09:35:00.000Z',
    inspectionType: 'physical',
    productName: 'Tata Salt 1kg Vacuum Evaporated',
    brand: 'Tata Salt',
    category: 'Food',
    subCategory: 'Iodised Salt',
    mrp: '₹ 28.00 (incl. of all taxes)',
    netQuantity: '1 kg',
    batchNumber: 'TS-DEL-984',
    manufacturerName: 'Tata Consumer Products Limited, Kolkata',
    retailerName: 'Reliance Smart Superstore',
    location: 'South Extension, New Delhi',
    officerId: 'OFF-DEL-408',
    officerName: 'R. Sharma',
    officerDesignation: 'Enforcement Officer',
    status: 'Compliant',
    overallConfidence: 97,
    images: [],
    declarations: [],
    complianceChecks: [],
    violations: [],
    evidenceList: []
  },
  {
    id: 'insp-2026-127',
    inspectionNumber: 'INSP-2026-127',
    createdAt: '2026-08-26T15:20:00.000Z',
    updatedAt: '2026-08-26T15:55:00.000Z',
    inspectionType: 'ecommerce',
    productName: 'Surf Excel Matic Front Load 2kg',
    brand: 'Surf Excel',
    category: 'Household',
    subCategory: 'Laundry Detergent',
    mrp: '₹ 450.00 (incl. of all taxes)',
    netQuantity: '2 kg',
    manufacturerName: 'Hindustan Unilever Limited, Mumbai',
    retailerName: 'Blinkit Quick-Commerce Fulfillment',
    location: 'Okhla Industrial Area, New Delhi',
    officerId: 'OFF-DEL-412',
    officerName: 'A. Verma',
    officerDesignation: 'Legal Metrology Inspector',
    status: 'Under Review',
    overallConfidence: 89,
    images: [],
    declarations: [],
    complianceChecks: [],
    violations: [],
    evidenceList: []
  },
  {
    id: 'insp-2026-126',
    inspectionNumber: 'INSP-2026-126',
    createdAt: '2026-08-26T11:30:00.000Z',
    updatedAt: '2026-08-26T12:05:00.000Z',
    inspectionType: 'physical',
    productName: 'Fortune Sunlite Sunflower Oil 1L',
    brand: 'Fortune',
    category: 'Food',
    subCategory: 'Edible Oils',
    mrp: '₹ 155.00 (incl. of all taxes)',
    netQuantity: '1 L',
    batchNumber: 'AWL-OIL-842',
    manufacturerName: 'Adani Wilmar Limited, Ahmedabad',
    retailerName: 'Big Bazaar Store',
    location: 'Saket, New Delhi',
    officerId: 'OFF-DEL-408',
    officerName: 'R. Sharma',
    officerDesignation: 'Enforcement Officer',
    status: 'Compliant',
    overallConfidence: 96,
    images: [],
    declarations: [],
    complianceChecks: [],
    violations: [],
    evidenceList: []
  },
  {
    id: 'insp-2026-125',
    inspectionNumber: 'INSP-2026-125',
    createdAt: '2026-08-25T14:10:00.000Z',
    updatedAt: '2026-08-25T14:50:00.000Z',
    inspectionType: 'ecommerce',
    productName: 'Amul Taaza Milk 500ml',
    brand: 'Amul',
    category: 'Beverages',
    subCategory: 'Dairy Products',
    mrp: '₹ 27.00 (incl. of all taxes)',
    netQuantity: '500 ml',
    manufacturerName: 'GCMMF, Anand, Gujarat',
    retailerName: 'Zepto Dark Store',
    location: 'Janakpuri, New Delhi',
    officerId: 'OFF-DEL-408',
    officerName: 'R. Sharma',
    officerDesignation: 'Enforcement Officer',
    status: 'Potential Non-Compliance',
    overallConfidence: 91,
    images: [],
    declarations: [],
    complianceChecks: [],
    violations: [],
    evidenceList: []
  }
];

export const PRODUCT_CATALOG_ITEMS: ProductCatalogItem[] = [
  {
    id: 'CAT-BOOST',
    productName: 'Boost Health & Energy Drink (Chocolate)',
    brand: 'Boost',
    category: 'Health & Nutrition',
    manufacturer: 'Hindustan Unilever Limited (GSK Consumer Healthcare)',
    mrp: '₹ 295.00',
    netQuantity: '500 g',
    lastInspectionDate: '27 May 2026',
    lastInspectionId: 'INSP-2026-130',
    complianceStatus: 'Compliant',
    inspectionCount: 19,
    violationsCount: 0,
    imageUrl: generatePackageSvg('Boost Health & Energy Drink', 'Boost', '500 g', '₹ 295.00', 'front')
  },
  {
    id: 'CAT-001',
    productName: 'Maggi 2-Minute Noodles (Masala)',
    brand: 'Maggi',
    category: 'Food & Instant Noodles',
    manufacturer: 'Nestle India Limited',
    mrp: '₹ 14.00',
    netQuantity: '70 g',
    lastInspectionDate: '27 May 2026',
    lastInspectionId: 'INSP-2026-129',
    complianceStatus: 'Potential Non-Compliance',
    inspectionCount: 14,
    violationsCount: 3,
    imageUrl: generatePackageSvg('Maggi 2-Minute Noodles', 'Maggi', '70 g', '₹ 14.00', 'front')
  },
  {
    id: 'CAT-002',
    productName: 'Tata Salt Vacuum Evaporated Iodised Salt',
    brand: 'Tata Salt',
    category: 'Food & Salt',
    manufacturer: 'Tata Consumer Products Ltd',
    mrp: '₹ 28.00',
    netQuantity: '1 kg',
    lastInspectionDate: '27 May 2026',
    lastInspectionId: 'INSP-2026-128',
    complianceStatus: 'Compliant',
    inspectionCount: 22,
    violationsCount: 0,
    imageUrl: generatePackageSvg('Tata Salt Iodised', 'Tata Salt', '1 kg', '₹ 28.00', 'front')
  },
  {
    id: 'CAT-003',
    productName: 'Surf Excel Matic Front Load Detergent',
    brand: 'Surf Excel',
    category: 'Household & Detergents',
    manufacturer: 'Hindustan Unilever Limited',
    mrp: '₹ 450.00',
    netQuantity: '2 kg',
    lastInspectionDate: '26 May 2026',
    lastInspectionId: 'INSP-2026-127',
    complianceStatus: 'Under Review',
    inspectionCount: 9,
    violationsCount: 1,
    imageUrl: generatePackageSvg('Surf Excel Matic', 'Surf Excel', '2 kg', '₹ 450.00', 'front')
  },
  {
    id: 'CAT-004',
    productName: 'Fortune Sunlite Refined Sunflower Oil',
    brand: 'Fortune',
    category: 'Food & Edible Oils',
    manufacturer: 'Adani Wilmar Limited',
    mrp: '₹ 155.00',
    netQuantity: '1 L',
    lastInspectionDate: '26 May 2026',
    lastInspectionId: 'INSP-2026-126',
    complianceStatus: 'Compliant',
    inspectionCount: 18,
    violationsCount: 0,
    imageUrl: generatePackageSvg('Fortune Sunflower Oil', 'Fortune', '1 L', '₹ 155.00', 'front')
  },
  {
    id: 'CAT-005',
    productName: 'Amul Taaza Homogenised Toned Milk',
    brand: 'Amul',
    category: 'Beverages & Dairy',
    manufacturer: 'GCMMF Anand',
    mrp: '₹ 27.00',
    netQuantity: '500 ml',
    lastInspectionDate: '25 May 2026',
    lastInspectionId: 'INSP-2026-125',
    complianceStatus: 'Potential Non-Compliance',
    inspectionCount: 11,
    violationsCount: 2,
    imageUrl: generatePackageSvg('Amul Taaza Milk', 'Amul', '500 ml', '₹ 27.00', 'front')
  },
  {
    id: 'CAT-006',
    productName: 'Haldirams Nagpur Aloo Bhujia',
    brand: 'Haldirams',
    category: 'Packaged Snacks',
    manufacturer: 'Haldiram Foods International Pvt Ltd',
    mrp: '₹ 45.00',
    netQuantity: '150 g',
    lastInspectionDate: '24 May 2026',
    lastInspectionId: 'INSP-2026-122',
    complianceStatus: 'Compliant',
    inspectionCount: 8,
    violationsCount: 0,
    imageUrl: generatePackageSvg('Haldirams Aloo Bhujia', 'Haldirams', '150 g', '₹ 45.00', 'front')
  },
  {
    id: 'CAT-007',
    productName: 'Dettol Original Germ Protection Soap',
    brand: 'Dettol',
    category: 'Personal Care & Hygiene',
    manufacturer: 'Reckitt Benckiser (India) Pvt Ltd',
    mrp: '₹ 42.00',
    netQuantity: '125 g',
    lastInspectionDate: '23 May 2026',
    lastInspectionId: 'INSP-2026-118',
    complianceStatus: 'Compliant',
    inspectionCount: 15,
    violationsCount: 0,
    imageUrl: generatePackageSvg('Dettol Original Soap', 'Dettol', '125 g', '₹ 42.00', 'front')
  },
  {
    id: 'CAT-008',
    productName: 'Parle-G Gold Glucose Biscuits',
    brand: 'Parle-G',
    category: 'Food & Biscuits',
    manufacturer: 'Parle Products Private Limited',
    mrp: '₹ 10.00',
    netQuantity: '100 g',
    lastInspectionDate: '22 May 2026',
    lastInspectionId: 'INSP-2026-115',
    complianceStatus: 'Compliant',
    inspectionCount: 20,
    violationsCount: 0,
    imageUrl: generatePackageSvg('Parle-G Biscuits', 'Parle-G', '100 g', '₹ 10.00', 'front')
  }
];
