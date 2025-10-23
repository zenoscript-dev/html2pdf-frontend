import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/useToast';
import { plansApi, type Plan } from '@/services/html2pdfApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Check, Crown, Star, X, Zap } from 'lucide-react';
import { useState } from 'react';

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch plans
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAll(),
  });

  // Fetch current user's plan (this would need to be implemented in the backend)
  const { data: currentPlan } = useQuery({
    queryKey: ['current-plan'],
    queryFn: async () => {
      // This would need to be implemented in the backend
      // For now, we'll assume the user is on the Free plan
      const allPlans = await plansApi.getAll();
      return allPlans.find((plan: Plan) => plan.name === 'Free') || allPlans[0];
    },
  });

  // Upgrade plan mutation (this would need to be implemented in the backend)
  const upgradePlanMutation = useMutation({
    mutationFn: async () => {
      // This would need to be implemented in the backend
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-plan'] });
      toast({
        title: "Success",
        description: "Plan upgraded successfully!",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upgrade plan",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    upgradePlanMutation.mutate();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Zap className="h-6 w-6" />;
      case 'pro':
        return <Star className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'pro':
        return 'from-blue-500 to-blue-600';
      case 'enterprise':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentPlan?.id === planId;
  };

  const isPopularPlan = (planName: string) => {
    return planName.toLowerCase() === 'pro';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="relative">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load plans. Please try again later.
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
          <h1 className="text-3xl font-bold tracking-tight">Plans & Pricing</h1>
          <p className="text-muted-foreground">
            Choose the perfect plan for your HTML2PDF needs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Current: {currentPlan?.name || 'Free Plan'}
          </Badge>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${isPopularPlan(plan.name || '') ? 'border-blue-500 shadow-lg' : ''}`}
          >
            {isPopularPlan(plan.name || '') && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className={`mx-auto h-12 w-12 rounded-full bg-gradient-to-r ${getPlanColor(plan.name || '')} flex items-center justify-center text-white mb-4`}>
                {getPlanIcon(plan.name || '')}
              </div>
              <CardTitle className="text-2xl">{plan.name || 'Unknown Plan'}</CardTitle>
              <CardDescription className="text-lg">
                {plan.description || 'No description available'}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {(plan.price || 0) === 0 ? 'Free' : formatPrice(plan.price || 0)}
                </span>
                {(plan.price || 0) > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {(plan.dailyRequestLimit || 0).toLocaleString()} requests/day
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {(plan.monthlyRequestLimit || 0).toLocaleString()} requests/month
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    Up to {plan.maxFileSizeMB || 0}MB file size
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    Up to {plan.maxPagesPerPdf || 0} pages per PDF
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {(plan.priorityProcessing || false) ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">Priority processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  {(plan.webhooksEnabled || false) ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">Webhooks support</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                {isCurrentPlan(plan.id) ? (
                  <Button className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className={`w-full ${
                      isPopularPlan(plan.name || '') 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : ''
                    }`}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgradePlanMutation.isPending && selectedPlan === plan.id}
                  >
                    {upgradePlanMutation.isPending && selectedPlan === plan.id ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Upgrading...
                      </>
                    ) : (plan.price || 0) === 0 ? (
                      'Downgrade'
                    ) : (
                      'Upgrade'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What happens to unused requests?</h4>
              <p className="text-sm text-muted-foreground">
                Unused requests don't roll over to the next month. Each plan resets on the billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! The Free plan includes 100 requests per day to get you started.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need Help Choosing?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Free Plan</h4>
              <p className="text-sm text-muted-foreground">
                Perfect for testing, personal projects, and small applications.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Pro Plan</h4>
              <p className="text-sm text-muted-foreground">
                Ideal for growing businesses and applications with moderate usage.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Enterprise Plan</h4>
              <p className="text-sm text-muted-foreground">
                Best for large-scale applications with high-volume requirements.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}