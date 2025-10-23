import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiKeysApi } from '@/services/html2pdfApi';
import { go } from '@codemirror/lang-go';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { useQuery } from '@tanstack/react-query';
import CodeMirror from '@uiw/react-codemirror';
import {
    BookOpen,
    Code,
    Copy,
    ExternalLink,
    FileText,
    Globe,
    Key,
    Lock,
    Shield,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function ApiDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const location = useLocation();
  
  // Extract language from path
  const currentLanguage = location.pathname.split('/').pop() || 'overview';
  
  const { data: apiKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysApi.getAll(),
  });

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8900/api/v1';
  const sampleApiKey = apiKeys?.[0]?.keyPrefix || 'pdf_live_1234...';

  const curlExamples = {
    html: `curl -X POST \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "X-API-Key: ${sampleApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "html": "<h1>Hello World</h1><p>This is a test PDF.</p>",
    "options": {
      "format": "A4",
      "orientation": "portrait",
      "margin": "1cm"
    }
  }' \\
  "${baseUrl}/pdf/generate-from-html"`,
    
    url: `curl -X POST \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "X-API-Key: ${sampleApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "options": {
      "format": "A4",
      "orientation": "landscape",
      "margin": "0.5cm"
    }
  }' \\
  "${baseUrl}/pdf/generate-from-url"`,
    
    file: `curl -X POST \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "X-API-Key: ${sampleApiKey}" \\
  -F "file=@document.html" \\
  -F 'options={"format":"A4","orientation":"portrait"}' \\
  "${baseUrl}/pdf/generate-from-html-file"`
  };

  const javascriptExamples = {
    html: `const response = await fetch('${baseUrl}/pdf/generate-from-html', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'X-API-Key': '${sampleApiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    html: '<h1>Hello World</h1><p>This is a test PDF.</p>',
    options: {
      format: 'A4',
      orientation: 'portrait',
      margin: '1cm'
    }
  })
});

const pdfBlob = await response.blob();`,
    
    url: `const response = await fetch('${baseUrl}/pdf/generate-from-url', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'X-API-Key': '${sampleApiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com',
    options: {
      format: 'A4',
      orientation: 'landscape',
      margin: '0.5cm'
    }
  })
});

const pdfBlob = await response.blob();`,
    
    file: `const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('options', JSON.stringify({
  format: 'A4',
  orientation: 'portrait'
}));

const response = await fetch('${baseUrl}/pdf/generate-from-html-file', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'X-API-Key': '${sampleApiKey}'
  },
  body: formData
});

const pdfBlob = await response.blob();`
  };

  const goExamples = {
    html: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
)

type PDFRequest struct {
    HTML    string                 \`json:"html"\`
    Options map[string]interface{} \`json:"options"\`
}

func main() {
    url := "${baseUrl}/pdf/generate-from-html"
    
    request := PDFRequest{
        HTML: "<h1>Hello World</h1><p>This is a test PDF.</p>",
        Options: map[string]interface{}{
            "format":      "A4",
            "orientation": "portrait",
            "margin":      "1cm",
        },
    }
    
    jsonData, err := json.Marshal(request)
    if err != nil {
        panic(err)
    }
    
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    if err != nil {
        panic(err)
    }
    
    req.Header.Set("Authorization", "Bearer YOUR_ACCESS_TOKEN")
    req.Header.Set("X-API-Key", "${sampleApiKey}")
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    pdfData, err := io.ReadAll(resp.Body)
    if err != nil {
        panic(err)
    }
    
    // Save PDF to file
    err = os.WriteFile("output.pdf", pdfData, 0644)
    if err != nil {
        panic(err)
    }
    
    fmt.Println("PDF generated successfully!")
}`,
    
    url: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
)

