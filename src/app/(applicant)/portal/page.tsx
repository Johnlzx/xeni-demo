'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Input, Button } from '@/components/ui';
import { Hash, Mail, ArrowRight, Shield } from 'lucide-react';
import { MOCK_CASES } from '@/data/cases';

export default function PortalLoginPage() {
  const router = useRouter();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find matching case
    const matchingCase = MOCK_CASES.find(
      (c) =>
        c.referenceNumber.toLowerCase() === referenceNumber.toLowerCase() &&
        c.applicant.email?.toLowerCase() === email.toLowerCase()
    );

    if (matchingCase) {
      router.push(`/portal/${matchingCase.id}`);
    } else {
      setError('No case found with this reference number and email combination.');
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Welcome Message */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Check Your Application Status
        </h1>
        <p className="text-gray-500">
          Enter your case reference number and email to view your application progress.
        </p>
      </div>

      {/* Login Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Case Reference Number"
            placeholder="e.g., XN-2024-001234"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            leftIcon={<Hash className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          {error && (
            <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-700">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View Application
          </Button>
        </form>

        {/* Demo Hint */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Demo credentials:</p>
          <p className="text-xs font-mono text-gray-600">
            Reference: XN-2024-001234
          </p>
          <p className="text-xs font-mono text-gray-600">
            Email: bob.brown@email.com
          </p>
        </div>
      </Card>
    </div>
  );
}
