import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usageApi } from '@/services/html2pdfApi';
import { useQuery } from '@tanstack/react-query';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    FileText,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function UsageAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch usage data
  const { data: usageData, isLoading: usageLoading, error: usageError } = useQuery({
    queryKey: ['usage-data', timeRange],
    queryFn: () => usageApi.getUserUsage(),
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch usage summary
  const { data: usageSummary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['usage-summary'],
    queryFn: () => usageApi.getUserSummary('daily'),
    refetchInterval: 60000,
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (status: string | number) => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    if (statusNum >= 200 && statusNum < 300) return '#10b981'; // green
    if (statusNum >= 400 && statusNum < 500) return '#f59e0b'; // yellow
    if (statusNum >= 500) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const getStatusIcon = (status: string | number) => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    if (statusNum >= 200 && statusNum < 300) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (statusNum >= 400) return <XCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  // Process data for charts
  const processChartData = () => {
    if (!usageData) return { dailyData: [], hourlyData: [], statusData: [] };

    // Group by date
    const dailyMap = new Map();
    const hourlyMap = new Map();
    const statusMap = new Map();

    usageData.forEach(record => {
      const date = new Date(record.createdAt).toISOString().split('T')[0];
      const hour = new Date(record.createdAt).getHours();

      // Daily data
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, requests: 0, success: 0, failed: 0 });
      }
      const daily = dailyMap.get(date);
      daily.requests++;
      const statusNum = typeof record.status === 'string' ? parseInt(record.status) : record.status;
      if (statusNum >= 200 && statusNum < 300) {
        daily.success++;
      } else {
        daily.failed++;
      }

      // Hourly data
      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, { hour: `${hour}:00`, requests: 0 });
      }
      hourlyMap.get(hour).requests++;

      // Status data
      const statusGroup = statusNum >= 200 && statusNum < 300 ? 'Success' : 
                         statusNum >= 400 && statusNum < 500 ? 'Client Error' : 
                         statusNum >= 500 ? 'Server Error' : 'Other';
      statusMap.set(statusGroup, (statusMap.get(statusGroup) || 0) + 1);
    });

    return {
      dailyData: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
      hourlyData: Array.from(hourlyMap.values()).sort((a, b) => a.hour.localeCompare(b.hour)),
      statusData: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }))
    };
  };

  const chartData = processChartData();

  if (usageLoading || summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (usageError || summaryError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load usage analytics. Please try again later.
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
          <h1 className="text-3xl font-bold tracking-tight">Usage Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your API usage and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageSummary?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {usageSummary?.successfulRequests || 0} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageSummary ? Math.round((usageSummary.successfulRequests / usageSummary.totalRequests) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {usageSummary?.failedRequests || 0} failed requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageSummary ? formatDuration(usageSummary.averageProcessingTime) : '0ms'}
            </div>
            <p className="text-xs text-muted-foreground">
              Response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageSummary ? formatFileSize(usageSummary.totalRequests * 1024) : '0 Bytes'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Request Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of successful vs failed requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.name === 'Success' ? 200 : 400)} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Usage Trend</CardTitle>
                <CardDescription>
                  Requests per day over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="requests" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Timeline</CardTitle>
              <CardDescription>
                Detailed view of your API usage over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="requests" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Usage Pattern</CardTitle>
              <CardDescription>
                When do you use the API most?
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.hourlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>
            Your latest API requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageData && usageData.length > 0 ? (
            <div className="space-y-4">
              {usageData.slice(0, 10).map((record) => {
                const statusNum = typeof record.status === 'string' ? parseInt(record.status) : record.status;
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="font-medium">{record.endpoint}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(record.createdAt)} • {formatFileSize(record.fileSizeBytes)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={statusNum >= 200 && statusNum < 300 ? "default" : "destructive"}
                      >
                        {record.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(record.processingTimeMs)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Usage Data</h3>
              <p className="text-muted-foreground">
                Start using your API keys to see usage analytics here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}