import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { apiKeysApi, plansApi, usageApi, type Plan } from '@/services/html2pdfApi';
import { useQuery } from '@tanstack/react-query';
import {
    Activity,
    BarChart3,
    FileText,
    Plus,
    Settings,
    TrendingUp,
    Zap
} from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch usage summary
  const { data: usageSummary, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-summary'],
    queryFn: () => usageApi.getUserSummary('daily'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch API keys
  const { data: apiKeys, isLoading: apiKeysLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysApi.getAll(),
  });

  // Fetch user's plan
  const { data: userPlan, isLoading: planLoading } = useQuery({
    queryKey: ['user-plan'],
    queryFn: async () => {
      // This would need to be implemented in the backend to get user's current plan
      const plans = await plansApi.getAll();
      return plans.find((plan: Plan) => plan.name === 'Free') || plans[0]; // Default to first plan
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (usageLoading || apiKeysLoading || planLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-8 w-48" />
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
      </div>
    );
  }

  const getSuccessRate = () => {
    if (!usageSummary) return 0;
    return Math.round((usageSummary.successfulRequests / usageSummary.totalRequests) * 100);
  };

  const getDailyUsagePercentage = () => {
    if (!usageSummary || !userPlan) return 0;
    return Math.round((usageSummary.totalRequests / userPlan.dailyRequestLimit) * 100);
  };

  const getMonthlyUsagePercentage = () => {
    if (!usageSummary || !userPlan) return 0;
    return Math.round((usageSummary.totalRequests / userPlan.monthlyRequestLimit) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}! Here's your HTML2PDF overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {userPlan?.name || 'Free Plan'}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
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
            <Progress 
              value={getSuccessRate()} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageSummary?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {userPlan?.dailyRequestLimit || 0} daily limit
            </p>
            <Progress 
              value={getDailyUsagePercentage()} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageSummary?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {userPlan?.monthlyRequestLimit || 0} monthly limit
            </p>
            <Progress 
              value={getMonthlyUsagePercentage()} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys?.filter(key => key.isActive).length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {apiKeys?.length || 0} total keys
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>
              Your API usage over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usageSummary?.dailyUsage && usageSummary.dailyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageSummary.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No usage data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest API requests and conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys?.slice(0, 5).map((key) => (
                <div key={key.id} className="flex items-center">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{key.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never used'}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant={key.isActive ? "default" : "secondary"}>
                      {key.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!apiKeys || apiKeys.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  No API keys found. Create your first API key to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Create API Key</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Generate a new API key for your applications</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test PDF Generation</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Test your API keys with our PDF tester</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">View Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Detailed usage analytics and insights</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upgrade Plan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Increase your limits and unlock premium features</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}