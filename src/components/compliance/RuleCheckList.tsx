'use client';

import { cn } from '@/lib/utils';
import { Card, Badge } from '@/components/ui';
import { CheckCircle, XCircle, AlertTriangle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { RULE_CATEGORIES } from '@/data/constants';
import type { ComplianceRule, RuleCategory } from '@/types';
import { useState } from 'react';

interface RuleCheckListProps {
  rules: ComplianceRule[];
  onRuleClick?: (rule: ComplianceRule) => void;
}

export function RuleCheckList({ rules, onRuleClick }: RuleCheckListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<RuleCategory>>(
    new Set(Object.keys(RULE_CATEGORIES) as RuleCategory[])
  );

  // Group rules by category
  const rulesByCategory = rules.reduce<Record<RuleCategory, ComplianceRule[]>>((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<RuleCategory, ComplianceRule[]>);

  const toggleCategory = (category: RuleCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="space-y-4">
      {(Object.keys(rulesByCategory) as RuleCategory[]).map((category) => {
        const categoryRules = rulesByCategory[category];
        const categoryConfig = RULE_CATEGORIES[category];
        const isExpanded = expandedCategories.has(category);

        const passedCount = categoryRules.filter((r) => r.result === 'pass').length;
        const failedCount = categoryRules.filter((r) => r.result === 'fail').length;

        return (
          <Card key={category} padding="none">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">{categoryConfig.label}</h4>
                  <p className="text-xs text-gray-500">{categoryConfig.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {failedCount > 0 && (
                  <Badge variant="error" size="sm">{failedCount} failed</Badge>
                )}
                {passedCount > 0 && failedCount === 0 && (
                  <Badge variant="success" size="sm">{passedCount} passed</Badge>
                )}
              </div>
            </button>

            {/* Rules */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                {categoryRules.map((rule) => (
                  <RuleCheckItem
                    key={rule.id}
                    rule={rule}
                    onClick={() => onRuleClick?.(rule)}
                  />
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

interface RuleCheckItemProps {
  rule: ComplianceRule;
  onClick?: () => void;
}

function RuleCheckItem({ rule, onClick }: RuleCheckItemProps) {
  const resultConfig = {
    pass: {
      icon: CheckCircle,
      color: 'text-success-500',
      bgColor: 'bg-success-50',
      label: 'Passed',
    },
    fail: {
      icon: XCircle,
      color: 'text-error-500',
      bgColor: 'bg-error-50',
      label: 'Failed',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-warning-500',
      bgColor: 'bg-warning-50',
      label: 'Warning',
    },
    pending: {
      icon: Clock,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      label: 'Pending',
    },
  };

  const config = resultConfig[rule.result];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
    >
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', config.bgColor)}>
        <Icon className={cn('w-4 h-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-gray-900 text-sm">{rule.name}</p>
          <Badge
            variant={
              rule.result === 'pass'
                ? 'success'
                : rule.result === 'fail'
                ? 'error'
                : rule.result === 'warning'
                ? 'warning'
                : 'default'
            }
            size="sm"
          >
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">{rule.description}</p>
        {rule.details && (
          <p className={cn(
            'text-sm mt-1',
            rule.result === 'fail' ? 'text-error-600' :
            rule.result === 'warning' ? 'text-warning-600' : 'text-gray-600'
          )}>
            {rule.details}
          </p>
        )}
      </div>
    </button>
  );
}
