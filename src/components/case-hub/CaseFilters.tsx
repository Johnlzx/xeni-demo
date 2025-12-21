'use client';

import { useState } from 'react';
import { Input, Select, Badge, Button } from '@/components/ui';
import { Search, Filter, X } from 'lucide-react';
import { VISA_TYPES, CASE_STATUSES } from '@/data/constants';
import type { FilterState, CaseStatus, VisaType } from '@/types';

interface CaseFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function CaseFilters({ filters, onFilterChange }: CaseFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const visaOptions = Object.entries(VISA_TYPES).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const statusOptions = Object.entries(CASE_STATUSES).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  const hasActiveFilters = filters.visaType?.length || filters.status?.length;

  const clearFilters = () => {
    onFilterChange({ searchQuery: filters.searchQuery });
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by reference number or applicant name..."
            leftIcon={<Search className="w-4 h-4" />}
            value={filters.searchQuery || ''}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
          />
        </div>
        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<Filter className="w-4 h-4" />}
        >
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">
              {(filters.visaType?.length || 0) + (filters.status?.length || 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 animate-slideIn">
          <div className="flex items-end gap-4">
            <div className="w-48">
              <Select
                label="Visa Type"
                placeholder="All types"
                options={[{ value: '', label: 'All types' }, ...visaOptions]}
                value={filters.visaType?.[0] || ''}
                onChange={(value) =>
                  onFilterChange({
                    ...filters,
                    visaType: value ? [value as VisaType] : undefined,
                  })
                }
              />
            </div>
            <div className="w-48">
              <Select
                label="Status"
                placeholder="All statuses"
                options={[{ value: '', label: 'All statuses' }, ...statusOptions]}
                value={filters.status?.[0] || ''}
                onChange={(value) =>
                  onFilterChange({
                    ...filters,
                    status: value ? [value as CaseStatus] : undefined,
                  })
                }
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                leftIcon={<X className="w-4 h-4" />}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.visaType?.map((type) => (
            <Badge key={type} variant="primary">
              {VISA_TYPES[type].label}
              <button
                className="ml-1 hover:text-primary-900"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    visaType: filters.visaType?.filter((t) => t !== type),
                  })
                }
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.status?.map((status) => (
            <Badge key={status} variant="outline">
              {CASE_STATUSES[status].label}
              <button
                className="ml-1 hover:text-gray-900"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    status: filters.status?.filter((s) => s !== status),
                  })
                }
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
