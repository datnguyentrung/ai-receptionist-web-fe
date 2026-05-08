import type { SkillLevel } from "../../config/constants/SkillEnums";

export interface Fitness {
  fitnessLevel: number; // Overall fitness level based on the activity
  duration: number; // Duration in minutes
  amount: number; // Amount of the activity (e.g., distance in kilometers, weight lifted in kilograms)
  skillLevel: SkillLevel; // Skill level of the activity
}
