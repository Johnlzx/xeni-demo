import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { ProgressStep } from '@/types';

interface ProgressTrackerProps {
  steps: ProgressStep[];
}

export function ProgressTracker({ steps }: ProgressTrackerProps) {
  return (
    <div className="relative">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative flex gap-4">
            {/* Timeline Line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[15px] top-8 w-0.5 h-full',
                  step.status === 'completed' ? 'bg-success-500' : 'bg-gray-200'
                )}
              />
            )}

            {/* Icon */}
            <div className="relative z-10 flex-shrink-0">
              {step.status === 'completed' ? (
                <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              ) : step.status === 'current' ? (
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Circle className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-8', isLast && 'pb-0')}>
              <h4
                className={cn(
                  'font-medium',
                  step.status === 'completed'
                    ? 'text-success-700'
                    : step.status === 'current'
                    ? 'text-primary-700'
                    : 'text-gray-400'
                )}
              >
                {step.title}
              </h4>
              <p
                className={cn(
                  'text-sm mt-0.5',
                  step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-500'
                )}
              >
                {step.description}
              </p>
              {step.completedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Completed on {formatDate(step.completedAt, 'long')}
                </p>
              )}
              {step.status === 'current' && step.estimatedDate && (
                <p className="text-xs text-primary-600 mt-1">
                  Estimated completion: {formatDate(step.estimatedDate, 'long')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
