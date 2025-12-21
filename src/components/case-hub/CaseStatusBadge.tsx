import { Badge } from '@/components/ui';
import { CASE_STATUSES } from '@/data/constants';
import type { CaseStatus } from '@/types';

interface CaseStatusBadgeProps {
  status: CaseStatus;
}

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  const config = CASE_STATUSES[status];

  const variant =
    status === 'ready' || status === 'approved' || status === 'submitted'
      ? 'success'
      : status === 'rejected'
      ? 'error'
      : status === 'review' || status === 'compliance'
      ? 'warning'
      : 'default';

  return (
    <Badge variant={variant}>
      {config.label}
    </Badge>
  );
}
