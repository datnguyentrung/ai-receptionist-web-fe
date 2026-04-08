export const ROLE_LEVELS = {
  STUDENT: 1,
  COACH: 2,
  MANAGER: 3,
  HEAD_COACH: 4,
} as const;

export type RoleLevel = (typeof ROLE_LEVELS)[keyof typeof ROLE_LEVELS];
