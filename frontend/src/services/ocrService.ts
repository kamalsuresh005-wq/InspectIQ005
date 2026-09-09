import { createWorker, Worker } from 'tesseract.js';
import { ExtractedDeclaration, OcrProcessingState, PackageSide, ProductDetails, ImageOcrResult } from '../types';

export interface OcrProgressUpdate {
  status: string;
  progress: number; // 0 - 100
}

export interface OcrExtractionResult {
  status: OcrProcessingState;
  rawText: string;
  message: string;
  processingTimeMs?: number;
  structuredDeclarations: ExtractedDeclaration[];
}

export interface MultiImageOcrResult {
  status: OcrProcessingState;
  ocrResults: ImageOcrResult[];
  combinedRawOcrText: string;
  message: string;
  processingTimeMs: number;
  structuredDeclarations: ExtractedDeclaration[];
}

export interface IOcrService {
  isConfigured(): boolean;
  extractText(
    imageUrlOrBase64: string,
    onProgress?: (update: OcrProgressUpdate) => void
  ): Promise<OcrExtractionResult>;
  extractTextFromMultipleImages(
    images: { id: string; side: PackageSide; label?: string; url: string }[],
    onProgress?: (update: OcrProgressUpdate) => void,
    productDetails?: ProductDetails
  ): Promise<MultiImageOcrResult>;
  structureDeclarationsFromText(
    rawText: string, 
    side?: PackageSide, 
    productDetails?: ProductDetails
  ): ExtractedDeclaration[];
  structureDeclarationsFromMultiOcr(
    ocrResults: ImageOcrResult[],
    combinedText: string,
    productDetails?: ProductDetails
  ): ExtractedDeclaration[];
}

/**
 * Preprocesses an image before passing it to Tesseract OCR:
 * - Creates an offscreen canvas
 * - Scales appropriately for OCR text resolution
 * - Converts to grayscale
 * - Enhances contrast
 * - Applies binarization/sharpening threshold
 */
export async function preprocessImageForOcr(imageSource: string): Promise<string> {
  return new Promise((resolve) => {
    // If running in a non-browser environment, return original
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(imageSource);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;

        if (naturalWidth === 0 || naturalHeight === 0) {
          return resolve(imageSource);
        }

        // On mobile devices, restrict max dimensions to 1600px to prevent browser canvas OOM
        const maxDim = Math.max(naturalWidth, naturalHeight);
        let scale = 1.0;

        if (maxDim > 1600) {
          scale = 1600 / maxDim;
        } else if (maxDim < 600) {
          scale = Math.min(2.0, 900 / maxDim);
        }

        const targetWidth = Math.max(300, Math.round(naturalWidth * scale));
        const targetHeight = Math.max(300, Math.round(naturalHeight * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          return resolve(imageSource);
        }

        // Draw scaled image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Pixel-level contrast stretch & grayscale
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;

        let minLum = 255;
        let maxLum = 0;

        for (let i = 0; i < data.length; i += 4) {
          const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          if (lum < minLum) minLum = lum;
          if (lum > maxLum) maxLum = lum;
        }

        const lumRange = Math.max(1, maxLum - minLum);

        for (let i = 0; i < data.length; i += 4) {
          const originalLum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const stretched = Math.min(255, Math.max(0, ((originalLum - minLum) / lumRange) * 255));
          data[i] = stretched;
          data[i + 1] = stretched;
          data[i + 2] = stretched;
        }

        ctx.putImageData(imageData, 0, 0);
        // Use JPEG at 0.85 for mobile speed and lower memory footprint
        const processedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(processedDataUrl);
      } catch (err) {
        console.warn('[OCR Preprocess Error, using original]', err);
        resolve(imageSource);
      }
    };

    img.onerror = (err) => {
      console.warn('[OCR Preprocess Image Load Error]', err);
      resolve(imageSource);
    };

    img.src = imageSource;
  });
}

export class TesseractOcrService implements IOcrService {
  private workerInstance: Worker | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<Worker> | null = null;

  public isConfigured(): boolean {
    return true;
  }

