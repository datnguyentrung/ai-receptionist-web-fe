import type { Belt } from '../../config/constants';
import type { CoachAssignmentResponse } from '../Operation/CoachAssignmentTypes';

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  idDevice: string;
  user: UserLogin;
}

export interface UserLogin {
  userId: string;
  status: string;
  role: string | null;
  startDate: Date | string;
}

export interface UserBase {
  phoneNumber: string;
  password: string;
  idDevice: string;
}

export interface UserInfo {
  idUser: string;
  userCode: string;
  idRole: string;
  assignedClasses: CoachAssignmentResponse[]; // Danh sách ID lớp mà user này được phân công (dành cho HLV)
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
