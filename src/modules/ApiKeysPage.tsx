import { SecureApiKeyCard, ShowOnceKeyDisplay } from '@/components/SecureApiKeyCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/useToast';
import { type ApiKey, type CreateApiKeyResponse, apiKeysApi } from '@/services/html2pdfApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Clock,
  Key,
  Lock,
  Plus,
  Shield
} from 'lucide-react';
import { useState } from 'react';

export default function ApiKeysPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'LIVE' | 'TEST'>('TEST');
  const [editedKeyName, setEditedKeyName] = useState('');
  const [editedKeyIsActive, setEditedKeyIsActive] = useState(true);
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch API keys
  const { data: apiKeys, isLoading, error } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysApi.getAll(),
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: (data: { name: string; type: 'LIVE' | 'TEST' }) => 
      apiKeysApi.create(data),
    onSuccess: (newKey: CreateApiKeyResponse) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setCreatedKey(newKey);
      setIsCreateDialogOpen(false);
      setNewKeyName('');
      toast({
        title: "Success",
        description: "API Key created successfully! Copy it now - you won't see it again.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  // Update API key mutation
  const updateApiKeyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isActive?: boolean } }) =>
      apiKeysApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setIsEditDialogOpen(false);
      setEditingKey(null);
      toast({
        title: "Success",
        description: "API Key updated successfully!",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update API key",
        variant: "destructive",
      });
    },
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: (id: string) => apiKeysApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: "Success",
        description: "API Key deleted successfully!",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete API key",
        variant: "destructive",
      });
    },
  });

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "API Key name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    createApiKeyMutation.mutate({
      name: newKeyName,
      type: newKeyType,
    });
  };

  const handleEditApiKey = () => {
    if (!editingKey) return;

    updateApiKeyMutation.mutate({
      id: editingKey.id,
      data: {
        name: editedKeyName,
        isActive: editedKeyIsActive,
      },
    });
  };

  const handleDeleteApiKey = (id: string) => {
    deleteApiKeyMutation.mutate(id);
  };

  const openEditDialog = (key: ApiKey) => {
    setEditingKey(key);
    setEditedKeyName(key.name);
    setEditedKeyIsActive(key.isActive);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load API keys. Please try again later.
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
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for accessing the HTML2PDF Gateway
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for your applications.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., My Web App Production"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select value={newKeyType} onValueChange={(value: 'LIVE' | 'TEST') => setNewKeyType(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select key type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateApiKey}
                disabled={createApiKeyMutation.isPending}
              >
                {createApiKeyMutation.isPending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Key'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit API Key</DialogTitle>
              <DialogDescription>
                Modify the name or status of your API key.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editedKeyName}
                  onChange={(e) => setEditedKeyName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-active" className="text-right">
                  Active
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editedKeyIsActive}
                    onChange={(e) => setEditedKeyIsActive(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="edit-active" className="text-sm">
                    {editedKeyIsActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleEditApiKey}
                disabled={updateApiKeyMutation.isPending}
              >
                {updateApiKeyMutation.isPending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Show-Once Key Display */}
      {createdKey && (
        <ShowOnceKeyDisplay
          createdKey={createdKey}
          onClose={() => setCreatedKey(null)}
        />
      )}

      {/* Security Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Security Status
              </CardTitle>
              <CardDescription>
                Show-once key management
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecurityInfo(!showSecurityInfo)}
            >
              {showSecurityInfo ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </CardHeader>
        {showSecurityInfo && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Show-Once Pattern</p>
                  <p className="text-xs text-muted-foreground">Keys shown only during creation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Server-Side Storage</p>
                  <p className="text-xs text-muted-foreground">Keys encrypted in database</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Masked Display</p>
                  <p className="text-xs text-muted-foreground">Only prefixes shown in UI</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Keys:</span>
                <span className="text-sm font-medium">{apiKeys?.length || 0}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                API keys are stored securely on the server and never exposed to the frontend after creation.
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* API Keys List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your API Keys</h2>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Secure Mode
          </Badge>
        </div>
        
        {apiKeys && apiKeys.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {apiKeys.map((key) => (
              <SecureApiKeyCard
                key={key.id}
                apiKey={key}
                onEdit={openEditDialog}
                onDelete={handleDeleteApiKey}
                isDeleting={deleteApiKeyMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't created any API keys yet. Create your first key to start using the API.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Key
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            How to use your API keys in your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">cURL</h4>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto">
                <div>curl -X POST "https://api.html2pdf.com/v1/pdf/generate" \</div>
                <div className="ml-4">-H "Content-Type: application/json" \</div>
                <div className="ml-4">-H "X-API-Key: your_api_key_here" \</div>
                <div className="ml-4">-d '{'{'}"html": "&lt;h1&gt;Hello World&lt;/h1&gt;"{'}'}'</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">JavaScript</h4>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm overflow-x-auto">
                <div>const response = await fetch('https://api.html2pdf.com/v1/pdf/generate', {'{'}</div>
                <div className="ml-4">method: 'POST',</div>
                <div className="ml-4">headers: {'{'}</div>
                <div className="ml-8">'Content-Type': 'application/json',</div>
                <div className="ml-8">'X-API-Key': 'your_api_key_here'</div>
                <div className="ml-4">{'}'},</div>
                <div className="ml-4">body: JSON.stringify({'{'}</div>
                <div className="ml-8">html: '&lt;h1&gt;Hello World&lt;/h1&gt;'</div>
                <div className="ml-4">{'}'})</div>
                <div>{'}'});</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}