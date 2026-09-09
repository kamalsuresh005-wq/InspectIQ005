# InspectIQ: Legal Metrology Packaged Commodity Inspection System
## Digital Field Inspection & Compliance Enforcement System
**Department of Legal Metrology, Ministry of Consumer Affairs, Food & Public Distribution, Government of India**

---

## 📌 Project Overview
Under the **Legal Metrology Act, 2009** and the **Legal Metrology (Packaged Commodities) Rules, 2011**, pre-packaged commodities sold across retail establishments, wholesale markets, warehouses, and e-commerce distribution centers in India are legally mandated to carry statutory declarations (Manufacturer, Packer, Importer, Generic Commodity Name, Net Quantity, MRP inclusive of all taxes, Unit Sale Price, Manufacturing/Packing Date, Consumer Care details, Country of Origin, and strict minimum numeral height / font-size requirements).

InspectIQ is a mobile-first, structured digital inspection system designed for Legal Metrology Officers conducting field surveillance and regulatory inspections.

### Core Operating Principle
```
OCR EXTRACTS
RULES VALIDATE
EVIDENCE SUPPORTS
OFFICER DECIDES
```

InspectIQ is **not an AI application**. It is a deterministic, evidence-backed inspection system where:
- **OCR extracts** printed declarations from package images.
- **OpenCV assists** image and readability processing.
- The **Python rule engine validates** applicable Legal Metrology requirements.
- **Evidence is attached** to statutory findings.
- The **officer reviews** the results.
- The **officer makes the final decision**.
- The system **generates the formal inspection record**.

---

## 🏛️ InspectIQ Design System
- **Deep Navy:** `#12304A` (Primary brand & key actions)
- **Navy:** `#0B2239` (Deep background & contrast elements)
- **Teal:** `#0F766E` (Secondary accent & statutory highlights)
- **Light Teal:** `#E6F4F1` (Subtle indicators & successful badges)
- **Amber:** `#D97706` (Review & caution flags)
- **Background:** `#F4F7FA` (Neutral field-optimized surface)
- **Surface:** `#FFFFFF` (Card surfaces)
- **Text:** `#17212B` (High contrast text)
- **Secondary Text:** `#52616F` (Sub-labels & metadata)
- **Border:** `#D9E1E8` (Clean card dividers)
- **Status Colors:** Pass `#15803D`, Warning `#B45309`, Danger `#B91C1C`, Info `#2563EB`
- **Typography:** Android: Roboto, iOS: SF Pro, Cross-platform: Inter/System

---

## 🚀 Technology Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend:** Python, FastAPI, Pydantic.
- **OCR Engine:** Tesseract OCR.
- **Image Processing:** OpenCV.
- **Compliance:** Python Legal Metrology Rule Engine (PCR 2011).
- **Database:** MongoDB.
- **Location & Premises:** GPS coordinates + Pluggable Reverse Geocoding Service Abstraction.
- **Reporting:** Formal PDF / Print Statutory Reports.

---

## 📱 Inspection Workflow
```
LOGIN
  ↓
START INSPECTION (PREMISES DETAILS)
  ↓
GPS LOCATION & REVERSE GEOCODING
  ↓
LOCATION CONFIRMATION
  ↓
PACKAGE CAPTURE
  ↓
PRODUCT DETAILS
  ↓
OCR EXTRACTION
  ↓
DECLARATION VERIFICATION
  ↓
READABILITY ANALYSIS
  ↓
RULE VALIDATION
  ↓
COMPLIANCE FINDINGS & EVIDENCE
  ↓
OFFICER REVIEW & DECISION
  ↓
FORMAL INSPECTION REPORT
```

---

## 🛠️ Development & Deployment

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 2. Frontend Production Build & Verification
```bash
cd frontend
npm run build
```

### 3. Vercel Cloud Deployment
1. Import GitHub repository: `kamalsuresh005-wq/InspectIQ005`.
2. In Project Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Deploy to generate the production URL.

---

*InspectIQ • Legal Metrology (Packaged Commodities Rules, 2011) Digital Inspection System*
