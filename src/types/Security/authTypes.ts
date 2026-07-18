import type { Belt, UserStatus } from "../../config/constants";
import type { CoachAssignmentResponse } from "../Operation/CoachAssignmentTypes";

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type AuthUserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "LOCKED"
  | "DISABLED"
  | string;

export type SystemRole =
  | "ROLE_STUDENT"
  | "ROLE_PARENT"
  | "ROLE_ASSISTANT"
  | "ROLE_COACH"
  | "ROLE_MANAGER_SENIOR"
  | "ROLE_HEAD_COACH"
  | "ROLE_DEVELOPER"
  | string;

export type AuthContextType =
  | "STUDENT"
  | "COACH"
  | "GUARDIAN"
  | "MANAGER"
  | string;

export type RelationshipType = "OWNER" | "GUARDIAN" | "MANAGER" | string;

export type AuthUser = {
  userId: string;
  phoneNumber: string;
  status: AuthUserStatus;
  roles: SystemRole[];
};

export type UserContext = {
  personId: string;
  contextType: AuthContextType;
  relationshipType: RelationshipType | null;
  displayName: string;
  userCode?: string | null;
};

export type AuthStatus =
  | "initializing"
  | "authenticated"
  | "selecting-context"
  | "anonymous";

export type AuthResponse = {
  accessToken?: string;
  idDevice?: string | null;
  user: AuthUser;
  activeContext: UserContext | null;
  availableContexts: UserContext[];
  requiresContextSelection: boolean;
};

export type LoginResponse = AuthResponse;

export type LoginRequest = {
  phoneNumber: string;
  password: string;
  idDevice: string;
  fcmToken?: string | null;
};

export type SwitchContextRequest = {
  personId: string;
  contextType: AuthContextType;
};

export type AuthSession = {
  sessionId: string;
  deviceInfo: string | null;
  revoked: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
  activeContextType: string | null;
};

export interface UserLogin {
  userId: string;
  phoneNumber?: string;
  status: string;
  roles?: string[];
  role?: string | null;
}

export type UserBase = LoginRequest;

export interface UserInfo {
  idUser: string;
  userCode: string;
  idRole: string;
  assignedClasses: CoachAssignmentResponse[] | null; // Danh sách ID lớp mà user này được phân công (dành cho HLV)
}

export interface UserProfile {
  birthDate: Date | string;
  isActive: boolean;
  name: string;
  phone: string;
  belt: Belt;
}

export interface UserResponse {
  userInfo: UserInfo;
  userProfile: UserProfile;
}

export interface UserDetail {
  userId: string;
  birthDate: Date | string;
  phoneNumber: string | null;
  belt: Belt;
  status: UserStatus | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
  lastLoginAt: Date | string | null;
  role?: string | null;
  roles?: string[] | null;
  fullName: string;
  gender?: boolean;
}
