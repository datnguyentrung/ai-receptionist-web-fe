import type { Belt } from '../../config/constants';

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

export interface UserInfo{
  idUser: string;
  idRole: string;
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

