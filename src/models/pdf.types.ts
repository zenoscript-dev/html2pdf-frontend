/**
 * PDF Conversion API Types
 */

export interface ConvertHtmlTextRequest {
  html: string;
}

export interface ConvertUrlRequest {
  url: string;
}

export interface PdfResponse {
  data: Blob;
  filename: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

