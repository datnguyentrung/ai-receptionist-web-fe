import type { SkillLevel } from "../../config/constants/SkillEnums";
import type { CoachSummary } from "../Core/CoachTypes";
import type { StudentSummary } from "../Core/StudentTypes";

export interface FitnessRecordResponse {
  id: number;
  assessmentDate: string | Date;
  studentSummary: StudentSummary;
  recordedByCoach: CoachSummary;
}

export interface FitnessMetrics {
  duration: number; // Duration in minutes
  amount: number; // Amount of the activity (e.g., distance in kilometers, weight lifted in kilograms)
  skillLevel: SkillLevel; // Skill level of the activity
  durationLevel: number; // Level of duration (e.g., 1 for short, 2 for medium, 3 for long)
  amountLevel: number; // Level of amount (e.g., 1 for low, 2 for medium, 3 for high)
  fitnessLevel: number; // Overall fitness level based on the activity
  isQualified: boolean; // Whether the activity meets the qualification criteria
}

export interface FitnessRecordCreateRequest {
  assessmentDate: string | Date;
  studentCode: string;
  coachId: string;
  duration: number; // Duration in minutes
  amount: number; // Amount of the activity (e.g., distance in kilometers, weight lifted in kilograms)
  skillLevel: SkillLevel; // Skill level of the activity
}

export interface FitnessRecordUpdateRequest {
  assessmentDate: string | Date;
  duration: number; // Duration in minutes
  amount: number; // Amount of the activity (e.g., distance in kilometers, weight lifted in kilograms)
  skillLevel: SkillLevel; // Skill level of the activity
}
