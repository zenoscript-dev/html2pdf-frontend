import { Card } from '@/components/ui/card';
import { BarChart3, Code, Globe, Lock, Shield, Zap } from 'lucide-react';
import React from 'react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Lightning Fast',
    description: 'Convert your HTML to PDF in seconds with our optimized processing engine.',
    color: 'bg-light-orange-500 dark:bg-light-orange-400',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure & Private',
    description: 'Your data is encrypted and never stored. Complete privacy guaranteed.',
    color: 'bg-tropical-indigo-600 dark:bg-tropical-indigo-500',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'Works Everywhere',
    description: 'Access from any device, any browser. No installation required.',
    color: 'bg-cambridge-blue-600 dark:bg-cambridge-blue-500',
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: 'Developer Friendly',
    description: 'RESTful API with comprehensive documentation and code examples.',
    color: 'bg-puce-600 dark:bg-puce-500',
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: 'Enterprise Ready',
    description: 'SOC 2 compliant with dedicated support and SLA guarantees.',
    color: 'bg-almond-600 dark:bg-almond-500',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Analytics Dashboard',
    description: 'Track usage, monitor performance, and optimize your conversions.',
    color: 'bg-light-orange-600 dark:bg-light-orange-500',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="relative py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make HTML to PDF conversion effortless and reliable.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group p-8 bg-card border-border hover:border-tropical-indigo-300 dark:hover:border-tropical-indigo-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.color} text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Additional Info Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-puce-50 dark:bg-puce-950 border-puce-200 dark:border-puce-800">
              <div className="text-center">
                <div className="text-4xl font-bold text-puce-700 dark:text-puce-300 mb-2">99.9%</div>
                <div className="text-sm font-medium text-puce-600 dark:text-puce-400">Uptime Guarantee</div>
              </div>
            </Card>

            <Card className="p-8 bg-puce-50 dark:bg-puce-950 border-puce-200 dark:border-puce-800">
              <div className="text-center">
                <div className="text-4xl font-bold text-puce-700 dark:text-puce-300 mb-2">&lt;2s</div>
                <div className="text-sm font-medium text-puce-600 dark:text-puce-400">Average Processing Time</div>
              </div>
            </Card>

            <Card className="p-8 bg-puce-50 dark:bg-puce-950 border-puce-200 dark:border-puce-800">
              <div className="text-center">
                <div className="text-4xl font-bold text-puce-700 dark:text-puce-300 mb-2">24/7</div>
                <div className="text-sm font-medium text-puce-600 dark:text-puce-400">Customer Support</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
