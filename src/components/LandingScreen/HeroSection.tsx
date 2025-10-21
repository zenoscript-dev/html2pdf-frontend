import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28 lg:py-36">

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-tropical-indigo-100 dark:bg-tropical-indigo-800 px-4 py-2 text-sm font-medium text-tropical-indigo-700 dark:text-tropical-indigo-200 border border-tropical-indigo-300 dark:border-tropical-indigo-600 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>Transform HTML to PDF Instantly</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl animate-fade-in">
            Convert HTML to PDF
            <span className="block mt-2 text-tropical-indigo-600 dark:text-tropical-indigo-400">
              In Seconds
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl animate-fade-in delay-200">
            Three powerful conversion methods. One simple interface. Choose the method that works best for you and generate professional PDFs effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-300">
            <Button
              size="lg"
              onClick={() => {
                const testSection = document.getElementById('test-conversion');
                testSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-tropical-indigo-600 hover:bg-tropical-indigo-700 dark:bg-tropical-indigo-500 dark:hover:bg-tropical-indigo-600 text-white px-8 py-6 text-lg transition-all duration-300"
            >
              Try It Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signin')}
              className="border-tropical-indigo-300 dark:border-tropical-indigo-600 text-tropical-indigo-700 dark:text-tropical-indigo-300 hover:bg-tropical-indigo-50 dark:hover:bg-tropical-indigo-900 px-8 py-6 text-lg transition-all duration-300"
            >
              <FileText className="mr-2 h-5 w-5" />
              Sign In
            </Button>
          </div>

          {/* Features List */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 mx-auto max-w-4xl animate-fade-in delay-500">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-almond-400 dark:border-tropical-indigo-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tropical-indigo-600 dark:bg-tropical-indigo-500 text-white">
                <span className="text-xl font-bold">3</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Conversion Methods</p>
                <p className="text-xs text-muted-foreground">Choose what fits</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-almond-400 dark:border-cambridge-blue-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cambridge-blue-600 dark:bg-cambridge-blue-500 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Fast & Reliable</p>
                <p className="text-xs text-muted-foreground">Lightning speed</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-almond-400 dark:border-puce-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-puce-600 dark:bg-puce-500 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">High Quality</p>
                <p className="text-xs text-muted-foreground">Perfect output</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