type PDFRequest struct {
    URL     string                 \`json:"url"\`
    Options map[string]interface{} \`json:"options"\`
}

func main() {
    url := "${baseUrl}/pdf/generate-from-url"
    
    request := PDFRequest{
        URL: "https://example.com",
        Options: map[string]interface{}{
            "format":      "A4",
            "orientation": "landscape",
            "margin":      "0.5cm",
        },
    }
    
    jsonData, err := json.Marshal(request)
    if err != nil {
        panic(err)
    }
    
    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    if err != nil {
        panic(err)
    }
    
    req.Header.Set("Authorization", "Bearer YOUR_ACCESS_TOKEN")
    req.Header.Set("X-API-Key", "${sampleApiKey}")
    req.Header.Set("Content-Type", "application/json")
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    pdfData, err := io.ReadAll(resp.Body)
    if err != nil {
        panic(err)
    }
    
    // Save PDF to file
    err = os.WriteFile("output.pdf", pdfData, 0644)
    if err != nil {
        panic(err)
    }
    
    fmt.Println("PDF generated successfully!")
}`,
    
    file: `package main

import (
    "bytes"
    "fmt"
    "io"
    "mime/multipart"
    "net/http"
    "os"
)

func main() {
    url := "${baseUrl}/pdf/generate-from-html-file"
    
    // Create multipart form data
    var b bytes.Buffer
    w := multipart.NewWriter(&b)
    
    // Add file
    fw, err := w.CreateFormFile("file", "document.html")
    if err != nil {
        panic(err)
    }
    
    file, err := os.Open("document.html")
    if err != nil {
        panic(err)
    }
    defer file.Close()
    
    _, err = io.Copy(fw, file)
    if err != nil {
        panic(err)
    }
    
    // Add options
    fw, err = w.CreateFormField("options")
    if err != nil {
        panic(err)
    }
    _, err = fw.Write([]byte(\`{"format":"A4","orientation":"portrait"}\`))
    if err != nil {
        panic(err)
    }
    
    w.Close()
    
    req, err := http.NewRequest("POST", url, &b)
    if err != nil {
        panic(err)
    }
    
    req.Header.Set("Authorization", "Bearer YOUR_ACCESS_TOKEN")
    req.Header.Set("X-API-Key", "${sampleApiKey}")
    req.Header.Set("Content-Type", w.FormDataContentType())
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    pdfData, err := io.ReadAll(resp.Body)
    if err != nil {
        panic(err)
    }
    
    // Save PDF to file
    err = os.WriteFile("output.pdf", pdfData, 0644)
    if err != nil {
        panic(err)
    }
    
    fmt.Println("PDF generated successfully!")
}`
  };

  const javaExamples = {
    html: `import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class PDFGenerator {
    public static void main(String[] args) throws Exception {
        String url = "${baseUrl}/pdf/generate-from-html";
        
        // Create JSON request
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode request = mapper.createObjectNode();
        request.put("html", "<h1>Hello World</h1><p>This is a test PDF.</p>");
        
        ObjectNode options = mapper.createObjectNode();
        options.put("format", "A4");
        options.put("orientation", "portrait");
        options.put("margin", "1cm");
        request.set("options", options);
        
        String jsonInputString = mapper.writeValueAsString(request);
        
        HttpURLConnection con = (HttpURLConnection) new URL(url).openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("Authorization", "Bearer YOUR_ACCESS_TOKEN");
        con.setRequestProperty("X-API-Key", "${sampleApiKey}");
        con.setRequestProperty("Content-Type", "application/json");
        con.setDoOutput(true);
        
        try (OutputStream os = con.getOutputStream()) {
            byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
        
        try (InputStream is = con.getInputStream()) {
            try (FileOutputStream fos = new FileOutputStream("output.pdf")) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
            }
        }
        
        System.out.println("PDF generated successfully!");
    }
}`,
    
    url: `import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class PDFGenerator {
    public static void main(String[] args) throws Exception {
        String url = "${baseUrl}/pdf/generate-from-url";
        
        // Create JSON request
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode request = mapper.createObjectNode();
        request.put("url", "https://example.com");
        
        ObjectNode options = mapper.createObjectNode();
        options.put("format", "A4");
        options.put("orientation", "landscape");
        options.put("margin", "0.5cm");
        request.set("options", options);
        
        String jsonInputString = mapper.writeValueAsString(request);
        
        HttpURLConnection con = (HttpURLConnection) new URL(url).openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("Authorization", "Bearer YOUR_ACCESS_TOKEN");
        con.setRequestProperty("X-API-Key", "${sampleApiKey}");
        con.setRequestProperty("Content-Type", "application/json");
        con.setDoOutput(true);
        
        try (OutputStream os = con.getOutputStream()) {
            byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
        
        try (InputStream is = con.getInputStream()) {
            try (FileOutputStream fos = new FileOutputStream("output.pdf")) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
            }
        }
        
        System.out.println("PDF generated successfully!");
    }
}`,
    
    file: `import java.io.*;
import java.net.*;
import java.nio.file.Files;
import java.nio.file.Paths;

public class PDFGenerator {
    public static void main(String[] args) throws Exception {
        String url = "${baseUrl}/pdf/generate-from-html-file";
        
        // Create multipart form data
        String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
        
        HttpURLConnection con = (HttpURLConnection) new URL(url).openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("Authorization", "Bearer YOUR_ACCESS_TOKEN");
        con.setRequestProperty("X-API-Key", "${sampleApiKey}");
        con.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
        con.setDoOutput(true);
        
        try (OutputStream os = con.getOutputStream()) {
            // Add file
            os.write(("--" + boundary + "\r\n").getBytes());
            os.write("Content-Disposition: form-data; name=file; filename=document.html\r\n".getBytes());
            os.write("Content-Type: text/html\r\n\r\n".getBytes());
            
            byte[] fileBytes = Files.readAllBytes(Paths.get("document.html"));
            os.write(fileBytes);
            os.write("\r\n".getBytes());
            
            // Add options
            os.write(("--" + boundary + "\r\n").getBytes());
            os.write("Content-Disposition: form-data; name=options\r\n\r\n".getBytes());
            os.write("{format:A4,orientation:portrait}".getBytes());
            os.write("\r\n".getBytes());
            
            // End boundary
            os.write(("--" + boundary + "--\r\n").getBytes());
        }
        
        try (InputStream is = con.getInputStream()) {
            try (FileOutputStream fos = new FileOutputStream("output.pdf")) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
            }
        }
        
        System.out.println("PDF generated successfully!");
    }
}`
  };

  const pythonExamples = {
    html: `import requests

url = "${baseUrl}/pdf/generate-from-html"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "X-API-Key": "${sampleApiKey}",
    "Content-Type": "application/json"
}
data = {
    "html": "<h1>Hello World</h1><p>This is a test PDF.</p>",
    "options": {
        "format": "A4",
        "orientation": "portrait",
        "margin": "1cm"
    }
}

response = requests.post(url, headers=headers, json=data)
pdf_content = response.content`,
    
    url: `import requests

url = "${baseUrl}/pdf/generate-from-url"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "X-API-Key": "${sampleApiKey}",
    "Content-Type": "application/json"
}
data = {
    "url": "https://example.com",
    "options": {
        "format": "A4",
        "orientation": "landscape",
        "margin": "0.5cm"
    }
}

response = requests.post(url, headers=headers, json=data)
pdf_content = response.content`,
    
    file: `import requests

url = "${baseUrl}/pdf/generate-from-html-file"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "X-API-Key": "${sampleApiKey}"
}
files = {
    "file": open("document.html", "rb")
}
data = {
    "options": '{"format":"A4","orientation":"portrait"}'
}

response = requests.post(url, headers=headers, files=files, data=data)
pdf_content = response.content`
  };

  const CodeBlock = ({ code, id, language }: { code: string; id: string; language: string }) => {
    const getLanguageColor = (lang: string) => {
      switch (lang.toLowerCase()) {
        case 'javascript':
        case 'js':
          return 'text-yellow-500';
        case 'python':
        case 'py':
          return 'text-blue-500';
        case 'go':
          return 'text-cyan-500';
        case 'java':
          return 'text-orange-500';
        case 'bash':
        case 'shell':
        case 'curl':
          return 'text-green-500';
        default:
          return 'text-gray-500';
      }
    };

    const getCodeMirrorLanguage = (lang: string) => {
      switch (lang.toLowerCase()) {
        case 'javascript':
        case 'js':
          return [javascript()];
        case 'python':
        case 'py':
          return [python()];
        case 'go':
          return [go()];
        case 'java':
          return [java()];
        case 'bash':
        case 'shell':
        case 'curl':
          return []; // No specific language support for bash in CodeMirror
        default:
          return [];
      }
    };

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className={`text-xs ${getLanguageColor(language)}`}>
            {language}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopyCode(code, id)}
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <div className="rounded-lg overflow-hidden border">
          <CodeMirror
            value={code}
            extensions={getCodeMirrorLanguage(language)}
            theme={oneDark}
            editable={false}
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: false,
              bracketMatching: false,
              closeBrackets: false,
              autocompletion: false,
              highlightSelectionMatches: false,
              searchKeymap: false,
            }}
            style={{
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
          />
        </div>
        {copiedCode === id && (
          <div className="absolute top-2 right-2 text-xs text-green-400 font-medium">
            Copied!
          </div>
        )}
      </div>
    );
  };

  // Get examples based on current language
  const getExamples = () => {
    switch (currentLanguage) {
      case 'javascript':
        return javascriptExamples;
      case 'python':
        return pythonExamples;
      case 'go':
        return goExamples;
      case 'java':
        return javaExamples;
      default:
        return { html: curlExamples.html, url: curlExamples.url, file: curlExamples.file };
    }
  };

  const examples = getExamples();
  const languageName = currentLanguage === 'overview' ? 'cURL' : currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1);

  // Show language-specific content
  if (currentLanguage !== 'overview') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{languageName} Examples</h1>
            <p className="text-muted-foreground">
              Complete {languageName} examples for HTML2PDF API integration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Code className="h-3 w-3 text-blue-500" />
              {languageName}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              Production Ready
            </Badge>
          </div>
        </div>

        {/* Language-specific Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              {languageName} Code Examples
            </CardTitle>
            <CardDescription>
              Copy-paste examples for {languageName} integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="html" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="html">HTML Content</TabsTrigger>
                <TabsTrigger value="url">From URL</TabsTrigger>
                <TabsTrigger value="file">From File</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Generate PDF from HTML</h4>
                  <CodeBlock code={examples.html} id={`${currentLanguage}-html`} language={currentLanguage} />
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Generate PDF from URL</h4>
                  <CodeBlock code={examples.url} id={`${currentLanguage}-url`} language={currentLanguage} />
                </div>
              </TabsContent>

              <TabsContent value="file" className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Generate PDF from HTML File</h4>
                  <CodeBlock code={examples.file} id={`${currentLanguage}-file`} language={currentLanguage} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dependencies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Dependencies & Setup
            </CardTitle>
            <CardDescription>
              Required dependencies and setup instructions for {languageName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentLanguage === 'javascript' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">No Dependencies Required</h4>
                  <p className="text-sm text-muted-foreground">
                    JavaScript examples use the native fetch API, no additional packages needed.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Node.js Alternative</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm border">
                    <div><span className="text-blue-400 font-semibold">npm</span> <span className="text-green-400">install</span> <span className="text-yellow-400">axios</span></div>
                  </div>
                </div>
              </div>
            )}
            
            {currentLanguage === 'python' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Install Dependencies</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm border">
                    <div><span className="text-blue-400 font-semibold">pip</span> <span className="text-green-400">install</span> <span className="text-yellow-400">requests</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Alternative Libraries</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm border">
                    <div><span className="text-blue-400 font-semibold">pip</span> <span className="text-green-400">install</span> <span className="text-yellow-400">httpx</span>  <span className="text-gray-500 italic"># Modern async alternative</span></div>
                    <div><span className="text-blue-400 font-semibold">pip</span> <span className="text-green-400">install</span> <span className="text-yellow-400">aiohttp</span>  <span className="text-gray-500 italic"># Async HTTP client</span></div>
                  </div>
                </div>
              </div>
            )}
            
            {currentLanguage === 'go' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">No External Dependencies</h4>
                  <p className="text-sm text-muted-foreground">
                    Go examples use only standard library packages.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Run Examples</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm border">
                    <div><span className="text-blue-400 font-semibold">go</span> <span className="text-green-400">run</span> <span className="text-yellow-400">main.go</span></div>
                  </div>
                </div>
              </div>
            )}
            
            {currentLanguage === 'java' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Maven Dependencies</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm border">
                    <div><span className="text-orange-400">&lt;dependency&gt;</span></div>
                    <div className="ml-4"><span className="text-orange-400">&lt;groupId&gt;</span><span className="text-green-400">com.fasterxml.jackson.core</span><span className="text-orange-400">&lt;/groupId&gt;</span></div>
                    <div className="ml-4"><span className="text-orange-400">&lt;artifactId&gt;</span><span className="text-green-400">jackson-databind</span><span className="text-orange-400">&lt;/artifactId&gt;</span></div>
                    <div className="ml-4"><span className="text-orange-400">&lt;version&gt;</span><span className="text-yellow-400">2.15.2</span><span className="text-orange-400">&lt;/version&gt;</span></div>
                    <div><span className="text-orange-400">&lt;/dependency&gt;</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Gradle Alternative</h4>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm border">
                    <div><span className="text-blue-400 font-semibold">implementation</span> <span className="text-green-400">'com.fasterxml.jackson.core:jackson-databind:2.15.2'</span></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quick Reference
            </CardTitle>
            <CardDescription>
              Essential information for {languageName} integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Base URL</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded">{baseUrl}</code>
              </div>
              <div>
                <h4 className="font-medium mb-2">API Key</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded">{sampleApiKey}</code>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Required Headers</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <code>Authorization</code>
                  <span className="text-muted-foreground">Bearer YOUR_ACCESS_TOKEN</span>
                </div>
                <div className="flex justify-between">
                  <code>X-API-Key</code>
                  <span className="text-muted-foreground">Your API Key</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Original overview content
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground">
            Complete guide to integrating HTML2PDF API into your applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-green-500" />
            Production Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            High Performance
          </Badge>
        </div>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Get up and running with HTML2PDF API in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">1. Get API Key</h4>
                <p className="text-xs text-muted-foreground">Create your API key</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Code className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">2. Make Request</h4>
                <p className="text-xs text-muted-foreground">Send HTML/URL to API</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">3. Get PDF</h4>
                <p className="text-xs text-muted-foreground">Receive PDF binary</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Secure your API requests with proper authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Access Token</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Include your access token in the Authorization header for user-specific requests.
              </p>
              <CodeBlock
                code={`Authorization: Bearer YOUR_ACCESS_TOKEN`}
                id="auth-header"
                language="Header"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">API Key</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Include your API key in the X-API-Key header for PDF generation requests.
              </p>
              <CodeBlock
                code={`X-API-Key: ${sampleApiKey}`}
                id="api-key-header"
                language="Header"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            API Endpoints
          </CardTitle>
          <CardDescription>
            Available endpoints for PDF generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  POST
                </Badge>
                <code className="text-sm font-mono">/pdf/generate-from-html</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Generate PDF from HTML content string
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Content-Type:</strong> application/json
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  POST
                </Badge>
                <code className="text-sm font-mono">/pdf/generate-from-url</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Generate PDF from a web URL
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Content-Type:</strong> application/json
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  POST
                </Badge>
                <code className="text-sm font-mono">/pdf/generate-from-html-file</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Generate PDF from uploaded HTML file
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Content-Type:</strong> multipart/form-data
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Examples
          </CardTitle>
          <CardDescription>
            Copy-paste examples for different programming languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="html" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="html">HTML Content</TabsTrigger>
              <TabsTrigger value="url">From URL</TabsTrigger>
              <TabsTrigger value="file">From File</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">cURL</h4>
                <CodeBlock code={curlExamples.html} id="curl-html" language="bash" />
              </div>
              <div>
                <h4 className="font-medium mb-3">JavaScript</h4>
                <CodeBlock code={javascriptExamples.html} id="js-html" language="javascript" />
              </div>
              <div>
                <h4 className="font-medium mb-3">Python</h4>
                <CodeBlock code={pythonExamples.html} id="python-html" language="python" />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">cURL</h4>
                <CodeBlock code={curlExamples.url} id="curl-url" language="bash" />
              </div>
              <div>
                <h4 className="font-medium mb-3">JavaScript</h4>
                <CodeBlock code={javascriptExamples.url} id="js-url" language="javascript" />
              </div>
              <div>
                <h4 className="font-medium mb-3">Python</h4>
                <CodeBlock code={pythonExamples.url} id="python-url" language="python" />
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">cURL</h4>
                <CodeBlock code={curlExamples.file} id="curl-file" language="bash" />
              </div>
              <div>
                <h4 className="font-medium mb-3">JavaScript</h4>
                <CodeBlock code={javascriptExamples.file} id="js-file" language="javascript" />
              </div>
              <div>
                <h4 className="font-medium mb-3">Python</h4>
                <CodeBlock code={pythonExamples.file} id="python-file" language="python" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Request/Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Request Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Headers</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code>Authorization</code>
                  <span className="text-muted-foreground">Bearer YOUR_ACCESS_TOKEN</span>
                </div>
                <div className="flex justify-between">
                  <code>X-API-Key</code>
                  <span className="text-muted-foreground">Your API Key</span>
                </div>
                <div className="flex justify-between">
                  <code>Content-Type</code>
                  <span className="text-muted-foreground">application/json</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Body Parameters</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code>html</code>
                  <span className="text-muted-foreground">string (optional)</span>
                </div>
                <div className="flex justify-between">
                  <code>url</code>
                  <span className="text-muted-foreground">string (optional)</span>
                </div>
                <div className="flex justify-between">
                  <code>options</code>
                  <span className="text-muted-foreground">object (optional)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Response Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Success Response</h4>
              <div className="text-sm space-y-1">
                <div><strong>Status:</strong> 200 OK</div>
                <div><strong>Content-Type:</strong> application/pdf</div>
                <div><strong>Body:</strong> PDF binary data</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Error Response</h4>
              <div className="text-sm space-y-1">
                <div><strong>Status:</strong> 400/401/403/500</div>
                <div><strong>Content-Type:</strong> application/json</div>
                <div><strong>Body:</strong> Error message object</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Options
          </CardTitle>
          <CardDescription>
            Customize your PDF output with these options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Option</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Default</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="p-2 font-mono">format</td>
                  <td className="p-2">string</td>
                  <td className="p-2">"A4"</td>
                  <td className="p-2">Paper format (A4, A3, Letter, etc.)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">orientation</td>
                  <td className="p-2">string</td>
                  <td className="p-2">"portrait"</td>
                  <td className="p-2">Page orientation (portrait, landscape)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">margin</td>
                  <td className="p-2">string</td>
                  <td className="p-2">"1cm"</td>
                  <td className="p-2">Page margins (e.g., "1cm", "0.5in")</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">scale</td>
                  <td className="p-2">number</td>
                  <td className="p-2">1.0</td>
                  <td className="p-2">Scale factor (0.1 to 2.0)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">displayHeaderFooter</td>
                  <td className="p-2">boolean</td>
                  <td className="p-2">false</td>
                  <td className="p-2">Show header and footer</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono">printBackground</td>
                  <td className="p-2">boolean</td>
                  <td className="p-2">true</td>
                  <td className="p-2">Print background colors and images</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rate Limits & Quotas
          </CardTitle>
          <CardDescription>
            Understanding your usage limits and quotas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Free Plan</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• 100 PDFs per month</div>
                <div>• 10 PDFs per day</div>
                <div>• Max 10 pages per PDF</div>
                <div>• Max 5MB file size</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Pro Plan</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• 1,000 PDFs per month</div>
                <div>• 100 PDFs per day</div>
                <div>• Max 50 pages per PDF</div>
                <div>• Max 25MB file size</div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Rate Limit:</strong> 10 requests per second per API key
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Error Codes
          </CardTitle>
          <CardDescription>
            Common error responses and how to handle them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="destructive" className="mt-0.5">400</Badge>
              <div>
                <h4 className="font-medium text-sm">Bad Request</h4>
                <p className="text-xs text-muted-foreground">
                  Invalid request parameters or malformed JSON
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="destructive" className="mt-0.5">401</Badge>
              <div>
                <h4 className="font-medium text-sm">Unauthorized</h4>
                <p className="text-xs text-muted-foreground">
                  Missing or invalid access token
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="destructive" className="mt-0.5">403</Badge>
              <div>
                <h4 className="font-medium text-sm">Forbidden</h4>
                <p className="text-xs text-muted-foreground">
                  Invalid API key or insufficient permissions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="destructive" className="mt-0.5">429</Badge>
              <div>
                <h4 className="font-medium text-sm">Too Many Requests</h4>
                <p className="text-xs text-muted-foreground">
                  Rate limit exceeded
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant="destructive" className="mt-0.5">500</Badge>
              <div>
                <h4 className="font-medium text-sm">Internal Server Error</h4>
                <p className="text-xs text-muted-foreground">
                  Server error, please try again later
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
