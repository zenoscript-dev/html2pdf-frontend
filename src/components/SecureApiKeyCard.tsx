/**
 * Secure API Key Display Component - Llama Cloud Style
 * Implements show-once pattern with masked display
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ApiKey, CreateApiKeyResponse } from '@/services/html2pdfApi';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Copy, Eye, EyeOff, Key, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SecureApiKeyCardProps {
  apiKey: ApiKey;
  onEdit: (key: ApiKey) => void;
  onDelete: (keyId: string) => void;
  isDeleting?: boolean;
}

export function SecureApiKeyCard({
  apiKey,
  onEdit,
  onDelete,
  isDeleting = false
}: SecureApiKeyCardProps) {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyPrefix = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.keyPrefix);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{apiKey.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={apiKey.type === 'LIVE' ? 'default' : 'secondary'}>
              {apiKey.type}
            </Badge>
            <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
              {apiKey.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">API Key</span>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Secure</span>
            </div>
          </div>
          
          <div className="bg-muted p-3 rounded-lg font-mono text-sm">
            <span className="text-muted-foreground">{apiKey.keyPrefix}</span>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Security Notice:</strong> The full API key is only shown once during creation. 
              Copy the key prefix above for reference, but store the full key securely.
            </AlertDescription>
          </Alert>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPrefix}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showCopied ? 'Copied!' : 'Copy key prefix'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(apiKey)}
          >
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(apiKey.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Key Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Created: {formatDistanceToNow(new Date(apiKey.createdAt), { addSuffix: true })}</div>
          {apiKey.lastUsedAt && (
            <div>Last used: {formatDistanceToNow(new Date(apiKey.lastUsedAt), { addSuffix: true })}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Show-Once API Key Creation Component
 * Displays the full key only once during creation
 */
interface ShowOnceKeyDisplayProps {
  createdKey: CreateApiKeyResponse;
  onClose: () => void;
}

export function ShowOnceKeyDisplay({ createdKey, onClose }: ShowOnceKeyDisplayProps) {
  const [showKey, setShowKey] = useState(true); // Show key immediately
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(createdKey.key);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card className="w-full border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Key className="h-5 w-5" />
          API Key Created Successfully
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This is the only time you'll see the full API key. 
            Copy it now and store it securely. You won't be able to view it again.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Full API Key</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showKey ? 'Hide' : 'Show'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg font-mono text-sm border">
            <span className="text-foreground break-all">{createdKey.key}</span>
          </div>
          
          {showCopied && (
            <div className="text-sm text-green-600 font-medium">
              ✅ API key copied to clipboard!
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Key Prefix: <code className="bg-muted px-1 rounded">{createdKey.keyPrefix}</code>
          </div>
          <Button onClick={onClose}>
            I've Saved My Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Secure API Key Selector - Server-Side Proxy Pattern
 * Only sends API key IDs, never the actual keys
 */
interface SecureApiKeySelectorProps {
  apiKeys: ApiKey[];
  selectedKeyId?: string;
  onKeySelect?: (keyId: string) => void;
  placeholder?: string;
}

export function SecureApiKeySelector({
  apiKeys,
  selectedKeyId,
  onKeySelect,
  placeholder = "Select an API key"
}: SecureApiKeySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedKey = apiKeys.find(key => key.id === selectedKeyId);

  const handleKeySelect = (keyId: string) => {
    onKeySelect?.(keyId);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="justify-between w-full"
        >
          <span>
            {selectedKey ? selectedKey.name : placeholder}
          </span>
          <Shield className="h-4 w-4 text-green-500" />
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
              onClick={() => handleKeySelect(key.id)}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{key.name}</span>
                <Badge variant={key.type === 'LIVE' ? 'default' : 'secondary'} className="text-xs">
                  {key.type}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${key.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                <Shield className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
