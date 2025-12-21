import type { Case } from '@/types';
import { MOCK_USERS } from './users';

export const MOCK_CASES: Case[] = [
  {
    id: 'case-001',
    referenceNumber: 'XN-2024-001234',
    visaType: 'naturalisation',
    status: 'intake',
    applicant: {
      id: 'applicant-001',
      email: 'bob.brown@email.com',
      passport: {
        givenNames: 'Bob',
        surname: 'Brown',
        nationality: 'British',
        countryOfBirth: 'France',
        dateOfBirth: '1990-01-23',
        sex: 'M',
        dateOfIssue: '2021-01-23',
        dateOfExpiry: '2026-01-23',
        passportNumber: 'AT38249065',
        mrzLine1: 'P<GRCKOUTSAIMANI<<ELENI<<<<<<<<<<<<<<<<<<<<<',
        mrzLine2: 'AT38249065GRC8109149F2611309<<<<<<<<<<<<<<06',
      },
    },
    advisor: MOCK_USERS[0],
    assistant: MOCK_USERS[1],
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-18T14:30:00Z',
    stats: {
      documentsTotal: 12,
      documentsUploaded: 8,
      qualityIssues: 2,
      logicIssues: 1,
    },
  },
  {
    id: 'case-002',
    referenceNumber: 'XN-2024-001235',
    visaType: 'skilled_worker',
    status: 'compliance',
    applicant: {
      id: 'applicant-002',
      email: 'emma.wilson@email.com',
      passport: {
        givenNames: 'Emma',
        surname: 'Wilson',
        nationality: 'American',
        countryOfBirth: 'United States',
        dateOfBirth: '1988-05-15',
        sex: 'F',
        dateOfIssue: '2022-03-10',
        dateOfExpiry: '2032-03-10',
        passportNumber: 'US12345678',
        mrzLine1: 'P<USAWILSON<<EMMA<<<<<<<<<<<<<<<<<<<<<<<<<<<',
        mrzLine2: 'US12345678USA8805159F3203101<<<<<<<<<<<<<<02',
      },
    },
    advisor: MOCK_USERS[0],
    createdAt: '2024-12-05T09:00:00Z',
    updatedAt: '2024-12-17T16:00:00Z',
    stats: {
      documentsTotal: 15,
      documentsUploaded: 15,
      qualityIssues: 0,
      logicIssues: 3,
    },
  },
  {
    id: 'case-003',
    referenceNumber: 'XN-2024-001236',
    visaType: 'visitor',
    status: 'ready',
    applicant: {
      id: 'applicant-003',
      email: 'alex.zhang@email.com',
      passport: {
        givenNames: 'Alex',
        surname: 'Zhang',
        nationality: 'Chinese',
        countryOfBirth: 'China',
        dateOfBirth: '2000-08-20',
        sex: 'M',
        dateOfIssue: '2023-06-15',
        dateOfExpiry: '2033-06-15',
        passportNumber: 'E12345678',
        mrzLine1: 'P<CHNZHANG<<ALEX<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
        mrzLine2: 'E12345678CHN0008200M3306151<<<<<<<<<<<<<<04',
      },
    },
    advisor: MOCK_USERS[2],
    assistant: MOCK_USERS[3],
    createdAt: '2024-11-20T11:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
    stats: {
      documentsTotal: 10,
      documentsUploaded: 10,
      qualityIssues: 0,
      logicIssues: 0,
    },
  },
  {
    id: 'case-004',
    referenceNumber: 'XN-2024-001237',
    visaType: 'partner',
    status: 'review',
    applicant: {
      id: 'applicant-004',
      email: 'maria.garcia@email.com',
      passport: {
        givenNames: 'Maria',
        surname: 'Garcia',
        nationality: 'Spanish',
        countryOfBirth: 'Spain',
        dateOfBirth: '1985-12-03',
        sex: 'F',
        dateOfIssue: '2020-09-01',
        dateOfExpiry: '2030-09-01',
        passportNumber: 'ES98765432',
        mrzLine1: 'P<ESPGARCIA<<MARIA<<<<<<<<<<<<<<<<<<<<<<<<<<<',
        mrzLine2: 'ES98765432ESP8512039F3009018<<<<<<<<<<<<<<08',
      },
    },
    advisor: MOCK_USERS[2],
    createdAt: '2024-12-01T14:00:00Z',
    updatedAt: '2024-12-16T09:00:00Z',
    stats: {
      documentsTotal: 14,
      documentsUploaded: 12,
      qualityIssues: 1,
      logicIssues: 0,
    },
  },
  {
    id: 'case-005',
    referenceNumber: 'XN-2024-001238',
    visaType: 'visitor',
    status: 'draft',
    applicant: {
      id: 'applicant-005',
      email: 'james.smith@email.com',
      passport: {
        givenNames: 'James',
        surname: 'Smith',
        nationality: 'Canadian',
        countryOfBirth: 'Canada',
        dateOfBirth: '1975-04-10',
        sex: 'M',
        dateOfIssue: '2019-07-20',
        dateOfExpiry: '2029-07-20',
        passportNumber: 'CA87654321',
        mrzLine1: 'P<CANSMITH<<JAMES<<<<<<<<<<<<<<<<<<<<<<<<<<<',
        mrzLine2: 'CA87654321CAN7504101M2907205<<<<<<<<<<<<<<06',
      },
    },
    advisor: MOCK_USERS[0],
    createdAt: '2024-12-18T08:00:00Z',
    updatedAt: '2024-12-18T08:00:00Z',
    stats: {
      documentsTotal: 18,
      documentsUploaded: 2,
      qualityIssues: 0,
      logicIssues: 0,
    },
  },
];

export function getCaseById(id: string): Case | undefined {
  return MOCK_CASES.find(c => c.id === id);
}

export function getCasesByStatus(status: Case['status']): Case[] {
  return MOCK_CASES.filter(c => c.status === status);
}

export function getCasesByAdvisor(advisorId: string): Case[] {
  return MOCK_CASES.filter(c => c.advisor.id === advisorId);
}
