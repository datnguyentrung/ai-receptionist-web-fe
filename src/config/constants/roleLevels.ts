export const ROLE_LEVELS = {
  GUEST: 0, // Guest or unauthenticated user
  STUDENT: 1,
  COACH: 2,
  MANAGER: 3,
  HEAD_COACH: 4,
} as const;

export type RoleLevel = (typeof ROLE_LEVELS)[keyof typeof ROLE_LEVELS];