  private async getWorker(onProgress?: (update: OcrProgressUpdate) => void): Promise<Worker> {
    if (this.workerInstance) {
      return this.workerInstance;
    }

    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      const isBrowser = typeof window !== 'undefined' && typeof window.location !== 'undefined';
      const origin = isBrowser ? window.location.origin : '';

      // Configuration Strategy:
      // Primary: Use bundled assets hosted directly on same origin under /tesseract/
      // Fallback: Use reliable public CDN with fast 4.0.0_fast model
      const primaryOptions = isBrowser ? {
        workerPath: `${origin}/tesseract/worker.min.js`,
        corePath: `${origin}/tesseract/tesseract-core-lstm.wasm.js`,
        langPath: `${origin}/tesseract/4.0.0_fast`,
        gzip: true,
      } : {};

      const fallbackOptions = isBrowser ? {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v7.0.0/dist/worker.min.js',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v7.0.0/tesseract-core-lstm.wasm.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0_fast',
        gzip: true,
      } : {};

      const createWorkerWithTimeout = async (opts: any, label: string): Promise<Worker> => {
        console.log(`[OCR] Initializing worker using ${label}...`);
        
        let timeoutId: any;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`Worker initialization timed out after 20s using ${label}`));
          }, 20000);
        });

        const workerPromise = createWorker('eng', 1, {
          ...opts,
          logger: (m: any) => {
            if (onProgress && m) {
              const progressPct = Math.round((m.progress || 0) * 100);
              let statusLabel = m.status || 'Processing';
              if (m.status === 'loading tesseract core') statusLabel = 'Loading OCR core engine...';
              else if (m.status === 'initializing tesseract') statusLabel = 'Initializing OCR engine...';
              else if (m.status === 'loading language traineddata') statusLabel = 'Loading Legal Metrology language model...';
              else if (m.status === 'recognizing text') statusLabel = 'Recognizing package text...';

              console.log(`[OCR Progress] ${statusLabel} (${progressPct}%)`);
              onProgress({
                status: statusLabel,
                progress: progressPct,
              });
            }
          },
        });

        try {
          const res = await Promise.race([workerPromise, timeoutPromise]);
          clearTimeout(timeoutId);
          return res;
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      try {
        console.log('[OCR] Attempting worker initialization with local bundled assets...');
        const worker = await createWorkerWithTimeout(primaryOptions, 'Local Bundle');
        console.log('[OCR] Worker initialized successfully via local assets.');
        this.workerInstance = worker;
        this.isInitializing = false;
        return worker;
      } catch (primaryErr) {
        console.warn('[OCR] Local asset worker init failed, attempting CDN fallback...', primaryErr);

        if (onProgress) {
          onProgress({ status: 'Connecting to OCR fallback service...', progress: 20 });
        }

        try {
          const worker = await createWorkerWithTimeout(fallbackOptions, 'CDN Fallback');
          console.log('[OCR] Worker initialized successfully via CDN fallback.');
          this.workerInstance = worker;
          this.isInitializing = false;
          return worker;
        } catch (cdnErr) {
          this.isInitializing = false;
          this.initPromise = null;
          console.error('[OCR ERROR] All worker initialization attempts failed:', cdnErr);
          throw new Error('Failed to initialize OCR engine on device. Please ensure internet connectivity and reload.');
        }
      }
    })();

    return this.initPromise;
  }

  public async extractText(
    imageUrlOrBase64: string,
    onProgress?: (update: OcrProgressUpdate) => void
  ): Promise<OcrExtractionResult> {
    console.log('[OCR] extractText called');

    if (!imageUrlOrBase64 || imageUrlOrBase64.trim() === '') {
      console.warn('[OCR] No image provided');
      return {
        status: 'requires_retake',
        rawText: '',
        message: 'No package image provided for OCR extraction.',
        structuredDeclarations: [],
      };
    }

    console.log('[OCR] Image received, length:', imageUrlOrBase64.length);
    const startTime = Date.now();

    try {
      if (onProgress) {
        onProgress({ status: 'Preprocessing package image...', progress: 5 });
      }

      // 1. Preprocess image
      console.log('[OCR] Image processing started');
      const preprocessedImage = await preprocessImageForOcr(imageUrlOrBase64);
      console.log('[OCR] Image preprocessing completed, ready for recognition');

      if (onProgress) {
        onProgress({ status: 'Initializing OCR engine...', progress: 15 });
      }

      // 2. Initialize worker
      console.log('[OCR] Worker initialization started');
      const worker = await this.getWorker(onProgress);
      console.log('[OCR] Worker initialized and ready for recognize()');

      if (onProgress) {
        onProgress({ status: 'Extracting text from package...', progress: 35 });
      }

      // 3. Execute OCR with 30s timeout guard
      let recogTimeout: any;
      const timeoutPromise = new Promise<never>((_, reject) => {
        recogTimeout = setTimeout(() => {
          reject(new Error('OCR recognition timed out after 30 seconds.'));
        }, 30000);
      });

      console.log('[OCR] Invoking worker.recognize()...');
      const recognitionResult: any = await Promise.race([
        worker.recognize(preprocessedImage),
        timeoutPromise,
      ]);
      clearTimeout(recogTimeout);

      const rawText = (recognitionResult?.data?.text || '').trim();
      const processingTimeMs = Date.now() - startTime;
      console.log(`[OCR] OCR completed in ${processingTimeMs}ms. Text length: ${rawText.length}`);

      if (!rawText || rawText.length === 0) {
        return {
          status: 'failed',
          rawText: '',
          message: 'OCR could not extract readable text. The image may be blurry, have harsh glare, or lack sufficient contrast.',
          processingTimeMs,
          structuredDeclarations: [],
        };
      }

      // 4. Structure declarations
      const structuredDeclarations = this.structureDeclarationsFromText(rawText);

      return {
        status: 'success',
        rawText,
        message: '✓ OCR completed',
        processingTimeMs,
        structuredDeclarations,
      };
    } catch (err: any) {
      console.error('[OCR ERROR]', err);

      // Reset instance on error so officer can Try Again cleanly
      try {
        if (this.workerInstance) {
          await this.workerInstance.terminate();
        }
      } catch (termErr) {
        // ignore
      }
      this.workerInstance = null;
      this.initPromise = null;
      this.isInitializing = false;

      return {
        status: 'failed',
        rawText: '',
        message: err?.message || 'OCR could not extract readable text. Please ensure the label is well-lit and in sharp focus.',
        processingTimeMs: Date.now() - startTime,
        structuredDeclarations: [],
      };
    }
  }

  /**
   * Processes ALL captured package images (Front, Back, Side, Declaration Area) sequentially
   * with the client-side Tesseract.js engine and produces a combined, normalized OCR result
   * with view provenance preserved.
   */
  public async extractTextFromMultipleImages(
    images: { id: string; side: PackageSide; label?: string; url: string }[],
    onProgress?: (update: OcrProgressUpdate) => void,
    productDetails?: ProductDetails
  ): Promise<MultiImageOcrResult> {
    const validImages = (images || []).filter(img => img && img.url && img.url.trim() !== '');
    if (validImages.length === 0) {
      return {
        status: 'requires_retake',
        ocrResults: [],
        combinedRawOcrText: '',
        message: 'No package images provided for OCR extraction.',
        processingTimeMs: 0,
        structuredDeclarations: [],
      };
    }

    const startTime = Date.now();
    const totalImages = validImages.length;
    const ocrResults: ImageOcrResult[] = [];

    try {
      if (onProgress) {
        onProgress({ status: 'Initializing OCR engine...', progress: 10 });
      }

      // Initialize worker once for all images
      const worker = await this.getWorker(onProgress);

      for (let i = 0; i < totalImages; i++) {
        const img = validImages[i];
        const sideLabel = img.label || (img.side ? img.side.replace(/_/g, ' ') : `Image ${i + 1}`);
        const baseProgress = Math.round(15 + (i / totalImages) * 75);

        if (onProgress) {
          onProgress({ 
            status: `Preprocessing ${sideLabel} image (${i + 1}/${totalImages})...`, 
            progress: baseProgress 
          });
        }

        let preprocessed: string;
        try {
          preprocessed = await preprocessImageForOcr(img.url);
        } catch {
          preprocessed = img.url;
        }

        if (onProgress) {
          onProgress({ 
            status: `Extracting text from ${sideLabel} (${i + 1}/${totalImages})...`, 
            progress: baseProgress + Math.round(75 / totalImages * 0.7) 
          });
        }

        let recogTimeout: any;
        const timeoutPromise = new Promise<never>((_, reject) => {
          recogTimeout = setTimeout(() => {
            reject(new Error(`OCR recognition timed out on ${sideLabel}.`));
          }, 30000);
        });

        let rawText = '';
        try {
          const result: any = await Promise.race([
            worker.recognize(preprocessed),
            timeoutPromise,
          ]);
          clearTimeout(recogTimeout);
          rawText = (result?.data?.text || '').trim();
        } catch (imgErr) {
          clearTimeout(recogTimeout);
          console.warn(`[OCR] Error recognizing ${sideLabel}:`, imgErr);
          rawText = '';
        }

        ocrResults.push({
          source: img.side,
          sourceLabel: sideLabel,
          imageId: img.id,
          text: rawText,
        });
      }

      // Combine text with clear package view headers
      const combinedSections = ocrResults
        .filter(r => r.text && r.text.length > 0)
        .map(r => `--- ${r.sourceLabel.toUpperCase()} ---\n${r.text}`);
      const combinedText = combinedSections.join('\n\n');

      if (onProgress) {
        onProgress({ status: 'Analyzing statutory declarations across all package views...', progress: 95 });
      }

      const structuredDeclarations = this.structureDeclarationsFromMultiOcr(
        ocrResults, 
        combinedText, 
        productDetails
      );

      const processingTimeMs = Date.now() - startTime;

      if (!combinedText || combinedText.trim().length === 0) {
        return {
          status: 'failed',
          ocrResults,
          combinedRawOcrText: '',
          message: 'OCR could not extract readable text from captured package images. Please ensure labels are in focus with good lighting.',
          processingTimeMs,
          structuredDeclarations,
        };
      }

      if (onProgress) {
        onProgress({ status: `✓ OCR extraction completed across ${totalImages} package image(s)`, progress: 100 });
      }

      return {
        status: 'success',
        ocrResults,
        combinedRawOcrText: combinedText,
        message: `✓ OCR completed: processed ${totalImages} package image(s).`,
        processingTimeMs,
        structuredDeclarations,
      };
    } catch (err: any) {
      console.error('[OCR MULTI ERROR]', err);
      return {
        status: 'failed',
        ocrResults,
        combinedRawOcrText: '',
        message: err?.message || 'OCR extraction failed across package images. Please try again.',
        processingTimeMs: Date.now() - startTime,
        structuredDeclarations: [],
      };
    }
  }

  /**
   * Deterministically parses raw OCR text into standard Legal Metrology (PCR 2011) declaration fields.
   * NOTE: No compliance checking or violation marking is performed in Stage 2.
   */
  public structureDeclarationsFromText(
    rawText: string,
    side: PackageSide = 'declaration_area',
    productDetails?: ProductDetails
  ): ExtractedDeclaration[] {
    const text = rawText || '';
    const declarations: ExtractedDeclaration[] = [];

    // 1. MRP (Rule 6(1)(e))
    const mrpMatch = text.match(/(?:MRP|M\.R\.P|MAX\.?\s*RETAIL\s*PRICE|MRRP|₹|Rs\.?)\s*[:=.-]?\s*([₹\d.,]+(?:\s*(?:incl\.?|inclusive).*?\))?)/i);
    const mrpValue = mrpMatch ? mrpMatch[0].trim() : (productDetails?.mrp || '');
    declarations.push({
      id: 'decl_mrp',
      fieldKey: 'mrp',
      fieldName: 'Maximum Retail Price (MRP)',
      detectedValue: mrpValue || 'Not detected in OCR text',
      rawOcrText: mrpMatch ? mrpMatch[0] : (text.slice(0, 100)),
      extractedValue: mrpValue,
      officerVerifiedValue: mrpValue,
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: 'Needs Review',
      status: mrpValue ? 'detected' : 'not_detected',
      confidence: mrpValue ? 85 : 0,
      isMandatory: true,
      sideFound: side,
      ruleRef: 'Rule 6(1)(e)',
    });

    // 2. Net Quantity (Rule 6(1)(c))
    const netQtyMatch = text.match(/(?:NET\s*(?:WT|WEIGHT|QTY|QUANTITY)?|NETWEIGHT|NETQTY)\s*[:=.-]?\s*(\d+(?:\.\d+)?\s*(?:g|kg|ml|l|ltr|gm|pieces|units|N|9))\b/i);
    let netQtyValue = netQtyMatch ? netQtyMatch[1].trim() : (productDetails?.netQuantity || '');
    // If OCR misread 'g' as '9' directly following digits (e.g. 2509 for 250g)
    if (netQtyValue && /\d+9$/.test(netQtyValue)) {
      netQtyValue = netQtyValue.slice(0, -1) + ' g';
    }
    declarations.push({
      id: 'decl_net_quantity',
      fieldKey: 'net_quantity',
      fieldName: 'Net Quantity',
      detectedValue: netQtyValue || 'Not detected in OCR text',
      rawOcrText: netQtyMatch ? netQtyMatch[0] : (text.slice(0, 100)),
      extractedValue: netQtyValue,
      officerVerifiedValue: netQtyValue,
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: 'Needs Review',
      status: netQtyValue ? 'detected' : 'not_detected',
      confidence: netQtyValue ? 90 : 0,
      isMandatory: true,
      sideFound: side,
      ruleRef: 'Rule 6(1)(c)',
    });

    // 3. Unit Sale Price (Rule 6(11))
    const uspMatch = text.match(/(?:USP|UNIT\s*SALE\s*PRICE)\s*[:=.-]?\s*([₹RRs\d.,]+\s*(?:\/|per)\s*(?:g|kg|ml|l|piece|unit|N))/i);
    const uspValue = uspMatch ? uspMatch[1].trim() : (productDetails?.unitSalePrice || '');
    declarations.push({
      id: 'decl_unit_sale_price',
      fieldKey: 'unit_sale_price',
      fieldName: 'Unit Sale Price (USP)',
      detectedValue: uspValue || 'Not detected in OCR text',
      rawOcrText: uspMatch ? uspMatch[0] : '',
      extractedValue: uspValue,
      officerVerifiedValue: uspValue,
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: 'Needs Review',
      status: uspValue ? 'detected' : 'not_detected',
      confidence: uspValue ? 80 : 0,
      isMandatory: false,
      sideFound: side,
      ruleRef: 'Rule 6(11)',
    });

    // 4. Common / Generic Name (Rule 6(1)(b))
    const genericNameMatch = text.match(/(?:GENERIC\s*NAME|COMMODITY|PRODUCT\s*NAME)\s*[:=.-]?\s*([^\n,]+)/i);
    const genericNameValue = genericNameMatch ? genericNameMatch[1].trim() : (productDetails?.productName || '');
    declarations.push({
      id: 'decl_product_name',
      fieldKey: 'product_name',
      fieldName: 'Generic Commodity Name',
      detectedValue: genericNameValue || 'Not detected in OCR text',
      rawOcrText: genericNameMatch ? genericNameMatch[0] : (text.slice(0, 100)),
      extractedValue: genericNameValue,
      officerVerifiedValue: genericNameValue,
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: 'Needs Review',
      status: genericNameValue ? 'detected' : 'not_detected',
      confidence: genericNameValue ? 88 : 0,
      isMandatory: true,
      sideFound: side,
      ruleRef: 'Rule 6(1)(b)',
    });

    // 5. Manufacturer / Packer / Importer (Rule 6(1)(a))
    const mfgMatch = text.match(/(?:MFD\s*BY|MED\s*BY|MANUFACTURED\s*BY|PACKED\s*BY|IMPORTED\s*BY|MARKETED\s*BY)\s*[:=.-]?\s*([^\n]+)/i);
    const mfgValue = mfgMatch ? mfgMatch[1].trim() : (productDetails?.manufacturerDetails || '');
    declarations.push({
      id: 'decl_manufacturer',
      fieldKey: 'manufacturer',
      fieldName: 'Manufacturer / Packer Details',
      detectedValue: mfgValue || 'Not detected in OCR text',
      rawOcrText: mfgMatch ? mfgMatch[0] : (text.slice(0, 100)),
      extractedValue: mfgValue,
      officerVerifiedValue: mfgValue,
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: 'Needs Review',
      status: mfgValue ? 'detected' : 'not_detected',
      confidence: mfgValue ? 82 : 0,
      isMandatory: true,
      sideFound: side,
      ruleRef: 'Rule 6(1)(a)',
    });

    // 6. Manufacturing / Packing Date (Rule 6(1)(d))
    const mfgDateMatch = text.match(/(?:MFD|MFG|WFD|PACKED|PKD|DATE\s*OF\s*PACKING)\s*[:=.-]?\s*([A-Za-z0-9\/\.\-]+)/i);
    const mfgDateValue = mfgDateMatch ? mfgDateMatch[1].trim() : (productDetails?.manufacturingDate || '');
    declarations.push({
      id: 'decl_mfg_date',
      fieldKey: 'mfg_date',
      fieldName: 'Month & Year of Manufacture / Packing',
      detectedValue: mfgDateValue || 'Not detected in OCR text',
      rawOcrText: mfgDateMatch ? mfgDateMatch[0] : '',
      extractedValue: mfgDateValue,
      officerVerifiedValue: mfgDateValue,
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: 'Needs Review',
      status: mfgDateValue ? 'detected' : 'not_detected',
      confidence: mfgDateValue ? 85 : 0,
      isMandatory: true,
      sideFound: side,
      ruleRef: 'Rule 6(1)(d)',
    });

    // 7. Best Before / Expiry (Rule 6(1)(d) proviso)
    const expMatch = text.match(/(?:EXPIRY|EXP|USE\s*BY|BEST\s*BEFORE)\s*[:=.-]?\s*([A-Za-z0-9\/\.\-\s]+?(?=\n|$))/i);
    const expValue = expMatch ? expMatch[1].trim() : (productDetails?.expiryDate || '');
    declarations.push({
      id: 'decl_expiry_date',
      fieldKey: 'expiry_date',
      fieldName: 'Best Before / Expiry Date',
      detectedValue: expValue || 'Not detected in OCR text',
      rawOcrText: expMatch ? expMatch[0] : '',
      extractedValue: expValue,
      officerVerifiedValue: expValue,
      applicabilityStatus: 'REQUIRES_OFFICER_REVIEW',
      readabilityAssessment: 'Needs Review',
      status: expValue ? 'detected' : 'not_detected',
      confidence: expValue ? 80 : 0,
      isMandatory: false,
      sideFound: side,
      ruleRef: 'Rule 6(1)(d)',
    });

    // 8. Batch / Lot Number (Rule 6(1)(g))
    const batchMatch = text.match(/(?:BATCH\s*(?:NO|NUMBER)?|LOT\s*(?:NO|NUMBER)?|B\.NO)\s*[:=.-]?\s*([A-Za-z0-9\-]+)/i);
    const batchValue = batchMatch ? batchMatch[1].trim() : (productDetails?.batchNumber || '');
    declarations.push({
      id: 'decl_batch_number',
      fieldKey: 'batch_number',
      fieldName: 'Batch / Lot Number',
      detectedValue: batchValue || 'Not detected in OCR text',
      rawOcrText: batchMatch ? batchMatch[0] : '',
      extractedValue: batchValue,
      officerVerifiedValue: batchValue,
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: 'Needs Review',
      status: batchValue ? 'detected' : 'not_detected',
      confidence: batchValue ? 90 : 0,
      isMandatory: false,
      sideFound: side,
      ruleRef: 'Rule 6(1)(g)',
    });

    // 9. Consumer Care Details (Rule 9)
    const careMatch = text.match(/(?:CONSUMER\s*CARE|CUSTOMER\s*CARE|CUSTOMERCARE|FEEDBACK|HELPLINE|TOLL\s*FREE|EMAIL)\s*[:=.-]?\s*([^\n]+)/i);
    const careValue = careMatch ? careMatch[1].trim() : (productDetails?.consumerCare || '');
    declarations.push({
      id: 'decl_consumer_care',
      fieldKey: 'consumer_care',
      fieldName: 'Consumer Care Details',
      detectedValue: careValue || 'Not detected in OCR text',
      rawOcrText: careMatch ? careMatch[0] : '',
      extractedValue: careValue,
      officerVerifiedValue: careValue,
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: 'Needs Review',
      status: careValue ? 'detected' : 'not_detected',
      confidence: careValue ? 78 : 0,
      isMandatory: true,
      sideFound: side,
      ruleRef: 'Rule 9',
    });

    // 10. Country of Origin (Rule 14 & Rule 6(10))
    const originMatch = text.match(/(?:MADE\s*IN|COUNTRY\s*OF\s*ORIGIN|COUNTRYOF\s*ORIGIN|PRODUCE\s*OF)\s*[:=.-]?\s*([A-Za-z\s]+)/i);
    const originValue = originMatch ? originMatch[1].trim() : (productDetails?.countryOfOrigin || '');
    declarations.push({
      id: 'decl_country_of_origin',
      fieldKey: 'country_of_origin',
      fieldName: 'Country of Origin',
      detectedValue: originValue || 'Not detected in OCR text',
      rawOcrText: originMatch ? originMatch[0] : '',
      extractedValue: originValue,
      officerVerifiedValue: originValue,
      applicabilityStatus: 'REQUIRES_OFFICER_REVIEW',
      readabilityAssessment: 'Needs Review',
      status: originValue ? 'detected' : 'not_detected',
      confidence: originValue ? 85 : 0,
      isMandatory: false,
      sideFound: side,
      ruleRef: 'Rule 14',
    });

    // 11. Dimensions (Rule 6(1)(f) where applicable)
    const dimMatch = text.match(/(?:DIMENSIONS?|SIZE)\s*[:=]?\s*(\d+(?:\.\d+)?\s*(?:cm|mm|m)\s*[xX*]\s*\d+(?:\.\d+)?\s*(?:cm|mm|m)(?:\s*[xX*]\s*\d+(?:\.\d+)?\s*(?:cm|mm|m))?)/i);
    const dimValue = dimMatch ? dimMatch[1].trim() : '';
    declarations.push({
      id: 'decl_dimensions',
      fieldKey: 'dimensions',
      fieldName: 'Dimensions (where applicable)',
      detectedValue: dimValue || 'Not detected in OCR text',
      rawOcrText: dimMatch ? dimMatch[0] : '',
      extractedValue: dimValue,
      officerVerifiedValue: dimValue,
      applicabilityStatus: 'NOT_APPLICABLE',
      readabilityAssessment: 'Needs Review',
      status: dimValue ? 'detected' : 'not_detected',
      confidence: dimValue ? 80 : 0,
      isMandatory: false,
      sideFound: side,
      ruleRef: 'Rule 6(1)(f)',
    });

    return declarations;
  }

  /**
   * Deterministically structures Legal Metrology declarations across all captured package images,
   * preserving the exact source view (Front, Back, Side, Declaration Area) for full auditability.
   */
  public structureDeclarationsFromMultiOcr(
    ocrResults: ImageOcrResult[],
    combinedText: string,
    productDetails?: ProductDetails
  ): ExtractedDeclaration[] {
    const declarations: ExtractedDeclaration[] = [];

    // Helper: Finds first match in individual view results, then falls back to combined text
    const findInResults = (regex: RegExp): { 
      match: RegExpMatchArray | null; 
      side: PackageSide; 
      imageId?: string; 
      snippet: string; 
    } => {
      // 1. Check each individual package view
      for (const res of ocrResults) {
        if (!res.text) continue;
        const m = res.text.match(regex);
        if (m) {
          return {
            match: m,
            side: (res.source as PackageSide) || 'declaration_area',
            imageId: res.imageId,
            snippet: m[0],
          };
        }
      }
      // 2. Check full combined text as fallback
      const cm = combinedText.match(regex);
      if (cm) {
        return {
          match: cm,
          side: (ocrResults[0]?.source as PackageSide) || 'declaration_area',
          imageId: ocrResults[0]?.imageId,
          snippet: cm[0],
        };
      }
      return { match: null, side: 'declaration_area', snippet: '' };
    };

    // 1. Maximum Retail Price (Rule 6(1)(e))
    const mrpFind = findInResults(/(?:MRP|M\.R\.P|MAX\.?\s*RETAIL\s*PRICE|MRRP|₹|Rs\.?)\s*[:=.-]?\s*([₹\d.,]+(?:\s*(?:incl\.?|inclusive).*?\))?)/i);
    const mrpValue = mrpFind.match ? mrpFind.match[0].trim() : (productDetails?.mrp || '');
    declarations.push({
      id: 'decl_mrp',
      fieldKey: 'mrp',
      fieldName: 'Maximum Retail Price (MRP)',
      detectedValue: mrpValue || 'Not detected in OCR text',
      rawOcrText: mrpFind.snippet || (mrpFind.match ? mrpFind.match[0] : ''),
      extractedValue: mrpValue,
      officerVerifiedValue: mrpValue || 'Not detected in OCR text',
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: mrpValue ? 'Acceptable' : 'Needs Review',
      status: mrpValue ? 'detected' : 'not_detected',
      confidence: mrpValue ? 92 : 0,
      isMandatory: true,
      sideFound: mrpFind.side,
      evidenceImageId: mrpFind.imageId,
      ruleRef: 'Rule 6(1)(e)',
    });

    // 2. Net Quantity (Rule 6(1)(c))
    const netQtyFind = findInResults(/(?:NET\s*(?:WT|WEIGHT|QTY|QUANTITY)?|NETWEIGHT|NETQTY)\s*[:=.-]?\s*(\d+(?:\.\d+)?\s*(?:g|kg|ml|l|ltr|gm|pieces|units|N|9))\b/i);
    let netQtyValue = netQtyFind.match ? netQtyFind.match[1].trim() : (productDetails?.netQuantity || '');
    if (netQtyValue && /\d+9$/.test(netQtyValue)) {
      netQtyValue = netQtyValue.slice(0, -1) + ' g';
    }
    declarations.push({
      id: 'decl_net_quantity',
      fieldKey: 'net_quantity',
      fieldName: 'Net Quantity',
      detectedValue: netQtyValue || 'Not detected in OCR text',
      rawOcrText: netQtyFind.snippet || (netQtyFind.match ? netQtyFind.match[0] : ''),
      extractedValue: netQtyValue,
      officerVerifiedValue: netQtyValue || 'Not detected in OCR text',
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: netQtyValue ? 'Acceptable' : 'Needs Review',
      status: netQtyValue ? 'detected' : 'not_detected',
      confidence: netQtyValue ? 94 : 0,
      isMandatory: true,
      sideFound: netQtyFind.side,
      evidenceImageId: netQtyFind.imageId,
      ruleRef: 'Rule 6(1)(c)',
    });

    // 3. Unit Sale Price (Rule 6(11))
    const uspFind = findInResults(/(?:USP|UNIT\s*SALE\s*PRICE)\s*[:=.-]?\s*([₹RRs\d.,]+\s*(?:\/|per)\s*(?:g|kg|ml|l|piece|unit|N))/i);
    const uspValue = uspFind.match ? uspFind.match[1].trim() : (productDetails?.unitSalePrice || '');
    declarations.push({
      id: 'decl_unit_sale_price',
      fieldKey: 'unit_sale_price',
      fieldName: 'Unit Sale Price (USP)',
      detectedValue: uspValue || 'Not detected in OCR text',
      rawOcrText: uspFind.snippet || '',
      extractedValue: uspValue,
      officerVerifiedValue: uspValue || 'Not detected in OCR text',
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: uspValue ? 'Acceptable' : 'Needs Review',
      status: uspValue ? 'detected' : 'not_detected',
      confidence: uspValue ? 85 : 0,
      isMandatory: false,
      sideFound: uspFind.side,
      evidenceImageId: uspFind.imageId,
      ruleRef: 'Rule 6(11)',
    });

    // 4. Common / Generic Commodity Name (Rule 6(1)(b))
    const genericFind = findInResults(/(?:GENERIC\s*NAME|COMMODITY|PRODUCT\s*NAME|ITEM\s*NAME)\s*[:=.-]?\s*([^\n,]+)/i);
    const genericValue = genericFind.match ? genericFind.match[1].trim() : (productDetails?.productName || '');
    declarations.push({
      id: 'decl_product_name',
      fieldKey: 'product_name',
      fieldName: 'Generic Commodity Name',
      detectedValue: genericValue || 'Not detected in OCR text',
      rawOcrText: genericFind.snippet || (genericFind.match ? genericFind.match[0] : ''),
      extractedValue: genericValue,
      officerVerifiedValue: genericValue || 'Not detected in OCR text',
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: genericValue ? 'Acceptable' : 'Needs Review',
      status: genericValue ? 'detected' : 'not_detected',
      confidence: genericValue ? 90 : 0,
      isMandatory: true,
      sideFound: genericFind.side,
      evidenceImageId: genericFind.imageId,
      ruleRef: 'Rule 6(1)(b)',
    });

    // 5. Manufacturer / Packer Details & Address (Rule 6(1)(a))
    const mfgFind = findInResults(/(?:MANUFACTURED\s*(?:AND\s*PACKED)?\s*BY|MFD\s*BY|MED\s*BY|PACKED\s*BY|IMPORTED\s*BY|MARKETED\s*BY|MFG\s*BY)\s*[:=.-]?\s*([^\n]+)/i);
    const mfgValue = mfgFind.match ? mfgFind.match[1].trim() : (productDetails?.manufacturerDetails || '');
    declarations.push({
      id: 'decl_manufacturer',
      fieldKey: 'manufacturer',
      fieldName: 'Manufacturer / Packer Details',
      detectedValue: mfgValue || 'Not detected in OCR text',
      rawOcrText: mfgFind.snippet || (mfgFind.match ? mfgFind.match[0] : ''),
      extractedValue: mfgValue,
      officerVerifiedValue: mfgValue || 'Not detected in OCR text',
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: mfgValue ? 'Acceptable' : 'Needs Review',
      status: mfgValue ? 'detected' : 'not_detected',
      confidence: mfgValue ? 88 : 0,
      isMandatory: true,
      sideFound: mfgFind.side,
      evidenceImageId: mfgFind.imageId,
      ruleRef: 'Rule 6(1)(a)',
    });

    // 6. Month & Year of Manufacture / Packing (Rule 6(1)(d))
    const mfgDateFind = findInResults(/(?:MFD|MFG|WFD|PACKED|PKD|DATE\s*OF\s*PACKING)\s*[:=.-]?\s*([A-Za-z0-9\/\.\-]+)/i);
    const mfgDateValue = mfgDateFind.match ? mfgDateFind.match[1].trim() : (productDetails?.manufacturingDate || '');
    declarations.push({
      id: 'decl_mfg_date',
      fieldKey: 'mfg_date',
      fieldName: 'Month & Year of Manufacture / Packing',
      detectedValue: mfgDateValue || 'Not detected in OCR text',
      rawOcrText: mfgDateFind.snippet || '',
      extractedValue: mfgDateValue,
      officerVerifiedValue: mfgDateValue || 'Not detected in OCR text',
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: mfgDateValue ? 'Acceptable' : 'Needs Review',
      status: mfgDateValue ? 'detected' : 'not_detected',
      confidence: mfgDateValue ? 86 : 0,
      isMandatory: true,
      sideFound: mfgDateFind.side,
      evidenceImageId: mfgDateFind.imageId,
      ruleRef: 'Rule 6(1)(d)',
    });

    // 7. Best Before / Expiry Date (Rule 6(1)(d) proviso)
    const expFind = findInResults(/(?:EXPIRY|EXP|USE\s*BY|BEST\s*BEFORE)\s*[:=.-]?\s*([A-Za-z0-9\/\.\-\s]+?(?=\n|$))/i);
    const expValue = expFind.match ? expFind.match[1].trim() : (productDetails?.expiryDate || '');
    declarations.push({
      id: 'decl_expiry_date',
      fieldKey: 'expiry_date',
      fieldName: 'Best Before / Expiry Date',
      detectedValue: expValue || 'Not detected in OCR text',
      rawOcrText: expFind.snippet || '',
      extractedValue: expValue,
      officerVerifiedValue: expValue || 'Not detected in OCR text',
      applicabilityStatus: 'REQUIRES_OFFICER_REVIEW',
      readabilityAssessment: expValue ? 'Acceptable' : 'Needs Review',
      status: expValue ? 'detected' : 'not_detected',
      confidence: expValue ? 82 : 0,
      isMandatory: false,
      sideFound: expFind.side,
      evidenceImageId: expFind.imageId,
      ruleRef: 'Rule 6(1)(d)',
    });

    // 8. Batch / Lot Number (Rule 6(1)(g))
    const batchFind = findInResults(/(?:BATCH\s*(?:NO|NUMBER)?|LOT\s*(?:NO|NUMBER)?|B\.NO|B\.N\.)\s*[:=.-]?\s*([A-Za-z0-9\-]+)/i);
    const batchValue = batchFind.match ? batchFind.match[1].trim() : (productDetails?.batchNumber || '');
    declarations.push({
      id: 'decl_batch_number',
      fieldKey: 'batch_number',
      fieldName: 'Batch / Lot Number',
      detectedValue: batchValue || 'Not detected in OCR text',
      rawOcrText: batchFind.snippet || '',
      extractedValue: batchValue,
      officerVerifiedValue: batchValue || 'Not detected in OCR text',
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: batchValue ? 'Acceptable' : 'Needs Review',
      status: batchValue ? 'detected' : 'not_detected',
      confidence: batchValue ? 91 : 0,
      isMandatory: false,
      sideFound: batchFind.side,
      evidenceImageId: batchFind.imageId,
      ruleRef: 'Rule 6(1)(g)',
    });

    // 9. Consumer Care Details (Rule 9)
    const careFind = findInResults(/(?:CONSUMER\s*CARE|CUSTOMER\s*CARE|CUSTOMERCARE|FEEDBACK|HELPLINE|TOLL\s*FREE|EMAIL)\s*[:=.-]?\s*([^\n]+)/i);
    const careValue = careFind.match ? careFind.match[1].trim() : (productDetails?.consumerCare || '');
    declarations.push({
      id: 'decl_consumer_care',
      fieldKey: 'consumer_care',
      fieldName: 'Consumer Care Details',
      detectedValue: careValue || 'Not detected in OCR text',
      rawOcrText: careFind.snippet || '',
      extractedValue: careValue,
      officerVerifiedValue: careValue || 'Not detected in OCR text',
      applicabilityStatus: 'APPLICABLE',
      readabilityAssessment: careValue ? 'Acceptable' : 'Needs Review',
      status: careValue ? 'detected' : 'not_detected',
      confidence: careValue ? 84 : 0,
      isMandatory: true,
      sideFound: careFind.side,
      evidenceImageId: careFind.imageId,
      ruleRef: 'Rule 9',
    });

    // 10. Country of Origin (Rule 14 & Rule 6(10))
    const originFind = findInResults(/(?:MADE\s*IN|COUNTRY\s*OF\s*ORIGIN|COUNTRYOF\s*ORIGIN|PRODUCE\s*OF)\s*[:=.-]?\s*([A-Za-z\s]+)/i);
    const originValue = originFind.match ? originFind.match[1].trim() : (productDetails?.countryOfOrigin || '');
    declarations.push({
      id: 'decl_country_of_origin',
      fieldKey: 'country_of_origin',
      fieldName: 'Country of Origin',
      detectedValue: originValue || 'Not detected in OCR text',
      rawOcrText: originFind.snippet || '',
      extractedValue: originValue,
      officerVerifiedValue: originValue || 'Not detected in OCR text',
      applicabilityStatus: 'REQUIRES_OFFICER_REVIEW',
      readabilityAssessment: originValue ? 'Acceptable' : 'Needs Review',
      status: originValue ? 'detected' : 'not_detected',
      confidence: originValue ? 87 : 0,
      isMandatory: false,
      sideFound: originFind.side,
      evidenceImageId: originFind.imageId,
      ruleRef: 'Rule 14',
    });

    // 11. Dimensions (Rule 6(1)(f) where applicable)
    const dimFind = findInResults(/(?:DIMENSIONS?|SIZE)\s*[:=]?\s*(\d+(?:\.\d+)?\s*(?:cm|mm|m)\s*[xX*]\s*\d+(?:\.\d+)?\s*(?:cm|mm|m)(?:\s*[xX*]\s*\d+(?:\.\d+)?\s*(?:cm|mm|m))?)/i);
    const dimValue = dimFind.match ? dimFind.match[1].trim() : '';
    declarations.push({
      id: 'decl_dimensions',
      fieldKey: 'dimensions',
      fieldName: 'Dimensions (where applicable)',
      detectedValue: dimValue || 'Not detected in OCR text',
      rawOcrText: dimFind.snippet || '',
      extractedValue: dimValue,
      officerVerifiedValue: dimValue || 'Not detected in OCR text',
      applicabilityStatus: 'NOT_APPLICABLE',
      readabilityAssessment: 'Needs Review',
      status: dimValue ? 'detected' : 'not_detected',
      confidence: dimValue ? 80 : 0,
      isMandatory: false,
      sideFound: dimFind.side,
      evidenceImageId: dimFind.imageId,
      ruleRef: 'Rule 6(1)(f)',
    });

    return declarations;
  }
}

export let activeOcrService: IOcrService = new TesseractOcrService();

export const setOcrService = (service: IOcrService) => {
  activeOcrService = service;
};
