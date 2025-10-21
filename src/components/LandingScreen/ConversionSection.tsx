import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import {
  convertAndDownloadHtmlFile,
  convertAndDownloadHtmlText,
  convertAndDownloadUrl
} from '@/services/pdf/pdf.service';
import { CheckCircle2, Code, Download, FileUp, Link, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

const ConversionSection: React.FC = () => {
  const { toast } = useToast();
  const [htmlContent, setHtmlContent] = useState('<h1>Hello World</h1>\n<p>This is a test PDF.</p>');
  const [url, setUrl] = useState('https://example.com');
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvertHTML = async () => {
    if (!htmlContent.trim()) {
      toast({
        title: 'Empty Content',
        description: 'Please enter some HTML content first',
        variant: 'destructive',
      });
      return;
    }

    setIsConverting(true);
    try {
      await convertAndDownloadHtmlText(htmlContent, 'converted-html.pdf');
      toast({
        title: 'Success!',
        description: 'HTML converted to PDF successfully. Check your downloads.',
        variant: 'default',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert HTML to PDF';
      toast({
        title: 'Conversion Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvertURL = async () => {
    if (!url.trim()) {
      toast({
        title: 'Empty URL',
        description: 'Please enter a URL first',
        variant: 'destructive',
      });
      return;
    }

    setIsConverting(true);
    try {
      await convertAndDownloadUrl(url, 'converted-webpage.pdf');
      toast({
        title: 'Success!',
        description: 'URL converted to PDF successfully. Check your downloads.',
        variant: 'default',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert URL to PDF';
      toast({
        title: 'Conversion Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvertFile = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select an HTML file first',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.name.match(/\.(html|htm)$/i)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an HTML file (.html or .htm)',
        variant: 'destructive',
      });
      return;
    }

    setIsConverting(true);
    try {
      await convertAndDownloadHtmlFile(file);
      toast({
        title: 'Success!',
        description: 'File converted to PDF successfully. Check your downloads.',
        variant: 'default',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert file to PDF';
      toast({
        title: 'Conversion Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <section id="test-conversion" className="relative py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-light-orange-100 dark:bg-light-orange-900 px-4 py-2 text-sm font-medium text-light-orange-700 dark:text-light-orange-400 border border-light-orange-400 dark:border-light-orange-600">
              <Sparkles className="h-4 w-4" />
              <span>Try It Yourself</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Three Ways to Convert
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the method that works best for you. All methods produce high-quality PDFs in seconds.
            </p>
          </div>

          {/* Conversion Tabs */}
          <Card className="bg-card border-border shadow-2xl">
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-t-xl">
                <TabsTrigger
                  value="html"
                  className="text-foreground data-[state=active]:bg-tropical-indigo-100 dark:data-[state=active]:bg-tropical-indigo-800 data-[state=active]:text-tropical-indigo-700 dark:data-[state=active]:text-tropical-indigo-200"
                >
                  <Code className="mr-2 h-4 w-4" />
                  HTML Code
                </TabsTrigger>
                <TabsTrigger
                  value="url"
                  className="text-foreground data-[state=active]:bg-cambridge-blue-100 dark:data-[state=active]:bg-cambridge-blue-800 data-[state=active]:text-cambridge-blue-700 dark:data-[state=active]:text-cambridge-blue-200"
                >
                  <Link className="mr-2 h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger
                  value="file"
                  className="text-foreground data-[state=active]:bg-puce-100 dark:data-[state=active]:bg-puce-800 data-[state=active]:text-puce-700 dark:data-[state=active]:text-puce-200"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  File Upload
                </TabsTrigger>
              </TabsList>

              {/* HTML Code Tab */}
              <TabsContent value="html" className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="html-content" className="text-base font-semibold text-foreground">
                      Enter your HTML code
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Paste your HTML content below and we'll convert it to a PDF instantly.
                    </p>
                    <Textarea
                      id="html-content"
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      placeholder="<h1>Your HTML content here...</h1>"
                      className="min-h-[200px] font-mono text-sm bg-muted/50"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleConvertHTML}
                      disabled={isConverting || !htmlContent}
                      className="bg-tropical-indigo-600 hover:bg-tropical-indigo-700 dark:bg-tropical-indigo-500 dark:hover:bg-tropical-indigo-600 text-white"
                    >
                      {isConverting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Convert to PDF
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                      Instant conversion
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* URL Tab */}
              <TabsContent value="url" className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="url-input" className="text-base font-semibold text-foreground">
                      Enter a URL
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Provide any web page URL and we'll capture it as a PDF for you.
                    </p>
                    <Input
                      id="url-input"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="text-base"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleConvertURL}
                      disabled={isConverting || !url}
                      className="bg-cambridge-blue-600 hover:bg-cambridge-blue-700 dark:bg-cambridge-blue-500 dark:hover:bg-cambridge-blue-600 text-white"
                    >
                      {isConverting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Convert to PDF
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                      Full page capture
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* File Upload Tab */}
              <TabsContent value="file" className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload" className="text-base font-semibold text-foreground">
                      Upload HTML file
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select an HTML file from your computer to convert to PDF.
                    </p>
                    <div className="flex items-center gap-4">
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".html,.htm"
                        onChange={handleFileChange}
                        className="text-base"
                      />
                      {file && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                          {file.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleConvertFile}
                      disabled={isConverting || !file}
                      className="bg-puce-600 hover:bg-puce-700 dark:bg-puce-500 dark:hover:bg-puce-600 text-white"
                    >
                      {isConverting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Convert to PDF
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                      Preserves styling
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Features Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-puce-50 dark:bg-puce-950 border-puce-200 dark:border-puce-800">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-puce-600 dark:bg-puce-500 text-white shrink-0">
                  <Code className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-puce-900 dark:text-puce-100 mb-2">HTML Code</h3>
                  <p className="text-sm text-puce-700 dark:text-puce-300">
                    Perfect for developers. Paste your HTML and get an instant PDF output with all styles preserved.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-puce-50 dark:bg-puce-950 border-puce-200 dark:border-puce-800">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-puce-600 dark:bg-puce-500 text-white shrink-0">
                  <Link className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-puce-900 dark:text-puce-100 mb-2">URL Conversion</h3>
                  <p className="text-sm text-puce-700 dark:text-puce-300">
                    Simply provide any website URL and we'll capture the entire page as a high-quality PDF.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-puce-50 dark:bg-puce-950 border-puce-200 dark:border-puce-800">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-puce-600 dark:bg-puce-500 text-white shrink-0">
                  <FileUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-puce-900 dark:text-puce-100 mb-2">File Upload</h3>
                  <p className="text-sm text-puce-700 dark:text-puce-300">
                    Upload HTML files directly from your computer for quick batch processing and conversion.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConversionSection;

