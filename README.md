# SIH26034: Government Legal Metrology Inspection Intelligence
## AI-Assisted Compliance & Inspection Platform for Packaged Commodities
**Department of Legal Metrology, Ministry of Consumer Affairs, Food & Public Distribution, Government of India**

---

## 📌 Project Overview & Problem Statement
Under the **Legal Metrology Act, 2009** and the **Legal Metrology (Packaged Commodities) Rules, 2011**, every pre-packaged commodity sold across physical retail stores, supermarkets, wholesale markets, and e-commerce platforms in India is legally mandated to carry statutory declarations (Manufacturer, Packer, Importer, Generic Commodity Name, Net Quantity, MRP inclusive of all taxes, Unit Sale Price, Manufacturing/Packing Date, Expiry/Best Before, Consumer Care details, Country of Origin, and strict minimum numeral height / font-size requirements).

Manual enforcement inspection across millions of retail SKUs and digital marketplace listings is labor-intensive and prone to human oversight.

**SIH26034** is a high-fidelity, production-grade AI-assisted enforcement intelligence platform developed to empower Legal Metrology Officers to:
1. **Capture & Scan Multi-Side Packaging:** Guided 6-side capture (Front PDP, Back Statutory Panel, Left, Right, Top, Bottom) with real-time optical quality feedback (Lighting, Motion Blur, Specular Glare, Text Contrast).
2. **Audit E-Commerce Listings:** Automated extraction and audit of digital product display pages under **Rule 6(10) / Rule 6(11)** (Amazon.in, Flipkart, Blinkit, Zepto, BigBasket, JioMart).
3. **Execute AI OCR & Field Identification:** Neural bounding box detection and Named Entity Recognition (NER) for statutory fields.
4. **Enforce Legal Metrology Rule Matrix:** Comprehensive automated verification against **Rules 4, 5, 6(1)(a)-(f), 6(2), 6(10), 6(11), 7, 9, 14, 18, 23, 27** and Schedules I & II.
5. **Measure Font Size & PDP Placement:** Digital millimeter caliper scale calculation of numeral heights against Schedule Table I thresholds.
6. **Manage Violations & Optical Evidence:** Interactive evidence viewer with zoom/pan, toggleable bounding boxes, loupe tool, and statutory citation.
7. **Official Officer Determination:** Authoritative verification portal with officer decision override, statutory remarks, Digital Signature Certificate (DSC), and compounding order (Section 48) / formal notice (Section 36).
8. **Generate Official Reports:** Statutory inspection report with Government Emblem, watermark, QR verification seal, tabular findings, photos embed, and one-click **PDF Download**, **DOCX Export**, and **Print**.

---

## 🏛️ Government Digital Design Language
- **Color Palette:** Crisp White (`#FFFFFF`, `#F8FAFC`) background with warm Government Bronze / Ochre Brown (`#945224` to `#78350F`) brand accents, dark charcoal headings (`#1E293B`, `#0F172A`), restrained green (`#16A34A` for Compliant), amber (`#D97706` for Review), and red (`#DC2626` for Violations).
- **Official Elements:** Top Government Utility Bar (Helpline 1915, Accessibility Text Sizer A-, A, A+, High Contrast Toggle, Hindi/English Switcher, Notice Ticker), Ashoka Pillar Capital Emblem, Officer Badge Cards, and NIC-compliant footer.

---

## 🚀 Technology Stack
- **Frontend:** React 18 / 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti, html2canvas, jsPDF.
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, Uvicorn.
- **Database & Storage Layer:** Modular Firebase / Firestore abstraction + IndexedDB Local Repository fallback.
- **Rules Engine:** Verified Legal Metrology (Packaged Commodities) Rules 2011 codex & 2022/2023 Gazette amendments.

---

## 🛠️ How to Run the Prototype

### 1. Frontend (React + TypeScript)
```bash
cd d:/005/frontend
npm run dev
```
Open your browser at `http://localhost:3000` or `http://localhost:5173`.

### 2. Backend (Optional Python FastAPI Microservice)
```bash
cd d:/005/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

---

## 🌟 Primary Demonstration Journey for Judges & Officers
1. **Officer Login:** Sign in as `R. Sharma (Enforcement Officer)` with DSC credentials or Government SSO.
2. **Enforcement Dashboard:** View 5 KPI cards, daily inspection trends, violation categories donut, and recent audit logs.
3. **Initiate New Inspection:** Choose *Physical Package Inspection* or *E-Commerce Listing Audit*. Select preset sample (e.g. `Maggi 2-Minute Noodles` or `Tata Salt`).
4. **Guided 6-Side Scanner:** Experience live alignment reticle and optical quality checks across Front, Back, and Side panels.
5. **AI Pipeline Execution:** Watch real-time multi-stage preprocessing, OCR extraction, and rule matrix matching.
6. **Declaration Verification:** Interactive split screen with bounding boxes and inline field editing.
7. **Compliance Assessment:** Detailed rule matrix with *Why Flagged?* legal explanation drawer.
8. **Optical Font Size & PDP Placement:** Examine the digital millimeter optical ruler showing numeral height deficit against Schedule Table I.
9. **Violations Triage & Evidence Viewer:** Zoom and pan high-resolution optical evidence with officer acceptance controls.
10. **Officer Verification & DSC Stamp:** Select statutory determination (e.g. Non-Compliant / Compoundable Notice under Sec 48).
11. **Official Report Generation:** Export official PDF / DOCX notice with Ashoka Emblem, QR verification, and photographic attachments.
12. **Inspect History & Regulatory Codex:** Search through 128+ historical inspections and the complete Rules & Amendments repository.

---

## 🌐 1-Click Deployment Guide

### Option 1: Vercel (Instant Cloud Hosting)
1. Visit [vercel.com/new](https://vercel.com/new).
2. Import GitHub repository: `kamalsuresh005-wq/InspectIQ005`.
3. In Project Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. Vercel will automatically build and assign a free HTTPS domain.

### Option 2: Docker & Docker Compose (Cloud / VPS / On-Premises)
Run both the frontend and backend microservices with one command:
```bash
docker-compose up --build -d
```
- **Frontend App:** `http://<server-ip>:3000`
- **Backend API:** `http://<server-ip>:8000`

### Option 3: Mobile PWA (Field Officers' Smartphones)
1. Open the deployed HTTPS URL in Google Chrome (Android) or Safari (iOS).
2. Tap the browser menu `⋮` / Share `⎋` and select **"Install App"** / **"Add to Home Screen"**.
3. InspectIQ installs with a native app icon and runs fullscreen with hardware camera and GPS integration.

---

*InspectIQ • Smart India Hackathon 2026 • Legal Metrology Field Inspection Intelligence*
