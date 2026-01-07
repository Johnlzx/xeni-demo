'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  AlertCircle,
  Info,
  FileText,
  Calendar,
  MapPin,
  HelpCircle,
  Sparkles,
  Shield,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Question types
export type QuestionType =
  | 'yes_no'           // Simple yes/no toggle
  | 'single_choice'    // Radio buttons
  | 'multiple_choice'  // Checkboxes
  | 'text'             // Short text input
  | 'textarea'         // Long text input
  | 'date'             // Date picker
  | 'country'          // Country selector
  | 'number';          // Number input

// Question definition
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  required: boolean;
  options?: { value: string; label: string; description?: string }[];
  placeholder?: string;
  helpText?: string;
  // Conditional display based on other answers
  showWhen?: {
    questionId: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: string | boolean;
  };
  // What documents are required based on this answer
  triggersDocuments?: {
    whenValue: string | boolean;
    documentTypes: string[];
  };
}

// Questionnaire section
export interface QuestionnaireSection {
  id: string;
  title: string;
  description: string;
  icon: 'shield' | 'scale' | 'globe' | 'file';
  questions: Question[];
}

// Props
interface QuestionnaireTabProps {
  sectionId: string;
  sectionName: string;
  onFormChange?: (responses: Record<string, any>, requiresDocuments: boolean) => void;
}

// Mock questionnaire data for criminal record section
const CRIMINAL_RECORD_QUESTIONNAIRE: QuestionnaireSection = {
  id: 'criminal_record',
  title: 'Criminal Record Declaration',
  description: 'Please answer the following questions about your criminal history. Your answers will determine what supporting documents are required.',
  icon: 'scale',
  questions: [
    {
      id: 'has_criminal_record',
      type: 'yes_no',
      question: 'Have you ever been convicted of a criminal offence in any country?',
      description: 'This includes any convictions, cautions, reprimands, or final warnings.',
      required: true,
      helpText: 'You must declare all convictions, including spent convictions under the Rehabilitation of Offenders Act 1974.',
      triggersDocuments: {
        whenValue: true,
        documentTypes: ['police_certificate', 'court_documents'],
      },
    },
    {
      id: 'conviction_country',
      type: 'country',
      question: 'In which country did the conviction(s) occur?',
      required: true,
      showWhen: {
        questionId: 'has_criminal_record',
        operator: 'equals',
        value: true,
      },
    },
    {
      id: 'conviction_date',
      type: 'date',
      question: 'When did the conviction occur?',
      description: 'If multiple convictions, enter the most recent date.',
      required: true,
      showWhen: {
        questionId: 'has_criminal_record',
        operator: 'equals',
        value: true,
      },
    },
    {
      id: 'offence_type',
      type: 'single_choice',
      question: 'What type of offence was it?',
      required: true,
      options: [
        { value: 'minor', label: 'Minor offence', description: 'Traffic violations, minor fines' },
        { value: 'moderate', label: 'Moderate offence', description: 'Theft, assault, fraud under £5,000' },
        { value: 'serious', label: 'Serious offence', description: 'Violence, drugs, fraud over £5,000' },
        { value: 'other', label: 'Other', description: 'Not listed above' },
      ],
      showWhen: {
        questionId: 'has_criminal_record',
        operator: 'equals',
        value: true,
      },
    },
    {
      id: 'sentence_details',
      type: 'textarea',
      question: 'Please provide details of the sentence received',
      placeholder: 'Include the sentence type (fine, community service, imprisonment), duration, and whether it has been completed.',
      required: true,
      showWhen: {
        questionId: 'has_criminal_record',
        operator: 'equals',
        value: true,
      },
    },
    {
      id: 'pending_charges',
      type: 'yes_no',
      question: 'Do you have any pending criminal charges or prosecutions?',
      required: true,
      triggersDocuments: {
        whenValue: true,
        documentTypes: ['court_summons', 'legal_correspondence'],
      },
    },
    {
      id: 'pending_details',
      type: 'textarea',
      question: 'Please provide details of the pending charges',
      placeholder: 'Include the nature of the charges, court name, and expected hearing date if known.',
      required: true,
      showWhen: {
        questionId: 'pending_charges',
        operator: 'equals',
        value: true,
      },
    },
    {
      id: 'civil_judgments',
      type: 'yes_no',
      question: 'Have you ever been subject to civil court judgments or bankruptcy proceedings?',
      description: 'Including CCJs, IVAs, or insolvency proceedings.',
      required: true,
      triggersDocuments: {
        whenValue: true,
        documentTypes: ['court_judgment', 'bankruptcy_discharge'],
      },
    },
  ],
};

