import axiosInstance from '@/core/api/axiosInstance';
import type { ConvertHtmlTextRequest, ConvertUrlRequest } from '@/models/pdf.types';

/**
 * PDF Conversion Service
 * Handles all PDF conversion operations with the backend API
 */

const PDF_BASE_URL = '/convert';

// Helper function to download blob as file
export const downloadPdfBlob = (blob: Blob, filename: string = 'converted.pdf') => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Convert HTML text/code to PDF
 * @param html - HTML content as string
 * @returns PDF blob
 */
export const convertHtmlTextToPdf = async (html: string): Promise<Blob> => {
  const requestData: ConvertHtmlTextRequest = { html };
  
  const response = await axiosInstance.post(
    `${PDF_BASE_URL}/html-text`,
    requestData,
    {
      responseType: 'blob',
      timeout: 60000, // 60 seconds for PDF generation
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

/**
 * Convert HTML file to PDF
 * @param file - HTML file to convert
 * @returns PDF blob
 */
export const convertHtmlFileToPdf = async (file: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post(
    `${PDF_BASE_URL}/html-file`,
    formData,
    {
      responseType: 'blob',
      timeout: 60000, // 60 seconds for PDF generation
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Convert URL/webpage to PDF
 * @param url - URL of the webpage to convert
 * @returns PDF blob
 */
export const convertUrlToPdf = async (url: string): Promise<Blob> => {
  const requestData: ConvertUrlRequest = { url };

  const response = await axiosInstance.post(
    `${PDF_BASE_URL}/url`,
    requestData,
    {
      responseType: 'blob',
      timeout: 90000, // 90 seconds for URL conversion (takes longer)
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

/**
 * Convenience function: Convert HTML text and download immediately
 */
export const convertAndDownloadHtmlText = async (html: string, filename?: string): Promise<void> => {
  const blob = await convertHtmlTextToPdf(html);
  downloadPdfBlob(blob, filename);
};

/**
 * Convenience function: Convert HTML file and download immediately
 */
export const convertAndDownloadHtmlFile = async (file: File, filename?: string): Promise<void> => {
  const blob = await convertHtmlFileToPdf(file);
  downloadPdfBlob(blob, filename || `${file.name.replace(/\.html?$/i, '')}.pdf`);
};

/**
 * Convenience function: Convert URL and download immediately
 */
export const convertAndDownloadUrl = async (url: string, filename?: string): Promise<void> => {
  const blob = await convertUrlToPdf(url);
  downloadPdfBlob(blob, filename || 'webpage.pdf');
};

