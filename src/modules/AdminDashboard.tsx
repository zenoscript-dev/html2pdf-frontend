import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi, plansApi, type Plan, type User } from '@/services/html2pdfApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  Download,
  Edit,
  Eye,
  Search,
  Shield,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  const queryClient = useQueryClient();

  // Fetch admin data
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-users', currentPage, pageSize, searchTerm, selectedRole, selectedPlan],
    queryFn: () => adminApi.getAllUsers(currentPage, pageSize),
  });

  // Fetch system statistics
  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // This would need to be implemented in the backend
      // For now, we'll simulate the data
      return {
        totalUsers: 1250,
        activeUsers: 980,
        totalRequests: 45000,
        totalRevenue: 12500,
        dailyActiveUsers: 45,
        monthlyActiveUsers: 320,
        averageRequestsPerUser: 36,
        topPlans: [
          { name: 'Pro', count: 450 },
          { name: 'Free', count: 600 },
          { name: 'Enterprise', count: 200 }
        ]
      };
    },
  });

  // Fetch plans for filter
  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAll(),
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => {
      if (role === 'ADMIN') {
        return adminApi.promoteToAdmin(userId);
      } else {
        return adminApi.demoteFromAdmin(userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  // Update user plan mutation (commented out for now)
  // const updateUserPlanMutation = useMutation({
  //   mutationFn: ({ userId, planId }: { userId: string; planId: string }) =>
  //     adminApi.changeUserPlan(userId, planId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  //   },
  // });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'pro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (usersLoading || statsLoading) {
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

  if (usersError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load admin data. Please check your permissions and try again.
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, monitor system performance, and oversee operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin Access
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.activeUsers || 0} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalRequests?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.averageRequestsPerUser || 0} avg per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(systemStats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.dailyActiveUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.monthlyActiveUsers || 0} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              New user registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { date: '2024-01-01', users: 120 },
                { date: '2024-01-02', users: 135 },
                { date: '2024-01-03', users: 142 },
                { date: '2024-01-04', users: 158 },
                { date: '2024-01-05', users: 165 },
                { date: '2024-01-06', users: 172 },
                { date: '2024-01-07', users: 180 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>
              Users by subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={systemStats?.topPlans || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {systemStats?.topPlans?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    {plans?.map((plan: Plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="space-y-4">
                {usersData?.data?.map((user: User) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        {/* <p className="text-sm text-muted-foreground">
                          Joined {formatDate(user.createdAt.toISOString())}
                        </p> */}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getPlanColor(user.plan?.name || 'Free')}>
                        {user.plan?.name || 'Free'}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
                            updateUserRoleMutation.mutate({ userId: user.id, role: newRole });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, usersData?.total || 0)} of {usersData?.total || 0} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage * pageSize >= (usersData?.total || 0)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>
                Detailed system performance and usage metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Request Volume</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { hour: '00:00', requests: 120 },
                      { hour: '06:00', requests: 200 },
                      { hour: '12:00', requests: 450 },
                      { hour: '18:00', requests: 380 },
                      { hour: '24:00', requests: 150 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="requests" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Error Rate</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={[
                      { date: '2024-01-01', errors: 2.1 },
                      { date: '2024-01-02', errors: 1.8 },
                      { date: '2024-01-03', errors: 2.3 },
                      { date: '2024-01-04', errors: 1.9 },
                      { date: '2024-01-05', errors: 2.0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure global rate limits for API endpoints
                  </p>
                  <Button variant="outline">Configure Limits</Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Maintenance Mode</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enable maintenance mode for system updates
                  </p>
                  <Button variant="outline">Toggle Maintenance</Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Backup Settings</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure automated backups and data retention
                  </p>
                  <Button variant="outline">Configure Backup</Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Security Settings</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage security policies and access controls
                  </p>
                  <Button variant="outline">Security Config</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}