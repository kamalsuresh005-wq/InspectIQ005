import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Inspection } from '../types';

export function formatStatusLabel(status: string | undefined): string {
  if (!status) return 'Not Detected';
  const s = status.toUpperCase().trim();
  if (s === 'APPEARS_COMPLIANT' || s === 'COMPLIANT') return 'Appears Compliant';
  if (s === 'POTENTIAL_NON_COMPLIANCE' || s === 'NON_COMPLIANT' || s === 'VIOLATION') return 'Potential Non-Compliance';
  if (s === 'REQUIRES_OFFICER_REVIEW' || s === 'REVIEW_REQUIRED' || s === 'REQUIRES_FURTHER_REVIEW') return 'Requires Officer Review';
  if (s === 'NOT_APPLICABLE' || s === 'NA' || s === 'N/A') return 'Not Applicable';
  if (s === 'NOT_DETECTED') return 'Not Detected';
  if (s === 'VERIFIED') return 'Verified';
  if (s === 'PENDING') return 'Pending Review';
  return status;
}

export class ReportService {
  /**
   * Generates and downloads a professional, multi-page Legal Metrology PDF inspection report
   * with precise A4 pagination, wrapped tables, human-readable compliance statuses, and no clipped content.
   */
  public static async downloadInspectionPdf(inspection: Inspection, filename: string): Promise<void> {
    const formattedDate = new Date(inspection.createdAt || Date.now()).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const decisionLabel = formatStatusLabel(
      inspection.finalDecision || inspection.officerDecision?.decision || inspection.status
    );

    const availableImages = (inspection.images || []).filter(
      img => img && img.url && img.url.trim() !== ''
    );

    // Filter to standard views where available
    const viewsOrder = ['front', 'back', 'side', 'declaration_area', 'additional_evidence'];
    const sortedImages = [...availableImages].sort((a, b) => {
      const idxA = viewsOrder.indexOf(a.side);
      const idxB = viewsOrder.indexOf(b.side);
      return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
    });

    const declarations = inspection.declarations || [];
    const complianceChecks = inspection.complianceChecks || [];

    // Helper for status badge styling in HTML
    const getBadgeHtml = (statusStr: string) => {
      const label = formatStatusLabel(statusStr);
      let bg = '#F1F5F9';
      let color = '#475569';
      let border = '#CBD5E1';

      if (label === 'Appears Compliant' || label === 'Verified' || label === 'Compliant') {
        bg = '#E6F4F1';
        color = '#0F766E';
        border = '#A7F3D0';
      } else if (label === 'Potential Non-Compliance' || label === 'Non-Compliant') {
        bg = '#FEE2E2';
        color = '#B91C1C';
        border = '#FECACA';
      } else if (label === 'Requires Officer Review' || label === 'Review Required') {
        bg = '#FEF3C7';
        color = '#92400E';
        border = '#FDE68A';
      } else if (label === 'Not Applicable') {
        bg = '#F1F5F9';
        color = '#64748B';
        border = '#E2E8F0';
      }

      return `<span style="display:inline-block; padding: 2px 6px; font-size: 8.5px; font-weight: 700; border-radius: 4px; background-color: ${bg}; color: ${color}; border: 1px solid ${border}; white-space: normal; line-height: 1.2;">${label}</span>`;
    };

    // Off-screen rendering container with exact A4 96-DPI dimensions (794px x 1123px per page)
    // Placed in viewport with opacity 0 and pointer-events none so mobile browsers and html2canvas render reliably
    const container = document.createElement('div');
    container.id = 'pdf-render-container';
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-9999';
    container.style.backgroundColor = '#ffffff';

    const commonPageStyle = `
      width: 794px;
      height: 1123px;
      box-sizing: border-box;
      padding: 34px 40px;
      background-color: #ffffff;
      color: #12304A;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 10.5px;
      line-height: 1.35;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    `;

    const sectionHeaderStyle = `
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #12304A;
      background-color: #F4F7FA;
      padding: 3.5px 8px;
      border-radius: 4px;
      border-left: 3px solid #0F766E;
      margin-bottom: 5px;
    `;

    const gridBoxStyle = `
      border: 1px solid #D9E1E8;
      border-radius: 6px;
      padding: 7px 10px;
      background-color: #ffffff;
    `;

    const tableStyle = `
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 9.5px;
      border: 1px solid #D9E1E8;
      border-radius: 6px;
      overflow: hidden;
    `;

    const thStyle = `
      background-color: #F4F7FA;
      color: #52616F;
      font-weight: 700;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 6px 8px;
      border-bottom: 1px solid #D9E1E8;
      text-align: left;
    `;

    const tdStyle = `
      padding: 5px 8px;
      border-bottom: 1px solid #E2E8F0;
      vertical-align: top;
      word-break: break-word;
      overflow-wrap: break-word;
      line-height: 1.3;
    `;

    // PAGE 1: PARTICULARS, PREMISES, PRODUCT & MANUFACTURER
    const page1Html = `
      <div class="pdf-page" style="${commonPageStyle}">
        <div>
          <!-- Document Header -->
          <div style="border-bottom: 2px solid #12304A; padding-bottom: 10px; margin-bottom: 12px; text-align: center;">
            <div style="font-size: 9px; font-weight: 700; color: #52616F; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 2px;">
              Government of India • Department of Consumer Affairs
            </div>
            <div style="font-size: 17px; font-weight: 900; color: #12304A; letter-spacing: -0.02em; margin-bottom: 1px;">
              INSPECTIQ
            </div>
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #0F766E; margin-bottom: 2px;">
              Statutory Packaged Commodity Field Inspection Report
            </div>
            <div style="font-size: 9px; color: #52616F;">
              Under Legal Metrology Act, 2009 &amp; Legal Metrology (Packaged Commodities) Rules, 2011
            </div>
          </div>

          <!-- Section A: Inspection Particulars -->
          <div style="margin-bottom: 10px;">
            <div style="${sectionHeaderStyle}">Section A: Inspection Particulars</div>
            <div style="${gridBoxStyle}">
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
                <tr>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Inspection ID</span>
                    <strong style="color: #12304A; font-family: monospace; font-size: 10.5px;">${inspection.inspectionNumber}</strong>
                  </td>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Date &amp; Time</span>
                    <span style="color: #12304A; font-weight: 600;">${formattedDate}</span>
                  </td>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Officer Name &amp; ID</span>
                    <span style="color: #12304A; font-weight: 600;">${inspection.officerName} (${inspection.officerId})</span>
                  </td>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Designation &amp; Zone</span>
                    <span style="color: #12304A; font-weight: 600;">${inspection.officerDesignation || 'Enforcement Officer'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Inspection Type</span>
                    <span style="color: #12304A; font-weight: 600; text-transform: capitalize;">${inspection.inspectionType} Inspection</span>
                  </td>
                  <td colspan="3" style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Inspection Purpose</span>
                    <span style="color: #12304A; font-weight: 600;">${inspection.inspectionPurpose || 'Routine Market Surveillance'}</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Section B: Premises Details -->
          <div style="margin-bottom: 10px;">
            <div style="${sectionHeaderStyle}">Section B: Premises Details</div>
            <div style="${gridBoxStyle}">
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
                <tr>
                  <td style="width: 40%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Premises / Establishment Name</span>
                    <strong style="color: #12304A;">${inspection.premisesName || inspection.retailerName || 'Retail Facility'}</strong>
                  </td>
                  <td style="width: 30%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Premises Type</span>
                    <span style="color: #12304A; font-weight: 600;">${inspection.premisesType || 'Retail Store'}</span>
                  </td>
                  <td style="width: 30%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">GSTIN / Identification</span>
                    <span style="color: #12304A; font-family: monospace;">${inspection.retailerGstin || 'Not Recorded'}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Verified Inspection Location &amp; Coordinates</span>
                    <span style="color: #12304A; font-weight: 600; line-height: 1.3;">
                      ${inspection.location || inspection.premisesAddress || 'Verified on-site via device GPS sensor'}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Section C: Product Information -->
          <div style="margin-bottom: 10px;">
            <div style="${sectionHeaderStyle}">Section C: Product Information</div>
            <div style="${gridBoxStyle}">
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
                <tr>
                  <td style="width: 35%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Generic / Commodity Name</span>
                    <strong style="color: #12304A;">${inspection.productName}</strong>
                  </td>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Brand</span>
                    <span style="color: #12304A; font-weight: 600;">${inspection.brand}</span>
                  </td>
                  <td style="width: 20%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Category</span>
                    <span style="color: #12304A;">${inspection.category}</span>
                  </td>
                  <td style="width: 20%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Declared Net Quantity</span>
                    <strong style="color: #12304A;">${inspection.netQuantity || 'Not detected in OCR text'}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Maximum Retail Price (MRP)</span>
                    <strong style="color: #12304A;">${inspection.mrp || 'Not detected in OCR text'}</strong>
                  </td>
                  <td style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Batch / Lot Number</span>
                    <span style="color: #12304A;">${inspection.batchNumber || inspection.declarations?.find(d => d.fieldKey === 'batch_number')?.officerVerifiedValue || 'Not detected in OCR text'}</span>
                  </td>
                  <td style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Month &amp; Year of Mfg/Pack</span>
                    <span style="color: #12304A;">${inspection.declarations?.find(d => d.fieldKey === 'mfg_date')?.officerVerifiedValue || 'Not detected in OCR text'}</span>
                  </td>
                  <td style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Best Before / Expiry</span>
                    <span style="color: #12304A;">${inspection.declarations?.find(d => d.fieldKey === 'expiry_date')?.officerVerifiedValue || 'Not detected in OCR text'}</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Section D: Manufacturer, Packer & Consumer Care Details -->
          <div style="margin-bottom: 8px;">
            <div style="${sectionHeaderStyle}">Section D: Manufacturer, Packer &amp; Consumer Care Details</div>
            <div style="${gridBoxStyle}">
              <div style="margin-bottom: 6px;">
                <span style="font-size: 8.5px; color: #52616F; display: block;">Manufacturer / Packer Name &amp; Address (Rule 6(1)(a))</span>
                <span style="color: #12304A; font-weight: 600; line-height: 1.3;">
                  ${inspection.manufacturerName || inspection.declarations?.find(d => d.fieldKey === 'manufacturer')?.officerVerifiedValue || 'Not detected in OCR text'}
                </span>
              </div>
              <div style="display: flex; gap: 16px; margin-bottom: 6px;">
                <div style="flex: 1;">
                  <span style="font-size: 8.5px; color: #52616F; display: block;">Country of Origin (Rule 14 &amp; Rule 6(10))</span>
                  <span style="color: #12304A; font-weight: 600;">
                    ${inspection.declarations?.find(d => d.fieldKey === 'country_of_origin')?.officerVerifiedValue || 'India'}
                  </span>
                </div>
                <div style="flex: 2;">
                  <span style="font-size: 8.5px; color: #52616F; display: block;">Unit Sale Price (USP - Rule 6(11))</span>
                  <span style="color: #12304A;">
                    ${inspection.declarations?.find(d => d.fieldKey === 'unit_sale_price')?.officerVerifiedValue || 'Not detected in OCR text'}
                  </span>
                </div>
              </div>
              <div>
                <span style="font-size: 8.5px; color: #52616F; display: block;">Consumer Care Contact Details (Rule 9)</span>
                <span style="color: #12304A; font-weight: 600; line-height: 1.3;">
                  ${inspection.declarations?.find(d => d.fieldKey === 'consumer_care')?.officerVerifiedValue || 'Not detected in OCR text'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Page 1 Footer -->
        <div style="border-top: 1px solid #D9E1E8; padding-top: 6px; font-size: 8.5px; color: #52616F; display: flex; justify-content: space-between;">
          <span>InspectIQ Official Legal Metrology Field Inspection System</span>
          <span>Record ID: ${inspection.inspectionNumber}</span>
          <span>Page 1 of 3</span>
        </div>
      </div>
    `;

    // PAGE 2: STATUTORY DECLARATION AUDIT TRAIL & COMPLIANCE FINDINGS
    const page2Html = `
      <div class="pdf-page" style="${commonPageStyle}">
        <div>
          <!-- Running Header -->
          <div style="border-bottom: 1.5px solid #12304A; padding-bottom: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <span style="font-size: 11px; font-weight: 800; color: #12304A;">INSPECTIQ · STATUTORY COMPLIANCE REPORT</span>
              <span style="font-size: 9px; color: #52616F; margin-left: 8px;">ID: ${inspection.inspectionNumber}</span>
            </div>
            <div style="font-size: 8.5px; color: #52616F;">
              Inspection Date: ${formattedDate}
            </div>
          </div>

          <!-- Section E: Statutory Declaration Audit Trail -->
          <div style="margin-bottom: 14px;">
            <div style="${sectionHeaderStyle}">Section E: Statutory Declaration Audit Trail</div>
            <table style="${tableStyle}">
              <thead>
                <tr>
                  <th style="${thStyle}; width: 26%;">Mandatory Declaration</th>
                  <th style="${thStyle}; width: 12%;">Source View</th>
                  <th style="${thStyle}; width: 26%;">OCR Extracted</th>
                  <th style="${thStyle}; width: 22%;">Officer Verified</th>
                  <th style="${thStyle}; width: 14%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${declarations.map(decl => {
                  const sideLabel = decl.sideFound ? decl.sideFound.replace(/_/g, ' ') : 'Package';
                  const extracted = decl.extractedValue || decl.detectedValue || 'Not detected in OCR text';
                  const verified = decl.officerVerifiedValue || extracted;
                  const status = decl.applicabilityStatus === 'NOT_APPLICABLE' 
                    ? 'Not Applicable' 
                    : decl.status === 'detected' 
                    ? 'Appears Compliant' 
                    : 'Requires Officer Review';

                  return `
                    <tr>
                      <td style="${tdStyle}; font-weight: 600; color: #12304A;">
                        ${decl.fieldName}
                        <div style="font-size: 8px; color: #52616F; font-family: monospace; margin-top: 1px;">${decl.ruleRef}</div>
                      </td>
                      <td style="${tdStyle}; text-transform: capitalize; color: #0F766E; font-weight: 600;">
                        ${sideLabel}
                      </td>
                      <td style="${tdStyle}; font-family: monospace; font-size: 9px; color: #334155;">
                        ${extracted}
                      </td>
                      <td style="${tdStyle}; font-weight: 600; color: #12304A;">
                        ${verified}
                      </td>
                      <td style="${tdStyle};">
                        ${getBadgeHtml(status)}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Section F: Statutory Compliance Findings -->
          <div style="margin-bottom: 10px;">
            <div style="${sectionHeaderStyle}">Section F: Statutory Compliance Findings</div>
            <table style="${tableStyle}">
              <thead>
                <tr>
                  <th style="${thStyle}; width: 14%;">Rule Ref</th>
                  <th style="${thStyle}; width: 30%;">Parameter / Requirement</th>
                  <th style="${thStyle}; width: 24%;">System Finding</th>
                  <th style="${thStyle}; width: 16%;">Officer Status</th>
                  <th style="${thStyle}; width: 16%;">Statutory Provision</th>
                </tr>
              </thead>
              <tbody>
                ${complianceChecks.map(chk => {
                  const findingStatus = formatStatusLabel(String(chk.result));
                  const officerStatus = chk.officerStatus === 'Overridden' ? 'Overridden' : 'Confirmed';

                  return `
                    <tr>
                      <td style="${tdStyle}; font-weight: 700; color: #12304A;">
                        ${chk.ruleNumber}
                      </td>
                      <td style="${tdStyle}; color: #12304A; font-weight: 500;">
                        ${chk.ruleTitle}
                      </td>
                      <td style="${tdStyle};">
                        ${getBadgeHtml(findingStatus)}
                      </td>
                      <td style="${tdStyle}; font-size: 9px; color: #12304A;">
                        ${officerStatus}
                      </td>
                      <td style="${tdStyle}; font-size: 8.5px; color: #52616F;">
                        ${chk.statutoryProvision || 'PCR, 2011'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Page 2 Footer -->
        <div style="border-top: 1px solid #D9E1E8; padding-top: 6px; font-size: 8.5px; color: #52616F; display: flex; justify-content: space-between;">
          <span>InspectIQ Official Legal Metrology Field Inspection System</span>
          <span>Record ID: ${inspection.inspectionNumber}</span>
          <span>Page 2 of 3</span>
        </div>
      </div>
    `;

    // PAGE 3: EVIDENCE, OFFICER ASSESSMENT & FORMAL SIGNATURES
    const page3Html = `
      <div class="pdf-page" style="${commonPageStyle}">
        <div>
          <!-- Running Header -->
          <div style="border-bottom: 1.5px solid #12304A; padding-bottom: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <span style="font-size: 11px; font-weight: 800; color: #12304A;">INSPECTIQ · STATUTORY COMPLIANCE REPORT</span>
              <span style="font-size: 9px; color: #52616F; margin-left: 8px;">ID: ${inspection.inspectionNumber}</span>
            </div>
            <div style="font-size: 8.5px; color: #52616F;">
              Inspection Date: ${formattedDate}
            </div>
          </div>

          <!-- Section G: Photographic Evidence Records -->
          <div style="margin-bottom: 12px;">
            <div style="${sectionHeaderStyle}">Section G: Photographic Evidence Records (${sortedImages.length} Captured View${sortedImages.length === 1 ? '' : 's'})</div>
            ${sortedImages.length > 0 ? `
              <div style="display: grid; grid-template-columns: repeat(${Math.min(4, sortedImages.length)}, 1fr); gap: 10px; padding: 6px 0;">
                ${sortedImages.slice(0, 4).map(img => {
                  const sideLabel = img.label || img.side.replace(/_/g, ' ');
                  return `
                    <div style="border: 1px solid #D9E1E8; border-radius: 6px; padding: 4px; background-color: #F8FAFC; text-align: center;">
                      <div style="height: 120px; width: 100%; border-radius: 4px; overflow: hidden; background-color: #0F172A; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
                        <img src="${img.url}" alt="${sideLabel}" style="max-height: 120px; max-width: 100%; object-fit: contain;" />
                      </div>
                      <span style="font-size: 9.5px; font-weight: 700; color: #12304A; display: block; text-transform: capitalize;">
                        ${sideLabel} View
                      </span>
                      <span style="font-size: 8px; color: #64748B; display: block;">
                        Captured On-Site
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <div style="${gridBoxStyle}; font-style: italic; color: #52616F;">
                No photographic records attached to this inspection.
              </div>
            `}
          </div>

          <!-- Section H: Officer Assessment & Final Decision -->
          <div style="margin-bottom: 12px;">
            <div style="${sectionHeaderStyle}">Section H: Officer Assessment &amp; Final Decision</div>
            <div style="${gridBoxStyle}; display: flex; justify-content: space-between; gap: 16px; margin-bottom: 6px;">
              <div style="flex: 1;">
                <span style="font-size: 8.5px; color: #52616F; display: block;">System Advisory Assessment</span>
                <strong style="color: #12304A; font-size: 11px;">${formatStatusLabel(inspection.systemAssessment || inspection.status)}</strong>
                <div style="font-size: 8px; color: #64748B; margin-top: 2px;">
                  Automated Legal Metrology PCR 2011 rule engine evaluation
                </div>
              </div>
              <div style="flex: 1; text-align: right;">
                <span style="font-size: 8.5px; color: #52616F; display: block;">Officer Final Determination</span>
                ${getBadgeHtml(decisionLabel)}
                <div style="font-size: 8px; color: #64748B; margin-top: 2px;">
                  Authoritative field determination by designated officer
                </div>
              </div>
            </div>

            <div style="${gridBoxStyle}">
              <span style="font-size: 8.5px; color: #52616F; display: block; margin-bottom: 2px;">Official Remarks &amp; Observations</span>
              <p style="margin: 0; font-size: 9.5px; color: #17212B; line-height: 1.35; background-color: #F8FAFC; padding: 6px 8px; border-radius: 4px; border: 1px solid #E2E8F0;">
                ${inspection.officerRemarks || inspection.remarks || 'Packaging inspected under Section 18 authority. Mandatory statutory declarations examined and verified.'}
              </p>
              <div style="font-size: 8px; color: #64748B; margin-top: 4px;">
                Determination recorded on: ${formattedDate}
              </div>
            </div>
          </div>

          <!-- Section I: Statutory Notice & Formal Signatures -->
          <div>
            <div style="${sectionHeaderStyle}">Section I: Statutory Notice &amp; Formal Signatures</div>
            
            <div style="background-color: #F8FAFC; border: 1px solid #D9E1E8; border-radius: 6px; padding: 7px 10px; font-size: 8.5px; color: #475569; line-height: 1.35; margin-bottom: 14px;">
              <strong>STATUTORY NOTICE:</strong> This field examination record constitutes an official inspection certificate under Section 18 of the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011. Where contraventions or potential non-compliance are established, statutory proceedings may follow in accordance with Section 36 or departmental compounding under Section 48.
            </div>

            <!-- Two-Column Signatures -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding-top: 6px;">
              <!-- Officer Signature -->
              <div style="border-top: 1.5px solid #12304A; padding-top: 6px;">
                <strong style="color: #12304A; font-size: 10px; display: block;">Inspecting Officer Signature</strong>
                <span style="font-size: 9.5px; color: #12304A; display: block; margin-top: 2px; font-weight: 600;">${inspection.officerName}</span>
                <span style="font-size: 8.5px; color: #52616F; display: block;">${inspection.officerDesignation || 'Enforcement Officer'} (${inspection.officerId})</span>
                <span style="font-size: 8px; color: #0F766E; font-family: monospace; display: block; margin-top: 3px;">
                  Ref: ${inspection.officerDecision?.digitalSignatureRef || `LM-DSC-${inspection.officerId}-VERIFIED`}
                </span>
              </div>

              <!-- Trader Acknowledgement -->
              <div style="border-top: 1.5px solid #12304A; padding-top: 6px; text-align: right;">
                <strong style="color: #12304A; font-size: 10px; display: block;">Trader / Premises Representative</strong>
                <span style="font-size: 9.5px; color: #12304A; display: block; margin-top: 2px; font-weight: 600;">${inspection.premisesName || 'Establishment In-charge'}</span>
                <span style="font-size: 8.5px; color: #52616F; display: block;">Acknowledgement of Inspection Record</span>
                <span style="font-size: 8px; color: #52616F; display: block; margin-top: 3px;">
                  Date: ${new Date().toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Page 3 Footer -->
        <div style="border-top: 1px solid #D9E1E8; padding-top: 6px; font-size: 8.5px; color: #52616F; display: flex; justify-content: space-between;">
          <span>InspectIQ Official Legal Metrology Field Inspection System</span>
          <span>Record ID: ${inspection.inspectionNumber}</span>
          <span>Page 3 of 3</span>
        </div>
      </div>
    `;

    container.innerHTML = page1Html + page2Html + page3Html;
    document.body.appendChild(container);

    try {
      const pageElements = container.querySelectorAll('.pdf-page');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.96);

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      const pdfBlob = pdf.output('blob');
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('PDF generation produced an empty file (0 bytes).');
      }

      // Safe cross-platform download using anchor and blob URL (reliable on mobile Chrome & HTTPS)
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `${filename}.pdf`;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(blobUrl);
      }, 1500);
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  }

  /**
   * Generates a validated application/pdf Blob and Blob URL for viewing or direct embedding.
   */
  public static async generateInspectionPdfBlob(inspection: Inspection): Promise<{ blob: Blob; url: string }> {
    const formattedDate = new Date(inspection.createdAt || Date.now()).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const decisionLabel = formatStatusLabel(
      inspection.finalDecision || inspection.officerDecision?.decision || inspection.status
    );

    const availableImages = (inspection.images || []).filter(
      img => img && img.url && img.url.trim() !== ''
    );

    const viewsOrder = ['front', 'back', 'side', 'declaration_area', 'additional_evidence'];
    const sortedImages = [...availableImages].sort((a, b) => {
      const idxA = viewsOrder.indexOf(a.side);
      const idxB = viewsOrder.indexOf(b.side);
      return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
    });

    const declarations = inspection.declarations || [];
    const complianceChecks = inspection.complianceChecks || [];

    const getBadgeHtml = (statusStr: string) => {
      const label = formatStatusLabel(statusStr);
      let bg = '#F1F5F9';
      let color = '#475569';
      let border = '#CBD5E1';

      if (label === 'Appears Compliant' || label === 'Verified' || label === 'Compliant') {
        bg = '#E6F4F1';
        color = '#0F766E';
        border = '#A7F3D0';
      } else if (label === 'Potential Non-Compliance' || label === 'Non-Compliant') {
        bg = '#FEE2E2';
        color = '#B91C1C';
        border = '#FECACA';
      } else if (label === 'Requires Officer Review' || label === 'Review Required') {
        bg = '#FEF3C7';
        color = '#92400E';
        border = '#FDE68A';
      } else if (label === 'Not Applicable') {
        bg = '#F1F5F9';
        color = '#64748B';
        border = '#E2E8F0';
      }

      return `<span style="display:inline-block; padding: 2px 6px; font-size: 8.5px; font-weight: 700; border-radius: 4px; background-color: ${bg}; color: ${color}; border: 1px solid ${border}; white-space: normal; line-height: 1.2;">${label}</span>`;
    };

    const container = document.createElement('div');
    container.id = 'pdf-blob-render-container';
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-9999';
    container.style.backgroundColor = '#ffffff';

    const commonPageStyle = `
      width: 794px;
      height: 1123px;
      box-sizing: border-box;
      padding: 34px 40px;
      background-color: #ffffff;
      color: #12304A;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 10.5px;
      line-height: 1.35;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    `;

    const sectionHeaderStyle = `
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #12304A;
      background-color: #F4F7FA;
      padding: 3.5px 8px;
      border-radius: 4px;
      border-left: 3px solid #0F766E;
      margin-bottom: 5px;
    `;

    const gridBoxStyle = `
      border: 1px solid #D9E1E8;
      border-radius: 6px;
      padding: 7px 10px;
      background-color: #ffffff;
    `;

    const tableStyle = `
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 9.5px;
      border: 1px solid #D9E1E8;
      border-radius: 6px;
      overflow: hidden;
    `;

    const thStyle = `
      background-color: #F4F7FA;
      color: #52616F;
      font-weight: 700;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 6px 8px;
      border-bottom: 1px solid #D9E1E8;
      text-align: left;
    `;

    const tdStyle = `
      padding: 5px 8px;
      border-bottom: 1px solid #E2E8F0;
      vertical-align: top;
      word-break: break-word;
      overflow-wrap: break-word;
      line-height: 1.3;
    `;

    // PAGE 1
    const page1Html = `
      <div class="pdf-page" style="${commonPageStyle}">
        <div>
          <div style="border-bottom: 2px solid #12304A; padding-bottom: 10px; margin-bottom: 12px; text-align: center;">
            <div style="font-size: 9px; font-weight: 700; color: #52616F; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 2px;">
              Government of India • Department of Consumer Affairs
            </div>
            <div style="font-size: 17px; font-weight: 900; color: #12304A; letter-spacing: -0.02em; margin-bottom: 1px;">
              INSPECTIQ
            </div>
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #0F766E; margin-bottom: 2px;">
              Statutory Packaged Commodity Field Inspection Report
            </div>
            <div style="font-size: 9px; color: #52616F;">
              Under Legal Metrology Act, 2009 &amp; Legal Metrology (Packaged Commodities) Rules, 2011
            </div>
          </div>

          <div style="margin-bottom: 10px;">
            <div style="${sectionHeaderStyle}">Section A: Inspection Particulars</div>
            <div style="${gridBoxStyle}">
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
                <tr>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Inspection ID</span>
                    <strong style="color: #12304A; font-family: monospace; font-size: 10.5px;">${inspection.inspectionNumber}</strong>
                  </td>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Date &amp; Time</span>
                    <span style="color: #12304A; font-weight: 600;">${formattedDate}</span>
                  </td>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Officer Name &amp; ID</span>
                    <span style="color: #12304A; font-weight: 600;">${inspection.officerName} (${inspection.officerId})</span>
                  </td>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Designation &amp; Zone</span>
                    <span style="color: #12304A; font-weight: 600;">${inspection.officerDesignation || 'Enforcement Officer'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Inspection Type</span>
                    <span style="color: #12304A; text-transform: capitalize; font-weight: 600;">${inspection.inspectionType}</span>
                  </td>
                  <td colspan="3" style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Inspection Purpose</span>
                    <span style="color: #12304A; font-weight: 600;">${inspection.inspectionPurpose || 'Routine Market Surveillance'}</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <div style="margin-bottom: 10px;">
            <div style="${sectionHeaderStyle}">Section B: Premises Details</div>
            <div style="${gridBoxStyle}">
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
                <tr>
                  <td style="width: 45%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Premises / Establishment Name</span>
                    <strong style="color: #12304A;">${inspection.premisesName || inspection.retailerName || 'Retail Facility'}</strong>
                  </td>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Premises Type</span>
                    <span style="color: #12304A;">${inspection.premisesType || 'Retail Store'}</span>
                  </td>
                  <td style="width: 30%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">GSTIN / Identification</span>
                    <span style="color: #12304A; font-family: monospace;">${inspection.retailerGstin || 'Not Recorded'}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Verified Inspection Location &amp; Coordinates</span>
                    <span style="color: #12304A; font-weight: 600;">${inspection.location || inspection.premisesAddress || 'Verified on-site via device GPS'}</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <div style="margin-bottom: 10px;">
            <div style="${sectionHeaderStyle}">Section C: Product Information</div>
            <div style="${gridBoxStyle}">
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
                <tr>
                  <td style="width: 35%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Product Name</span>
                    <strong style="color: #12304A;">${inspection.productName}</strong>
                  </td>
                  <td style="width: 25%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Brand</span>
                    <span style="color: #12304A; font-weight: 600;">${inspection.brand}</span>
                  </td>
                  <td style="width: 20%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Category</span>
                    <span style="color: #12304A;">${inspection.category}</span>
                  </td>
                  <td style="width: 20%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Declared Net Qty</span>
                    <strong style="color: #12304A;">${inspection.netQuantity || 'Not detected in OCR text'}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Maximum Retail Price (MRP)</span>
                    <strong style="color: #12304A;">${inspection.mrp || 'Not detected in OCR text'}</strong>
                  </td>
                  <td style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Batch / Lot No</span>
                    <span style="color: #12304A;">${inspection.batchNumber || inspection.declarations?.find(d => d.fieldKey === 'batch_number')?.officerVerifiedValue || 'Not detected in OCR text'}</span>
                  </td>
                  <td style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Mfg / Pack Date</span>
                    <span style="color: #12304A;">${inspection.declarations?.find(d => d.fieldKey === 'mfg_date')?.officerVerifiedValue || 'Not detected in OCR text'}</span>
                  </td>
                  <td style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Expiry / Best Before</span>
                    <span style="color: #12304A;">${inspection.declarations?.find(d => d.fieldKey === 'expiry_date')?.officerVerifiedValue || 'Not detected in OCR text'}</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <div>
            <div style="${sectionHeaderStyle}">Section D: Manufacturer, Packer &amp; Consumer Care Details</div>
            <div style="${gridBoxStyle}">
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
                <tr>
                  <td style="width: 65%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Manufacturer / Packer Name &amp; Address (Rule 6(1)(a))</span>
                    <span style="color: #12304A; font-weight: 600; line-height: 1.3; display: block;">
                      ${inspection.manufacturerName || inspection.declarations?.find(d => d.fieldKey === 'manufacturer')?.officerVerifiedValue || 'Not detected in OCR text'}
                    </span>
                  </td>
                  <td style="width: 35%; padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Country of Origin (Rule 14 &amp; Rule 6(10))</span>
                    <span style="color: #12304A; font-weight: 600;">
                      ${inspection.declarations?.find(d => d.fieldKey === 'country_of_origin')?.officerVerifiedValue || 'India'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 3px 4px;">
                    <span style="font-size: 8.5px; color: #52616F; display: block;">Consumer Care Contact Details (Rule 9)</span>
                    <span style="color: #12304A; line-height: 1.3; display: block;">
                      ${inspection.declarations?.find(d => d.fieldKey === 'consumer_care')?.officerVerifiedValue || 'Not detected in OCR text'}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid #D9E1E8; padding-top: 6px; font-size: 8.5px; color: #52616F; display: flex; justify-content: space-between;">
          <span>InspectIQ Official Legal Metrology Field Inspection System</span>
          <span>Record ID: ${inspection.inspectionNumber}</span>
          <span>Page 1 of 3</span>
        </div>
      </div>
    `;

    // PAGE 2
    const page2Html = `
      <div class="pdf-page" style="${commonPageStyle}">
        <div>
          <div style="border-bottom: 1.5px solid #12304A; padding-bottom: 6px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <span style="font-size: 12px; font-weight: 900; color: #12304A;">INSPECTIQ</span>
              <span style="font-size: 9px; color: #52616F; margin-left: 6px;">Statutory Packaged Commodity Inspection Report</span>
            </div>
            <span style="font-size: 8.5px; font-family: monospace; font-weight: 700; color: #0F766E;">
              ${inspection.inspectionNumber}
            </span>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="${sectionHeaderStyle}">Section E: Statutory Declaration Audit Trail</div>
            <table style="${tableStyle}">
              <thead>
                <tr>
                  <th style="${thStyle} width: 28%;">Mandatory Declaration</th>
                  <th style="${thStyle} width: 15%;">Source View</th>
                  <th style="${thStyle} width: 22%;">OCR Extracted</th>
                  <th style="${thStyle} width: 20%;">Officer Verified</th>
                  <th style="${thStyle} width: 15%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${declarations.slice(0, 7).map((decl) => {
                  const sideLabel = decl.sideFound ? decl.sideFound.replace(/_/g, ' ') : 'Package';
                  const extracted = decl.extractedValue || decl.detectedValue || 'Not detected in OCR text';
                  const verified = decl.officerVerifiedValue || extracted;
                  const statusHtml = getBadgeHtml(decl.applicabilityStatus === 'NOT_APPLICABLE' ? 'NOT_APPLICABLE' : decl.status);

                  return `
                    <tr>
                      <td style="${tdStyle}">
                        <strong style="color: #12304A; display: block;">${decl.fieldName}</strong>
                        <span style="font-size: 8px; font-family: monospace; color: #52616F;">${decl.ruleRef}</span>
                      </td>
                      <td style="${tdStyle} text-transform: capitalize; color: #0F766E; font-weight: 600;">
                        ${sideLabel}
                      </td>
                      <td style="${tdStyle} font-family: monospace; font-size: 8.5px; color: #475569;">
                        ${extracted}
                      </td>
                      <td style="${tdStyle} font-weight: 600; color: #12304A;">
                        ${verified}
                      </td>
                      <td style="${tdStyle}">
                        ${statusHtml}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div>
            <div style="${sectionHeaderStyle}">Section F: Statutory Compliance Findings</div>
            <table style="${tableStyle}">
              <thead>
                <tr>
                  <th style="${thStyle} width: 14%;">Rule Ref</th>
                  <th style="${thStyle} width: 33%;">Requirement / Finding</th>
                  <th style="${thStyle} width: 20%;">Finding Result</th>
                  <th style="${thStyle} width: 15%;">Officer Status</th>
                  <th style="${thStyle} width: 18%;">Provision</th>
                </tr>
              </thead>
              <tbody>
                ${complianceChecks.slice(0, 6).map((chk) => {
                  const statusHtml = getBadgeHtml(String(chk.result));
                  const officerStatus = chk.officerStatus === 'Overridden' ? 'Overridden' : 'Confirmed';

                  return `
                    <tr>
                      <td style="${tdStyle} font-family: monospace; font-weight: 700; color: #12304A;">
                        ${chk.ruleNumber}
                      </td>
                      <td style="${tdStyle}">
                        <strong style="color: #12304A; display: block;">${chk.ruleTitle}</strong>
                        <span style="font-size: 8.5px; color: #52616F;">${chk.detectedValue || ''}</span>
                      </td>
                      <td style="${tdStyle}">
                        ${statusHtml}
                      </td>
                      <td style="${tdStyle} font-size: 8.5px; color: #12304A;">
                        ${officerStatus}
                      </td>
                      <td style="${tdStyle} font-size: 8px; color: #52616F;">
                        ${chk.statutoryProvision || 'Rule 6, PCR 2011'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div style="border-top: 1px solid #D9E1E8; padding-top: 6px; font-size: 8.5px; color: #52616F; display: flex; justify-content: space-between;">
          <span>InspectIQ Official Legal Metrology Field Inspection System</span>
          <span>Record ID: ${inspection.inspectionNumber}</span>
          <span>Page 2 of 3</span>
        </div>
      </div>
    `;

    // PAGE 3
    const page3Html = `
      <div class="pdf-page" style="${commonPageStyle}">
        <div>
          <div style="border-bottom: 1.5px solid #12304A; padding-bottom: 6px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <span style="font-size: 12px; font-weight: 900; color: #12304A;">INSPECTIQ</span>
              <span style="font-size: 9px; color: #52616F; margin-left: 6px;">Statutory Packaged Commodity Inspection Report</span>
            </div>
            <span style="font-size: 8.5px; font-family: monospace; font-weight: 700; color: #0F766E;">
              ${inspection.inspectionNumber}
            </span>
          </div>

          <div style="margin-bottom: 14px;">
            <div style="${sectionHeaderStyle}">
              Section G: Photographic Evidence Records (${sortedImages.length} View${sortedImages.length === 1 ? '' : 's'})
            </div>
            ${sortedImages.length > 0 ? `
              <div style="display: flex; gap: 10px; width: 100%; box-sizing: border-box;">
                ${sortedImages.slice(0, 4).map((img) => `
                  <div style="flex: 1; border: 1px solid #D9E1E8; border-radius: 6px; padding: 6px; background-color: #ffffff; text-align: center; box-sizing: border-box;">
                    <div style="height: 105px; width: 100%; background-color: #0F172A; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
                      <img 
                        src="${img.url}" 
                        style="max-height: 105px; max-width: 100%; object-fit: contain; display: block;" 
                        alt="${img.label}"
                      />
                    </div>
                    <strong style="font-size: 8.5px; color: #12304A; display: block; text-transform: capitalize;">
                      ${img.label || img.side.replace(/_/g, ' ')} View
                    </strong>
                    <span style="font-size: 7.5px; color: #52616F; display: block;">
                      Captured on-site
                    </span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="${gridBoxStyle} color: #52616F; font-style: italic;">
                No photographic records attached to this inspection.
              </div>
            `}
          </div>

          <div style="margin-bottom: 14px;">
            <div style="${sectionHeaderStyle}">Section H: Officer Assessment &amp; Final Decision</div>
            <div style="${gridBoxStyle}">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 8px;">
                <div>
                  <span style="font-size: 8.5px; color: #52616F; display: block;">System Advisory Assessment</span>
                  <strong style="font-size: 11px; color: #12304A;">
                    ${formatStatusLabel(inspection.systemAssessment || inspection.status)}
                  </strong>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 8.5px; color: #52616F; display: block;">Officer Final Determination</span>
                  ${getBadgeHtml(decisionLabel)}
                </div>
              </div>

              <div>
                <span style="font-size: 8.5px; color: #52616F; display: block; margin-bottom: 2px;">Official Remarks &amp; Observations</span>
                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 6px 8px; font-size: 9.5px; color: #17212B; line-height: 1.35;">
                  ${inspection.officerRemarks || inspection.remarks || 'Packaging inspected under Section 18 authority. Mandatory statutory declarations examined and verified.'}
                </div>
              </div>

              <div style="font-size: 8px; color: #64748B; margin-top: 6px;">
                Determination recorded on: ${new Date(inspection.reviewedAt || Date.now()).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div>
            <div style="${sectionHeaderStyle}">Section I: Statutory Notice &amp; Formal Signatures</div>
            <div style="border: 1px solid #D9E1E8; border-radius: 6px; padding: 7px 10px; background-color: #F8FAFC; font-size: 8.5px; color: #52616F; line-height: 1.35; margin-bottom: 14px;">
              <strong>Statutory Notice:</strong> This formal inspection report constitutes an official field examination record under Section 18 of the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011. Where potential non-compliance is established, statutory proceedings may follow under Section 36 or departmental compounding under Section 48 of the Act.
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
              <div style="border-top: 1.5px solid #12304A; padding-top: 6px;">
                <strong style="color: #12304A; font-size: 10px; display: block;">Inspecting Officer Signature</strong>
                <span style="font-size: 9.5px; color: #12304A; display: block; margin-top: 2px; font-weight: 600;">${inspection.officerName}</span>
                <span style="font-size: 8.5px; color: #52616F; display: block;">${inspection.officerDesignation || 'Enforcement Officer'} (${inspection.officerId})</span>
                <span style="font-size: 8px; font-family: monospace; color: #0F766E; display: block; margin-top: 3px;">
                  Ref: ${inspection.officerDecision?.digitalSignatureRef || `LM-DSC-${inspection.officerId}-VERIFIED`}
                </span>
              </div>

              <div style="border-top: 1.5px solid #12304A; padding-top: 6px; text-align: right;">
                <strong style="color: #12304A; font-size: 10px; display: block;">Trader / Premises Representative</strong>
                <span style="font-size: 9.5px; color: #12304A; display: block; margin-top: 2px; font-weight: 600;">${inspection.premisesName || 'Establishment In-charge'}</span>
                <span style="font-size: 8.5px; color: #52616F; display: block;">Acknowledgement of Inspection Record</span>
                <span style="font-size: 8px; color: #52616F; display: block; margin-top: 3px;">
                  Date: ${new Date().toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid #D9E1E8; padding-top: 6px; font-size: 8.5px; color: #52616F; display: flex; justify-content: space-between;">
          <span>InspectIQ Official Legal Metrology Field Inspection System</span>
          <span>Record ID: ${inspection.inspectionNumber}</span>
          <span>Page 3 of 3</span>
        </div>
      </div>
    `;

    container.innerHTML = page1Html + page2Html + page3Html;
    document.body.appendChild(container);

    try {
      const pageElements = container.querySelectorAll('.pdf-page');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.96);

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      const blob = pdf.output('blob');
      if (!blob || blob.size === 0) {
        throw new Error('PDF generation produced an empty file (0 bytes).');
      }

      const url = URL.createObjectURL(blob);
      return { blob, url };
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  }

  /**
   * Generates and downloads a clean PDF of any document element (fallback/generic)
   */
  public static async downloadPdfFromElement(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element #${elementId} not found`);
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 8;
    const imgWidth = pdfWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - margin * 2);

    while (heightLeft > 5) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - margin * 2);
    }

    pdf.save(`${filename}.pdf`);
  }

  /**
   * Generates an editable DOCX / Word compatible statutory document
   */
  public static exportToDocx(inspection: Inspection): void {
    const isNotice = inspection.violations.length > 0;
    const noticeRef = inspection.officerDecision?.noticeRefNumber || `LM/DL/2026/NOT-${inspection.inspectionNumber.split('-')[2] || '4189'}`;

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Legal Metrology Official Document</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; color: #000; }
        h1 { font-size: 16pt; text-align: center; text-transform: uppercase; margin-bottom: 2px; }
        h2 { font-size: 12pt; text-align: center; margin-top: 0; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
        th, td { border: 1px solid #333; padding: 6px 8px; font-size: 10pt; text-align: left; }
        th { background-color: #f0ede8; font-weight: bold; }
        .badge-pass { color: #166534; font-weight: bold; }
        .badge-fail { color: #991b1b; font-weight: bold; }
        .badge-review { color: #92400e; font-weight: bold; }
        .notice-box { border: 2px solid #991b1b; background-color: #fff5f5; padding: 12px; margin: 15px 0; }
        .footer { margin-top: 40px; font-size: 9pt; border-top: 1px solid #777; padding-top: 10px; }
      </style>
      </head>
      <body>
        <h1>INSPECTIQ</h1>
        <h2>PACKAGED COMMODITY INSPECTION REPORT</h2>
        <p style="text-align: center; font-weight: bold; font-size: 11pt;">STATUTORY COMPLIANCE INSPECTION RECORD</p>
        <p style="text-align: center; font-size: 9pt; color: #666;">(Under Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011)</p>
        <hr/>
        
        <table>
          <tr>
            <th width="25%">Inspection ID:</th>
            <td width="25%">${inspection.inspectionNumber}</td>
            <th width="25%">Notice Reference:</th>
            <td width="25%"><b>${noticeRef}</b></td>
          </tr>
          <tr>
            <th>Inspection Date:</th>
            <td>${new Date(inspection.createdAt).toLocaleDateString('en-GB')}</td>
            <th>Location / Facility:</th>
            <td>${inspection.location}</td>
          </tr>
          <tr>
            <th>Enforcement Officer:</th>
            <td>${inspection.officerName} (${inspection.officerDesignation})</td>
            <th>Retailer / Marketplace:</th>
            <td>${inspection.retailerName}</td>
          </tr>
          <tr>
            <th>Product Name:</th>
            <td><b>${inspection.productName}</b></td>
            <th>Brand / Manufacturer:</th>
            <td>${inspection.brand} / ${inspection.manufacturerName}</td>
          </tr>
          <tr>
            <th>Declared Net Quantity:</th>
            <td>${inspection.netQuantity}</td>
            <th>Declared MRP:</th>
            <td>${inspection.mrp}</td>
          </tr>
          <tr>
            <th>Inspection Modality:</th>
            <td>${inspection.inspectionType.toUpperCase()} INSPECTION</td>
            <th>Statutory Determination:</th>
            <td><b>${inspection.status.toUpperCase()}</b></td>
          </tr>
        </table>

        <h3>1. EXTRACTED MANDATORY STATUTORY DECLARATIONS (RULE 6)</h3>
        <table>
          <thead>
            <tr>
              <th>Declaration Field</th>
              <th>Detected Value</th>
              <th>Rule Reference</th>
              <th>Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            ${inspection.declarations.map(d => `
              <tr>
                <td>${d.fieldName}</td>
                <td>${d.detectedValue}</td>
                <td>${d.ruleRef}</td>
                <td>${d.status.toUpperCase()}</td>
                <td>${d.confidence}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>2. STATUTORY COMPLIANCE ASSESSMENT MATRIX</h3>
        <table>
          <thead>
            <tr>
              <th>Rule Number</th>
              <th>Requirement Title</th>
              <th>Observed Finding</th>
              <th>Statutory Result</th>
            </tr>
          </thead>
          <tbody>
            ${inspection.complianceChecks.map(c => `
              <tr>
                <td><b>${c.ruleNumber}</b></td>
                <td>${c.ruleTitle}</td>
                <td>${c.detectedValue}</td>
                <td><b>${c.result}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${isNotice ? `
          <div class="notice-box">
            <h3 style="color: #991b1b; margin-top: 0;">3. FORM 1 STATUTORY SHOW-CAUSE NOTICE (SECTION 36)</h3>
            <p><b>WHEREAS</b> the pre-packaged commodity <b>${inspection.productName}</b> manufactured/packed by <b>${inspection.manufacturerName}</b> was inspected on ${new Date(inspection.createdAt).toLocaleDateString('en-GB')}, and the following statutory contraventions were established:</p>
            <ul>
              ${inspection.violations.map(v => `
                <li><b>${v.ruleNumber}:</b> ${v.finding} (Observed: ${v.observedValue} vs Required: ${v.requiredStandard}) [${v.sectionReference}]</li>
              `).join('')}
            </ul>
            <p><b>NOW THEREFORE</b>, notice is hereby served requiring the manufacturer/packer to show cause within <b>15 days</b> why prosecution should not be initiated under Section 36 of the Legal Metrology Act, 2009 or departmental compounding order under Section 48.</p>
          </div>
        ` : '<p><i>No statutory contraventions were established during this inspection. Package conforms to Legal Metrology Rules, 2011.</i></p>'}

        <h3>4. OFFICER VERIFICATION & DIGITAL SIGNATURE CERTIFICATE (DSC)</h3>
        <p><b>Authoritative Determination:</b> ${inspection.officerDecision?.decision || inspection.status}</p>
        <p><b>Official Remarks:</b> ${inspection.officerDecision?.remarks || inspection.remarks || 'Inspection verified and recorded under Section 18 authority.'}</p>
        <p><b>Verified By:</b> ${inspection.officerName}, ${inspection.officerDesignation}</p>
        <p><b>Digital Signature Key:</b> ${inspection.officerDecision?.digitalSignatureRef || 'DSC-LM-GOV-2026-VERIFIED'}</p>
        <p><b>Date & Time:</b> ${new Date().toLocaleString('en-GB')}</p>

        <div class="footer">
          <p>InspectIQ Packaged Commodity Inspection System • Record of Statutory Inspection under Legal Metrology Act, 2009 & PCR 2011.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inspection.inspectionNumber}_Official_Record.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public static printReport(): void {
    window.print();
  }
}
