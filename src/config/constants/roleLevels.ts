export const ROLE_LEVELS = {
  GUEST: 0, // Guest or unauthenticated user
  STUDENT: 1,
  ASSISTANT: 2,
  COACH: 3,
  MANAGER_SENIOR: 4,
  HEAD_COACH: 5,
} as const;

export type RoleLevel = (typeof ROLE_LEVELS)[keyof typeof ROLE_LEVELS];
