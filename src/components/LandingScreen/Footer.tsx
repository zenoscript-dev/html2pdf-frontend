import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Code, FileText, Github, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-puce-50 dark:bg-puce-950 border-t border-puce-200 dark:border-puce-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-puce-600 dark:bg-puce-500 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-puce-900 dark:text-puce-100">HTML to PDF</h3>
              </div>
              <p className="text-puce-700 dark:text-puce-300 mb-6 max-w-md">
                Transform your HTML content into professional PDFs instantly. Start with our free plan - 
                10 conversions per month, no credit card required. Upgrade anytime for more features.
              </p>
              
              {/* Free Trial CTA */}
              <Card className="p-6 bg-puce-100 dark:bg-puce-900 border-puce-300 dark:border-puce-700">
                <h4 className="text-lg font-semibold text-puce-900 dark:text-puce-100 mb-3">
                  Try It Free Today
                </h4>
                <p className="text-sm text-puce-700 dark:text-puce-300 mb-4">
                  Start converting HTML to PDF instantly. No credit card required.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email to get started"
                    className="flex-1 bg-background border-puce-300 dark:border-puce-700"
                  />
                  <Button className="bg-puce-600 hover:bg-puce-700 dark:bg-puce-500 dark:hover:bg-puce-600 text-white">
                    Start Free
                  </Button>
                </div>
                <p className="text-xs text-puce-600 dark:text-puce-400 mt-2">
                  ✓ 10 free conversions ✓ No setup required ✓ Cancel anytime
                </p>
              </Card>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-puce-900 dark:text-puce-100 mb-4">
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#test-conversion" className="text-puce-700 dark:text-puce-300 hover:text-puce-900 dark:hover:text-puce-100 transition-colors">
                    Try It Now
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-puce-700 dark:text-puce-300 hover:text-puce-900 dark:hover:text-puce-100 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/docs" className="text-puce-700 dark:text-puce-300 hover:text-puce-900 dark:hover:text-puce-100 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/api" className="text-puce-700 dark:text-puce-300 hover:text-puce-900 dark:hover:text-puce-100 transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="/examples" className="text-puce-700 dark:text-puce-300 hover:text-puce-900 dark:hover:text-puce-100 transition-colors">
                    Examples
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-puce-900 dark:text-puce-100 mb-4">
                Contact Us
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-puce-600 dark:text-puce-400" />
                  <span className="text-puce-700 dark:text-puce-300">support@htmltopdf.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-puce-600 dark:text-puce-400" />
                  <span className="text-puce-700 dark:text-puce-300">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-puce-600 dark:text-puce-400" />
                  <span className="text-puce-700 dark:text-puce-300">San Francisco, CA</span>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="mt-6">
                <h5 className="text-sm font-semibold text-puce-900 dark:text-puce-100 mb-3">
                  Follow Us
                </h5>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="border-puce-300 dark:border-puce-700 text-puce-700 dark:text-puce-300 hover:bg-puce-100 dark:hover:bg-puce-800">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-puce-300 dark:border-puce-700 text-puce-700 dark:text-puce-300 hover:bg-puce-100 dark:hover:bg-puce-800">
                    <Github className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-puce-300 dark:border-puce-700 text-puce-700 dark:text-puce-300 hover:bg-puce-100 dark:hover:bg-puce-800">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-puce-200 dark:border-puce-800 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-puce-600 dark:text-puce-400">
              <span>&copy; 2024 HTML to PDF. All rights reserved.</span>
              <a href="/privacy" className="hover:text-puce-800 dark:hover:text-puce-200 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-puce-800 dark:hover:text-puce-200 transition-colors">
                Terms of Service
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-puce-600 dark:text-puce-400">
              <Code className="h-4 w-4" />
              <span>Made with ❤️ for developers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
