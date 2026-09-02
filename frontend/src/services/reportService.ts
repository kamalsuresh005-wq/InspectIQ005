import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Inspection } from '../types';

export class ReportService {
  /**
   * Generates and downloads a clean PDF of the compliance report element
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

    while (heightLeft > 0) {
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
        <h1>GOVERNMENT OF INDIA</h1>
        <h2>DEPARTMENT OF LEGAL METROLOGY • MINISTRY OF CONSUMER AFFAIRS</h2>
        <p style="text-align: center; font-weight: bold; font-size: 13pt;">STATUTORY COMPLIANCE INSPECTION REPORT & NOTICE</p>
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
          <p>Official Statutory Document • Department of Legal Metrology, Ministry of Consumer Affairs, Food & Public Distribution, Government of India (SIH26034 Enforcement Intelligence).</p>
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