// Get icon component
function getSectionIcon(icon: QuestionnaireSection['icon']) {
  switch (icon) {
    case 'shield': return Shield;
    case 'scale': return Scale;
    case 'globe': return MapPin;
    case 'file': return FileText;
    default: return FileText;
  }
}

export function QuestionnaireTab({
  sectionId,
  sectionName,
  onFormChange,
}: QuestionnaireTabProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Get questionnaire for this section (mock - would come from API)
  const questionnaire = CRIMINAL_RECORD_QUESTIONNAIRE;
  const IconComponent = getSectionIcon(questionnaire.icon);

  // Check if a question should be visible
  const isQuestionVisible = useCallback((question: Question) => {
    if (!question.showWhen) return true;
    const { questionId, operator, value } = question.showWhen;
    const response = responses[questionId];

    switch (operator) {
      case 'equals':
        return response === value;
      case 'not_equals':
        return response !== value;
      case 'contains':
        return Array.isArray(response) && response.includes(value);
      default:
        return true;
    }
  }, [responses]);

  // Get visible questions
  const visibleQuestions = useMemo(() => {
    return questionnaire.questions.filter(isQuestionVisible);
  }, [questionnaire.questions, isQuestionVisible]);

  // Calculate progress
  const progress = useMemo(() => {
    const answered = visibleQuestions.filter(q => {
      const response = responses[q.id];
      if (response === undefined || response === null || response === '') return false;
      if (Array.isArray(response) && response.length === 0) return false;
      return true;
    }).length;
    return {
      answered,
      total: visibleQuestions.length,
      percentage: visibleQuestions.length > 0 ? (answered / visibleQuestions.length) * 100 : 0,
    };
  }, [visibleQuestions, responses]);

  // Check if documents are required based on responses
  const requiresDocuments = useMemo(() => {
    return questionnaire.questions.some(q => {
      if (!q.triggersDocuments) return false;
      const response = responses[q.id];
      return response === q.triggersDocuments.whenValue;
    });
  }, [questionnaire.questions, responses]);

  // Handle response change
  const handleResponseChange = useCallback((questionId: string, value: any) => {
    setResponses(prev => {
      const newResponses = { ...prev, [questionId]: value };
      // Notify parent
      onFormChange?.(newResponses, requiresDocuments);
      return newResponses;
    });
    setTouchedFields(prev => new Set(prev).add(questionId));
  }, [onFormChange, requiresDocuments]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 bg-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">{questionnaire.title}</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">{questionnaire.description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600 font-medium">
              {progress.answered} of {progress.total} questions answered
            </span>
            <span className={cn(
              'font-semibold',
              progress.percentage === 100 ? 'text-emerald-600' : 'text-slate-400'
            )}>
              {Math.round(progress.percentage)}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className={cn(
                'h-full rounded-full',
                progress.percentage === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-primary-500 to-primary-400'
              )}
            />
          </div>
        </div>

        {/* Documents Required Notice */}
        <AnimatePresence>
          {requiresDocuments && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">Supporting documents required</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Based on your answers, you will need to provide additional documentation in the Documents tab.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-8 py-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {visibleQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                value={responses[question.id]}
                onChange={(value) => handleResponseChange(question.id, value)}
                isTouched={touchedFields.has(question.id)}
              />
            ))}
          </AnimatePresence>

          {/* Completion State */}
          {progress.percentage === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-900">Questionnaire Complete</h3>
                <p className="text-sm text-emerald-700 mt-0.5">
                  {requiresDocuments
                    ? 'Please proceed to the Documents tab to upload supporting evidence.'
                    : 'No additional documents are required for this section.'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Question Card Component
interface QuestionCardProps {
  question: Question;
  index: number;
  value: any;
  onChange: (value: any) => void;
  isTouched: boolean;
}

function QuestionCard({ question, index, value, onChange, isTouched }: QuestionCardProps) {
  const isAnswered = value !== undefined && value !== null && value !== '';
  const showError = question.required && isTouched && !isAnswered;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-6 rounded-2xl border-2 transition-all duration-300',
        isAnswered
          ? 'bg-white border-emerald-200 shadow-sm'
          : showError
          ? 'bg-rose-50/50 border-rose-200'
          : 'bg-white border-slate-200 hover:border-slate-300'
      )}
    >
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          isAnswered
            ? 'bg-emerald-100'
            : 'bg-slate-100'
        )}>
          {isAnswered ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <span className="text-xs font-semibold text-slate-500">{index + 1}</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
            {question.question}
            {question.required && <span className="text-rose-500 ml-1">*</span>}
          </h3>
          {question.description && (
            <p className="text-xs text-slate-500 mt-1">{question.description}</p>
          )}
        </div>
        {question.helpText && (
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors group relative">
            <HelpCircle className="w-4 h-4" />
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {question.helpText}
              <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-900 rotate-45" />
            </div>
          </button>
        )}
      </div>

      {/* Question Input */}
      <div className="ml-10">
        {question.type === 'yes_no' && (
          <YesNoInput value={value} onChange={onChange} />
        )}
        {question.type === 'single_choice' && question.options && (
          <SingleChoiceInput value={value} onChange={onChange} options={question.options} />
        )}
        {question.type === 'text' && (
          <TextInput value={value} onChange={onChange} placeholder={question.placeholder} />
        )}
        {question.type === 'textarea' && (
          <TextareaInput value={value} onChange={onChange} placeholder={question.placeholder} />
        )}
        {question.type === 'date' && (
          <DateInput value={value} onChange={onChange} />
        )}
        {question.type === 'country' && (
          <CountryInput value={value} onChange={onChange} />
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-10 mt-3 flex items-center gap-2 text-rose-600"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">This question is required</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Yes/No Toggle Input
function YesNoInput({ value, onChange }: { value: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      {[
        { val: true, label: 'Yes' },
        { val: false, label: 'No' },
      ].map((option) => (
        <motion.button
          key={option.label}
          onClick={() => onChange(option.val)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all duration-200',
            value === option.val
              ? option.val
                ? 'border-amber-400 bg-amber-50 text-amber-700'
                : 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          <div className="flex items-center justify-center gap-2">
            {value === option.val ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            {option.label}
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Single Choice Input
function SingleChoiceInput({
  value,
  onChange,
  options,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  options: { value: string; label: string; description?: string }[];
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onChange(option.value)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
            value === option.value
              ? 'border-primary-400 bg-primary-50'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
              value === option.value
                ? 'border-primary-500 bg-primary-500'
                : 'border-slate-300'
            )}>
              {value === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              )}
            </div>
            <div>
              <p className={cn(
                'text-sm font-medium',
                value === option.value ? 'text-primary-900' : 'text-slate-700'
              )}>
                {option.label}
              </p>
              {option.description && (
                <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Text Input
function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200',
        'placeholder:text-slate-400',
        'focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100',
        value ? 'border-slate-300' : 'border-slate-200'
      )}
    />
  );
}

// Textarea Input
function TextareaInput({
  value,
  onChange,
  placeholder,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className={cn(
        'w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 resize-none',
        'placeholder:text-slate-400',
        'focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100',
        value ? 'border-slate-300' : 'border-slate-200'
      )}
    />
  );
}

// Date Input
function DateInput({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200',
          'focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100',
          value ? 'border-slate-300' : 'border-slate-200'
        )}
      />
      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

// Country Input
function CountryInput({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const countries = [
    { value: 'GB', label: 'United Kingdom' },
    { value: 'US', label: 'United States' },
    { value: 'CN', label: 'China' },
    { value: 'IN', label: 'India' },
    { value: 'PK', label: 'Pakistan' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'BD', label: 'Bangladesh' },
    { value: 'PH', label: 'Philippines' },
    { value: 'OTHER', label: 'Other country' },
  ];

  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 appearance-none',
          'focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100',
          value ? 'border-slate-300 text-slate-900' : 'border-slate-200 text-slate-400'
        )}
      >
        <option value="">Select a country</option>
        {countries.map((country) => (
          <option key={country.value} value={country.value}>
            {country.label}
          </option>
        ))}
      </select>
      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}
