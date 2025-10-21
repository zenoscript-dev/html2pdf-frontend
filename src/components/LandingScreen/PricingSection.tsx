import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Star, Zap } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  colorScheme: {
    bg: string;
    border: string;
    badge: string;
    button: string;
  };
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out our service',
    features: [
      '10 conversions per month',
      'Basic HTML to PDF',
      'Standard quality output',
      'Email support',
      '24-hour processing',
    ],
    cta: 'Get Started Free',
    colorScheme: {
      bg: 'bg-puce-50 dark:bg-puce-950',
      border: 'border-puce-300 dark:border-puce-700',
      badge: 'bg-puce-200 dark:bg-puce-800 text-puce-800 dark:text-puce-200',
      button: 'bg-puce-600 hover:bg-puce-700 dark:bg-puce-500 dark:hover:bg-puce-600 text-white',
    },
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Best for professionals and small teams',
    features: [
      '500 conversions per month',
      'All conversion methods',
      'High quality output',
      'Priority email support',
      'Instant processing',
      'Custom styling options',
      'API access',
      'Advanced templates',
    ],
    highlighted: true,
    cta: 'Start Pro Trial',
    colorScheme: {
      bg: 'bg-puce-50 dark:bg-puce-950',
      border: 'border-puce-400 dark:border-puce-600',
      badge: 'bg-puce-600 dark:bg-puce-500 text-white',
      button: 'bg-puce-600 hover:bg-puce-700 dark:bg-puce-500 dark:hover:bg-puce-600 text-white',
    },
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with specific needs',
    features: [
      'Unlimited conversions',
      'Dedicated infrastructure',
      'Custom integrations',
      '24/7 phone & email support',
      'SLA guarantee',
      'Custom branding',
      'Advanced security',
      'Team management',
      'Analytics dashboard',
    ],
    cta: 'Contact Sales',
    colorScheme: {
      bg: 'bg-puce-50 dark:bg-puce-950',
      border: 'border-puce-300 dark:border-puce-700',
      badge: 'bg-puce-200 dark:bg-puce-800 text-puce-800 dark:text-puce-200',
      button: 'bg-puce-600 hover:bg-puce-700 dark:bg-puce-500 dark:hover:bg-puce-600 text-white',
    },
  },
];

const PricingSection: React.FC = () => {
  const navigate = useNavigate();

  const handleCTAClick = (tier: PricingTier) => {
    if (tier.name === 'Enterprise') {
      // Navigate to contact or show contact modal
      navigate('/signup');
    } else {
      navigate('/signup');
    }
  };

  return (
    <section id="pricing" className="relative py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-puce-200 dark:bg-puce-800 px-4 py-2 text-sm font-medium text-puce-800 dark:text-puce-200 border border-puce-400 dark:border-puce-600">
              <Zap className="h-4 w-4" />
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative p-8 ${tier.colorScheme.bg} ${tier.colorScheme.border} border-2 transition-all duration-300 hover:shadow-2xl ${
                  tier.highlighted
                    ? 'scale-105 shadow-2xl ring-4 ring-puce-200 dark:ring-puce-800'
                    : 'hover:scale-105'
                }`}
              >
                {/* Most Popular Badge */}
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-puce-600 px-4 py-1.5 text-sm font-semibold text-white">
                      <Star className="h-4 w-4 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Tier Name */}
                <div className="mb-6">
                  <div className={`inline-flex items-center rounded-lg ${tier.colorScheme.badge} px-3 py-1 text-sm font-semibold mb-4`}>
                    {tier.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleCTAClick(tier)}
                  className={`w-full ${tier.colorScheme.button} transition-all duration-300 py-6 text-base font-semibold`}
                  size="lg"
                >
                  {tier.cta}
                </Button>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              All plans include SSL encryption and secure processing
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-muted-foreground">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-muted-foreground">Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-muted-foreground">30-day money back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

