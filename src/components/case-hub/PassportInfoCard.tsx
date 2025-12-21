import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { PassportInfo } from '@/types';

interface PassportInfoCardProps {
  passport: PassportInfo;
  className?: string;
}

export function PassportInfoCard({ passport, className }: PassportInfoCardProps) {
  const fields = [
    { label: 'Given names', value: passport.givenNames },
    { label: 'Nationality', value: passport.nationality },
    { label: 'Date of birth', value: formatDate(passport.dateOfBirth) },
    { label: 'Date of issue', value: formatDate(passport.dateOfIssue) },
    { label: 'Surname', value: passport.surname },
    { label: 'Country of birth', value: passport.countryOfBirth },
    { label: 'Sex', value: passport.sex },
    { label: 'Date of expiry', value: formatDate(passport.dateOfExpiry) },
  ];

  return (
    <div className={cn('bg-gray-50 rounded-lg p-4', className)}>
      {/* Info Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {fields.map((field, index) => (
          <div key={index}>
            <p className="text-xs text-gray-500 mb-0.5">{field.label}</p>
            <p className="text-sm font-medium text-gray-900">{field.value}</p>
          </div>
        ))}
      </div>

      {/* MRZ Lines */}
      <div className="font-mono text-xs text-gray-600 bg-white rounded p-2 border border-gray-200 text-center">
        <p>{passport.mrzLine1}</p>
        <p>{passport.mrzLine2}</p>
      </div>
    </div>
  );
}
