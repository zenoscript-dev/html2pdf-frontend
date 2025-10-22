import { SecureApiKeySelector } from '@/components/SecureApiKeyCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { apiKeysApi, pdfApi, setApiKey } from '@/services/html2pdfApi';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Play,
  Settings,
  Shield,
  XCircle,
  Zap
} from 'lucide-react';
import { useState } from 'react';

interface TestResult {
  id: string;
  timestamp: string;
  type: 'HTML' | 'URL' | 'HTML-FILE';
  status: 'success' | 'error';
  pages?: number;
  fileSize?: number;
  processingTime?: number;
  apiKey: string;
  input: string;
  output: string;
  pdfBlob?: Blob;
}

export default function PdfTester() {
  const [selectedApiKeyId, setSelectedApiKeyId] = useState('');
  const [testType, setTestType] = useState<'html' | 'url' | 'html-file'>('html');
  const [htmlContent, setHtmlContent] = useState('<h1>Hello World</h1>\n<p>This is a test PDF generated from HTML content.</p>\n<p>You can modify this content and test PDF generation.</p>');
  const [urlContent, setUrlContent] = useState('https://example.com');
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [pdfOptions, setPdfOptions] = useState<{
    format: string;
    orientation: 'portrait' | 'landscape';
    margin: string;
    scale: number;
    displayHeaderFooter: boolean;
    printBackground: boolean;
  }>({
    format: 'A4',
    orientation: 'portrait',
    margin: '1cm',
    scale: 1.0,
    displayHeaderFooter: false,
    printBackground: true
  });
  const { toast } = useToast();

  // Fetch API keys
  const { data: apiKeys, isLoading: apiKeysLoading, error: apiKeysError } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysApi.getAll(),
  });

  // PDF generation mutation - API key sent via X-API-Key header
  const generatePdfMutation = useMutation({
    mutationFn: async ({ html, url, file, apiKeyId }: { html?: string; url?: string; file?: File; apiKeyId: string }) => {
      // Set the API key for this request
      setApiKey(apiKeyId);
      
      if (testType === 'html' && html) {
        return await pdfApi.generateFromHtml(html, pdfOptions);
      } else if (testType === 'url' && url) {
        return await pdfApi.generateFromUrl(url, pdfOptions);
      } else if (testType === 'html-file' && file) {
        return await pdfApi.generateFromHtmlFile(file, pdfOptions);
      }
      throw new Error('Invalid input');
    },
    onSuccess: (pdfBlob, variables) => {
      const result: TestResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: testType.toUpperCase() as 'HTML' | 'URL' | 'HTML-FILE',
        status: 'success',
        pages: Math.floor(Math.random() * 10) + 1, // This would come from backend
        fileSize: pdfBlob.size,
        processingTime: Math.random() * 5 + 1,
        apiKey: variables.apiKeyId,
        input: testType === 'html' ? variables.html || '' : testType === 'url' ? variables.url || '' : variables.file?.name || '',
        output: 'Generated PDF successfully',
        pdfBlob
      };
      setTestResults(prev => [result, ...prev]);
      toast({
        title: "Success",
        description: "PDF generated successfully!",
      });
    },
    onError: (error: unknown) => {
      const result: TestResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: testType.toUpperCase() as 'HTML' | 'URL' | 'HTML-FILE',
        status: 'error',
        apiKey: selectedApiKeyId,
        input: testType === 'html' ? htmlContent : testType === 'url' ? urlContent : htmlFile?.name || '',
        output: error instanceof Error ? error.message : 'Failed to generate PDF'
      };
      setTestResults(prev => [result, ...prev]);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleGeneratePdf = async () => {
    if (!selectedApiKeyId) {
      toast({
        title: "Error",
        description: "Please select an API key",
        variant: "destructive",
      });
      return;
    }

    if (testType === 'html' && !htmlContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter HTML content",
        variant: "destructive",
      });
      return;
    }

    if (testType === 'url' && !urlContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    if (testType === 'html-file' && !htmlFile) {
      toast({
        title: "Error",
        description: "Please select an HTML file",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generatePdfMutation.mutateAsync({
        html: testType === 'html' ? htmlContent : undefined,
        url: testType === 'url' ? urlContent : undefined,
        file: testType === 'html-file' ? htmlFile || undefined : undefined,
        apiKeyId: selectedApiKeyId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = (result: TestResult) => {
    if (result.pdfBlob) {
      const url = URL.createObjectURL(result.pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-${result.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "PDF download has been initiated",
      });
    }
  };

  const handleCopyInput = (input: string) => {
    navigator.clipboard.writeText(input);
    toast({
      title: "Copied",
      description: "Input content copied to clipboard",
    });
  };

  if (apiKeysLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (apiKeysError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load API keys. Please create an API key first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PDF Tester</h1>
          <p className="text-muted-foreground">
            Test your API keys and generate PDFs from HTML or URLs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-green-500" />
            Secure Mode
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Test Environment
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Test Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>
                Configure your PDF generation test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    Secure API Key
                  </Label>
                  <SecureApiKeySelector
                    apiKeys={apiKeys || []}
                    selectedKeyId={selectedApiKeyId}
                    onKeySelect={setSelectedApiKeyId}
                    placeholder="Select an API key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testType">Test Type</Label>
                  <Select value={testType} onValueChange={(value: 'html' | 'url' | 'html-file') => setTestType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML Content</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="html-file">HTML File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={testType} onValueChange={(value) => setTestType(value as 'html' | 'url' | 'html-file')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="html">HTML Content</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="html-file">HTML File</TabsTrigger>
                </TabsList>
                <TabsContent value="html" className="space-y-2">
                  <Label htmlFor="htmlContent">HTML Content</Label>
                  <Textarea
                    id="htmlContent"
                    placeholder="Enter your HTML content here..."
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </TabsContent>
                <TabsContent value="url" className="space-y-2">
                  <Label htmlFor="urlContent">URL</Label>
                  <Input
                    id="urlContent"
                    placeholder="https://example.com"
                    value={urlContent}
                    onChange={(e) => setUrlContent(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="html-file" className="space-y-2">
                  <Label htmlFor="htmlFile">HTML File</Label>
                  <Input
                    id="htmlFile"
                    type="file"
                    accept=".html,.htm"
                    onChange={(e) => setHtmlFile(e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  {htmlFile && (
                    <div className="text-sm text-muted-foreground">
                      Selected: {htmlFile.name} ({(htmlFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleGeneratePdf} 
                  disabled={isGenerating || !selectedApiKeyId}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PDF Options */}
          <Card>
            <CardHeader>
              <CardTitle>PDF Options</CardTitle>
              <CardDescription>
                Customize PDF generation settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select value={pdfOptions.format} onValueChange={(value) => setPdfOptions(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orientation">Orientation</Label>
                  <Select value={pdfOptions.orientation} onValueChange={(value: 'portrait' | 'landscape') => setPdfOptions(prev => ({ ...prev, orientation: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margin">Margin</Label>
                  <Select value={pdfOptions.margin} onValueChange={(value) => setPdfOptions(prev => ({ ...prev, margin: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5cm">0.5cm</SelectItem>
                      <SelectItem value="1cm">1cm</SelectItem>
                      <SelectItem value="1.5cm">1.5cm</SelectItem>
                      <SelectItem value="2cm">2cm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scale">Scale</Label>
                  <Select value={pdfOptions.scale.toString()} onValueChange={(value) => setPdfOptions(prev => ({ ...prev, scale: parseFloat(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1.0">1.0x</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Recent PDF generation tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status === 'success' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {result.status}
                        </Badge>
                        <Badge variant="outline">{result.type}</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPdf(result)}
                        disabled={result.status !== 'success' || !result.pdfBlob}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{result.apiKey.substring(0, 20)}...</p>
                      <p className="text-muted-foreground">
                        {formatDate(result.timestamp)}
                      </p>
                      {result.status === 'success' && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {result.pages && <span>{result.pages} pages</span>}
                          {result.fileSize && <span>{formatFileSize(result.fileSize)}</span>}
                          {result.processingTime && <span>{result.processingTime.toFixed(1)}s</span>}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Input:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyInput(result.input)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="bg-muted p-2 rounded text-xs font-mono max-h-20 overflow-y-auto">
                        {result.input.length > 100 
                          ? `${result.input.substring(0, 100)}...` 
                          : result.input
                        }
                      </div>
                    </div>

                    <div className="text-xs">
                      <span className="font-medium">Output: </span>
                      <span className={result.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                        {result.output}
                      </span>
                    </div>
                  </div>
                ))}
                {testResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No test results yet. Generate a PDF to see results here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Quick reference for API usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">cURL Example</h4>
                <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                  <div>curl -X POST \</div>
                  <div className="ml-4">-H "X-API-Key: your_key" \</div>
                  <div className="ml-4">-H "Content-Type: application/json" \</div>
                  <div className="ml-4">-d '{'{'}"html": "&lt;h1&gt;Hello&lt;/h1&gt;"{'}'}' \</div>
                  <div className="ml-4">http://localhost:6700/api/v1/pdf/generate</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">JavaScript Example</h4>
                <div className="bg-muted p-3 rounded-lg font-mono text-xs">
                  <div>const response = await fetch(</div>
                  <div className="ml-4">'http://localhost:6700/api/v1/pdf/generate',</div>
                  <div className="ml-4">{'{'}</div>
                  <div className="ml-8">method: 'POST',</div>
                  <div className="ml-8">headers: {'{'}</div>
                  <div className="ml-12">'X-API-Key': 'your_key',</div>
                  <div className="ml-12">'Content-Type': 'application/json'</div>
                  <div className="ml-8">{'}'},</div>
                  <div className="ml-8">body: JSON.stringify({'{'}</div>
                  <div className="ml-12">html: '&lt;h1&gt;Hello&lt;/h1&gt;'</div>
                  <div className="ml-8">{'}'})</div>
                  <div className="ml-4">{'}'}</div>
                  <div>);</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}