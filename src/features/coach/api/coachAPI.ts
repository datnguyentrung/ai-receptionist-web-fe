import { javaApi } from "@/lib/axiosInstance";
import { toMultipartFormData } from "@/lib/multipart";

import type {
  CoachCreateRequest,
  CoachDetail,
  CoachUpdateRequest,
} from "@/types";

function normalizeCoachDetail(coach: CoachDetail): CoachDetail {
  const primaryUserDetail = coach.userDetails?.[0];

  if (!primaryUserDetail) {
    return coach;
  }

  return {
    ...coach,
    userId: coach.userId ?? primaryUserDetail.userId,
    phoneNumber: coach.phoneNumber ?? primaryUserDetail.phoneNumber,
    status: coach.status ?? primaryUserDetail.status,
    createdAt: coach.createdAt ?? primaryUserDetail.createdAt,
    updatedAt: coach.updatedAt ?? primaryUserDetail.updatedAt,
    lastLoginAt: coach.lastLoginAt ?? primaryUserDetail.lastLoginAt,
    roles: coach.roles ?? primaryUserDetail.roles,
    role: coach.role ?? primaryUserDetail.roles?.[0] ?? null,
    active: coach.active ?? primaryUserDetail.active,
  };
}

export const coachAPI = {
  getAllCoaches: async (): Promise<CoachDetail[]> => {
    const response = await javaApi.get("/coaches");
    console.log("Fetched coaches:", response.data); // Debug log
    return Array.isArray(response.data)
      ? response.data.map(normalizeCoachDetail)
      : [];
  },

  getCoachByStaffCode: async (staffCode: string): Promise<CoachDetail> => {
    const response = await javaApi.get(`/coaches/${staffCode}`);
    return normalizeCoachDetail(response.data);
  },

  createCoach: async (
    coachData: CoachCreateRequest,
    imageFile?: File | null,
  ): Promise<CoachDetail> => {
    const response = await javaApi.post(
      "/coaches",
      toMultipartFormData(coachData, imageFile),
    );
    return normalizeCoachDetail(response.data);
  },

  updateCoach: async (
    personId: string,
    coachData: CoachUpdateRequest,
    imageFile?: File | null,
  ): Promise<CoachDetail> => {
    const response = await javaApi.put(
      `/coaches/${personId}`,
      toMultipartFormData(coachData, imageFile),
    );
    return normalizeCoachDetail(response.data);
  },

  deleteCoach: async (id: number): Promise<void> => {
    await javaApi.delete(`/coaches/${id}`);
  },
};
