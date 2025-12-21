import type { User } from '@/types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    name: 'John Liu',
    email: 'john.liu@xeni.ai',
    role: 'lawyer',
    avatar: undefined,
  },
  {
    id: 'user-002',
    name: 'Sarah Chen',
    email: 'sarah.chen@xeni.ai',
    role: 'assistant',
    avatar: undefined,
  },
  {
    id: 'user-003',
    name: 'Michael Wang',
    email: 'michael.wang@xeni.ai',
    role: 'lawyer',
    avatar: undefined,
  },
  {
    id: 'user-004',
    name: 'Emily Johnson',
    email: 'emily.johnson@xeni.ai',
    role: 'assistant',
    avatar: undefined,
  },
];

export const CURRENT_USER = MOCK_USERS[0];
