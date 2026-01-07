import {
  User,
  Users,
  UserMinus,
  MapPinOff,
  MapPin,
  Home,
  Plane,
  UserCircle,
  Scale,
  type LucideIcon,
} from 'lucide-react';

/**
 * Pre-screening Questions Configuration
 *
 * These 4 questions determine which form sections are relevant for this application.
 * By answering "No" to questions, lawyers can eliminate entire sections from the checklist.
 *
 * B2B Context: Questions are phrased in third-person (about the applicant),
 * as lawyers fill this out on behalf of their clients.
 */

export interface PreScreeningOption {
  id: string;
  value: string | boolean;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  /** Sections that will be REMOVED if this option is selected */
  sectionsRemoved: string[];
  /** Human-readable section names for the removal feedback */
  sectionLabels: string[];
}

export interface PreScreeningQuestion {
  id: string;
  /** Maps to formCondition.questionId in evidence-templates */
  questionIds: string[];
  question: string;
  subtitle?: string;
  options: PreScreeningOption[];
}

export const PRESCREENING_QUESTIONS: PreScreeningQuestion[] = [
  {
    id: 'family',
    questionIds: ['has_children', 'children_applying'],
    question: 'Does the applicant have children?',
    subtitle: 'Including biological, step, or adopted children, regardless of location',
    options: [
      {
        id: 'no-children',
        value: 'none',
        label: 'No children',
        icon: User,
        sectionsRemoved: ['familyInformation'],
        sectionLabels: ['Family Information'],
      },
      {
        id: 'children-applying',
        value: 'applying_with',
        label: 'Yes, included',
        sublabel: 'Children will be dependants on this visa',
        icon: Users,
        sectionsRemoved: [],
        sectionLabels: [],
      },
      {
        id: 'children-not-applying',
        value: 'not_applying',
        label: 'Yes, not included',
        sublabel: 'Children are not part of this visa',
        icon: UserMinus,
        sectionsRemoved: [],
        sectionLabels: [],
      },
    ],
  },
  {
    id: 'uk-footprint',
    questionIds: ['has_uk_history'],
    question: 'Has the applicant previously entered the UK?',
    subtitle: 'Any prior visits, visas, or residence in the United Kingdom',
    options: [
      {
        id: 'never-uk',
        value: false,
        label: 'Never entered',
        sublabel: 'First-time UK visa applicant',
        icon: MapPinOff,
        sectionsRemoved: ['ukTravelHistory', 'ukMedical', 'nationalInsurance'],
        sectionLabels: ['UK Travel History', 'UK Medical (NHS)', 'National Insurance'],
      },
      {
        id: 'has-uk',
        value: true,
        label: 'Previously entered',
        sublabel: 'Has prior UK travel or residence history',
        icon: MapPin,
        sectionsRemoved: [],
        sectionLabels: [],
      },
    ],
  },
  {
    id: 'global-mobility',
    questionIds: ['has_world_travel'],
    question: 'International travel in the past 10 years?',
    subtitle: 'Countries visited other than UK and country of residence',
    options: [
      {
        id: 'no-travel',
        value: false,
        label: 'No international travel',
        sublabel: 'Has not traveled outside home country',
        icon: Home,
        sectionsRemoved: ['worldTravelHistory', 'specialCountryTravelHistory'],
        sectionLabels: ['World Travel History', 'Five Eyes Travel History'],
      },
      {
        id: 'has-travel',
        value: true,
        label: 'Has travel history',
        sublabel: 'Visited other countries in the past decade',
        icon: Plane,
        sectionsRemoved: [],
        sectionLabels: [],
      },
    ],
  },
  {
    id: 'representation',
    questionIds: ['has_adviser'],
    question: 'Who is submitting this application?',
    options: [
      {
        id: 'self-represented',
        value: false,
        label: 'Self-represented',
        sublabel: 'Applicant or sponsor',
        icon: UserCircle,
        sectionsRemoved: ['immigrationAdviser'],
        sectionLabels: ['Immigration Adviser Details'],
      },
      {
        id: 'has-adviser',
        value: true,
        label: 'Legal representative',
        sublabel: 'Immigration adviser or solicitor',
        icon: Scale,
        sectionsRemoved: [],
        sectionLabels: [],
      },
    ],
  },
];

/**
 * Maps pre-screening answers to formCondition-compatible format
 */
export interface PreScreeningAnswers {
  has_children: boolean;
  children_applying?: boolean;
  has_uk_history: boolean;
  has_world_travel: boolean;
  has_adviser: boolean;
}

/**
 * Convert raw card selections to form condition answers
 */
export function convertToFormConditions(
  selections: Record<string, string | boolean>
): PreScreeningAnswers {
  const familyAnswer = selections['family'];

  return {
    has_children: familyAnswer !== 'none',
    children_applying: familyAnswer === 'applying_with' ? true :
                       familyAnswer === 'not_applying' ? false : undefined,
    has_uk_history: selections['uk-footprint'] === true,
    has_world_travel: selections['global-mobility'] === true,
    has_adviser: selections['representation'] === true,
  };
}

/**
 * Calculate total sections that would be removed based on current selections
 */
export function calculateRemovedSections(
  selections: Record<string, string | boolean>
): { sections: string[]; labels: string[] } {
  const sections: string[] = [];
  const labels: string[] = [];

  for (const question of PRESCREENING_QUESTIONS) {
    const selectedValue = selections[question.id];
    if (selectedValue === undefined) continue;

    const selectedOption = question.options.find(opt => opt.value === selectedValue);
    if (selectedOption) {
      sections.push(...selectedOption.sectionsRemoved);
      labels.push(...selectedOption.sectionLabels);
    }
  }

  return { sections, labels };
}

/**
 * Total possible sections that can be removed
 * Used for calculating simplification percentage
 */
export const TOTAL_REMOVABLE_SECTIONS = PRESCREENING_QUESTIONS.reduce(
  (total, q) => total + Math.max(...q.options.map(o => o.sectionsRemoved.length)),
  0
);
